import { Result } from "pg";
import {
  BookingStatus,
  Prisma,
  Role,
  UserStatus,
} from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { IBookingQuery, IUpdateUser, IUser } from "./admin.interface";

const getAllUser = async (query: IUser) => {
  const limit = query.limit ? Number(query.limit) : 10;

  const page = query.page ? Number(query.page) : 1;

  const skip = (page - 1) * limit;

  const allowedSortFields = ["name", "email", "createdAt"] as const;

  const sortBy = allowedSortFields.includes(query.sortBy as any)
    ? query.sortBy
    : "createdAt";

  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  const andAllUser: Prisma.UserWhereInput[] = [];

  andAllUser.push({
    role: {
      in: [Role.CUSTOMER, Role.TECHNICIAN],
    },
  });

  if (query.searchUser) {
    andAllUser.push({
      OR: [
        {
          name: {
            contains: query.searchUser,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: query.searchUser,
            mode: "insensitive",
          },
        },
      ],
    });
  }
  if (query.name) {
    andAllUser.push({
      name: {
        contains: query.name,
        mode: "insensitive",
      },
    });
  }
  if (query.email) {
    andAllUser.push({
      email: {
        contains: query.email,
        mode: "insensitive",
      },
    });
  }
  if (query.status) {
    andAllUser.push({
      status: {
        in: query.status
          .split(",")
          .map((status) => status.trim() as UserStatus),
      },
    });
  }

  if (query.role && query.role !== "ADMIN") {
    andAllUser.push({
      role: query.role as Role,
    });
  }

  const result = await prisma.user.findMany({
    where: {
      AND: andAllUser,
    },
    include: {
      technicianProfile: true,
    },

    skip,
    take: limit,
    orderBy: {
      [sortBy as string]: sortOrder,
    },
  });
  const totalUser = await prisma.user.count({
    where: {
      AND: andAllUser,
    },
  });

  return {
    data: result,
    meta: {
      page: page,
      limit: limit,
      total: totalUser,
      totalPages: Math.ceil(totalUser / limit),
    },
  };
};

const updateUser = async (id: string, payload: IUpdateUser) => {
  // console.log("djlflf Id", id);
  const existingUser = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  const result = await prisma.user.update({
    where: {
      id,
    },
    data: {
      role: payload.role,
      status: payload.status,
    },
    include: {
      technicianProfile: true,
    },
  });

  return result;
};

const getAllBookings = async (query: IBookingQuery | any) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const allowedSortFields = ["scheduledAt", "createdAt", "status"] as const;
  const sortBy = allowedSortFields.includes(query.sortBy)
    ? query.sortBy
    : "createdAt";
  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  const andConditions: Prisma.BookingWhereInput[] = [];

  // Search by Customer Name or Email
  if (query.name) {
    andConditions.push({
      OR: [
        {
          customer: {
            name: {
              contains: query.name,
              mode: "insensitive",
            },
          },
        },
        {
          customer: {
            email: {
              contains: query.name,
              mode: "insensitive",
            },
          },
        },
      ],
    });
  }

  // Date Filter Support
  if (query.date) {
    const startOfDay = new Date(query.date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(query.date);
    endOfDay.setHours(23, 59, 59, 999);

    andConditions.push({
      scheduledAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    });
  }

  // FIXED: Status Filter with uppercase safety conversion
  if (query.status) {
    const statuses = query.status
      .split(",")
      .map((s: string) => s.trim().toUpperCase() as BookingStatus);

    andConditions.push({
      status: {
        in: statuses,
      },
    });
  }

  if (query.customerId) {
    andConditions.push({
      customerId: query.customerId,
    });
  }

  const result = await prisma.booking.findMany({
    where: {
      AND: andConditions.length > 0 ? andConditions : undefined,
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      technician: true,
      service: {
        include: {
          category: true,
        },
      },
      payment: true,
      review: true,
    },
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const totalBookings = await prisma.booking.count({
    where: { AND: andConditions.length > 0 ? andConditions : undefined },
  });

  return {
    data: result,
    meta: {
      page,
      limit,
      total: totalBookings,
      totalPages: Math.ceil(totalBookings / limit),
    },
  };
};

const getAdminOverview = async (id: string) => {
  const [
    admin,
    totalUsers,
    totalCustomers,
    totalTechnicians,
    totalBookings,
    bookingStatus,
    revenue,
    todayBookings,
    thisMonthBookings,
  ] = await Promise.all([
    // Admin information
    prisma.user.findUnique({
      where: {
        id,
        role: Role.ADMIN,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),

    // Total users
    prisma.user.count(),

    // Total customers
    prisma.user.count({
      where: {
        role: Role.CUSTOMER,
      },
    }),

    // Total technicians
    prisma.user.count({
      where: {
        role: Role.TECHNICIAN,
      },
    }),

    // Total bookings
    prisma.booking.count(),

    // Booking status summary
    prisma.booking.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    }),

    // Total revenue
    prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: "COMPLETED",
      },
    }),

    // Today bookings
    prisma.booking.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),

    // Current month bookings
    prisma.booking.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
  ]);

  if (!admin) {
    throw new Error("Admin not found");
  }

  const statusSummary = {
    PENDING: 0,
    PAID: 0,
    ACCEPTED: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  };

  bookingStatus.forEach((item) => {
    if (item.status in statusSummary) {
      statusSummary[item.status as keyof typeof statusSummary] =
        item._count.status;
    }
  });

  return {
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      role: admin.role,
      status: admin.status,
      joinedAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    },

    overview: {
      users: {
        total: totalUsers,
        customers: totalCustomers,
        technicians: totalTechnicians,
      },

      bookings: {
        total: totalBookings,
        today: todayBookings,
        thisMonth: thisMonthBookings,
        pending: statusSummary.PENDING,
        paid: statusSummary.PAID,
        accepted: statusSummary.ACCEPTED,
        inProgress: statusSummary.IN_PROGRESS,
        completed: statusSummary.COMPLETED,
        cancelled: statusSummary.CANCELLED,
      },

      revenue: {
        total: revenue._sum.amount || 0,
      },
    },
  };
};

export const adminService = {
  getAllUser,
  updateUser,
  getAllBookings,
  getAdminOverview,
};
