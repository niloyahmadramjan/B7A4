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
  console.log("djlflf Id", id);
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

const getAllBookings = async (query: IBookingQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const allowedSortFields = ["scheduledAt", "createdAt", "status"] as const;

  const sortBy = allowedSortFields.includes(query.sortBy as any)
    ? query.sortBy
    : "createdAt";

  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  const andConditions: Prisma.BookingWhereInput[] = [];

  if (query.searchItem) {
    andConditions.push({
      OR: [
        {
          customer: {
            name: {
              contains: query.searchItem,
              mode: "insensitive",
            },
          },
        },
        {
          customer: {
            email: {
              contains: query.searchItem,
              mode: "insensitive",
            },
          },
        },
      ],
    });
  }

  if (query.status) {
    andConditions.push({
      status: {
        in: query.status.split(",").map((s) => s.trim() as BookingStatus),
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
      AND: andConditions,
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
      [sortBy as string]: sortOrder,
    },
  });

  const totalBookings = await prisma.booking.count({
    where: { AND: andConditions },
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

export const adminService = {
  getAllUser,
  updateUser,
  getAllBookings,
};
