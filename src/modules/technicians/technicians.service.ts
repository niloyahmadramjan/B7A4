import { rmSync } from "node:fs";
import { BookingStatus, Prisma, Role } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import {
  IAvailabilitySlot,
  ITechnicianQuery,
  ITechnicianUpdate,
} from "./technicians.interface";

const getAllTechnicians = async (query: ITechnicianQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;

  const page = query.page ? Number(query.page) : 1;

  const skip = (page - 1) * limit;

  const allowedSortFields = [
    "price",
    "title",
    "createdAt",
    "duration",
  ] as const;

  const sortBy = allowedSortFields.includes(query.sortBy as any)
    ? query.sortBy
    : "createdAt";

  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  const andConditions: Prisma.TechnicianProfileWhereInput[] = [];

  if (query.searchItem) {
    andConditions.push({
      OR: [
        {
          user: {
            name: {
              contains: query.searchItem,
              mode: "insensitive",
            },
          },
        },
        {
          bio: {
            contains: query.searchItem,
            mode: "insensitive",
          },
        },
      ],
    });
  }
  if (query.location) {
    andConditions.push({
      location: {
        contains: query.location,
        mode: "insensitive",
      },
    });
  }

  if (query.category) {
    andConditions.push({
      services: {
        some: {
          category: {
            name: {
              contains: query.category,
              mode: "insensitive",
            },
          },
        },
      },
    });
  }

  if (query.minPrice || query.maxPrice) {
    andConditions.push({
      services: {
        some: {
          price: {
            gte: query.minPrice ? Number(query.minPrice) : undefined,
            lte: query.maxPrice ? Number(query.maxPrice) : undefined,
          },
        },
      },
    });
  }

  if (query?.rating) {
    andConditions.push({
      rating: {
        gte: Number(query.rating),
      },
    });
  }

  if (query.minExperience && query.maxExperience) {
    andConditions.push({
      experience: {
        gte: query.minExperience ? Number(query.minExperience) : undefined,
        lte: query.maxExperience ? Number(query.maxExperience) : undefined,
      },
    });
  }

  const technicians = await prisma.technicianProfile.findMany({
    where: {
      AND: andConditions,
    },
    include: {
      services: true,
      availability: true,
    },

    skip: skip,
    take: limit,
    orderBy: {
      [sortBy as string]: sortOrder,
    },
  });

  const totalServiceCount = await prisma.technicianProfile.count({
    where: {
      AND: andConditions,
    },
  });

  return {
    data: technicians,
    meta: {
      page: page,
      limit: limit,
      total: totalServiceCount,
      totalPages: Math.ceil(totalServiceCount / limit),
    },
  };
};

const getTechnicianById = async (id: string) => {
  const result = await prisma.technicianProfile.findUniqueOrThrow({
    where: {
      id: id,
    },
    include: {
      services: true,
      availability: true,
      reviews: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
        },
      },
    },
  });

  return result;
};

const getMyProfile = async (id: string) => {
  // console.log("User ID:", id);

  const user = await prisma.user.findUnique({
    where: { id },
  });

  // console.log(user);

  const result = await prisma.user.findUniqueOrThrow({
    where: { id },
    include: {
      technicianProfile: {
        include: {
          services: true,
          availability: true,
          reviews: true,
        },
      },
    },
  });

  return result;
};

const updateTechnicianProfile = async (
  id: string,
  updateData: ITechnicianUpdate,
) => {
  const existingTechnician = await prisma.technicianProfile.findUnique({
    where: {
      userId: id,
    },
    include: {
      user: true,
    },
  });

  if (!existingTechnician) {
    throw new Error(`Technician with ID ${id} not found`);
  }

  if (existingTechnician.user.role !== Role.TECHNICIAN) {
    throw new Error(`You are not authorized to update this technician profile`);
  }

  const result = await prisma.$transaction(async (tex) => {
    if (updateData.name) {
      await tex.user.update({
        where: {
          id,
        },
        data: {
          name: updateData.name,
        },
      });
    }

    await tex.technicianProfile.update({
      where: {
        userId: id,
      },
      data: {
        bio: updateData.bio,
        experience: updateData.experience,
        location: updateData.location,
      },
    });

    return await tex.technicianProfile.findUnique({
      where: {
        userId: id,
      },
      include: {
        user: {
          omit: {
            password: true,
          },
        },
      },
    });
  });

  return result;
};

const getTechnicianBooking = async (
  tecId: string,
  query: Record<string, any>,
) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { userId: tecId },
  });

  if (!technicianProfile) {
    throw new Error("Not Found technician Profile");
  }

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  // Fetch paginated bookings and total count concurrently
  const [result, total] = await Promise.all([
    prisma.booking.findMany({
      where: { technicianId: technicianProfile.id },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          omit: { password: true },
        },
        review: true,
        payment: true,
        service: true,
      },
    }),
    prisma.booking.count({
      where: { technicianId: technicianProfile.id },
    }),
  ]);

  const totalPage = Math.ceil(total / limit);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
    data: result,
  };
};

const updateTechnicianBookingStatus = async (
  userId: string,
  bookingId: string,
  action: BookingStatus,
) => {
  const technicianProfile = await prisma.technicianProfile.findUniqueOrThrow({
    where: { userId },
  });

  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.technicianId !== technicianProfile.id) {
    throw new Error("You are not allowed to update this booking");
  }

  if (action === BookingStatus.IN_PROGRESS) {
    if (booking.status !== BookingStatus.PAID) {
      throw new Error("Booking must be paid before starting.");
    }
  }

  if (action === BookingStatus.COMPLETED) {
    if (booking.status !== BookingStatus.IN_PROGRESS) {
      throw new Error("Booking must be in progress before completing.");
    }
  }

  const updatedBooking = await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      status: action,
    },
  });

  return updatedBooking;
};

const updateAvailability = async (
  userId: string,
  slots: IAvailabilitySlot[],
) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });
  if (!technicianProfile) {
    throw new Error("Not found technicianProfile");
  }

  // delete old availability
  await prisma.availability.deleteMany({
    where: {
      technicianId: technicianProfile.id,
    },
  });

  await prisma.availability.createMany({
    data: slots.map((slot) => ({
      technicianId: technicianProfile.id,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: slot.isAvailable ?? true,
    })),
  });

  const result = await prisma.availability.findMany({
    where: {
      technicianId: technicianProfile.id,
    },
  });

  return result;
};

const getTechnicianDashboardOverview = async (userId: string) => {
  const technicianProfile = await prisma.technicianProfile.findUniqueOrThrow({
    where: {
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  );

  const [
    totalServices,
    totalBookings,
    pendingBookings,
    completedBookings,
    totalReviews,
    upcomingBookingsCount,
    revenueData,
    monthRevenueData,
  ] = await Promise.all([
    // total services
    prisma.service.count({
      where: {
        technicianId: technicianProfile.id,
      },
    }),

    // total bookings
    prisma.booking.count({
      where: {
        technicianId: technicianProfile.id,
      },
    }),

    // pending bookings
    prisma.booking.count({
      where: {
        technicianId: technicianProfile.id,
        status: BookingStatus.REQUESTED,
      },
    }),

    // completed bookings
    prisma.booking.count({
      where: {
        technicianId: technicianProfile.id,
        status: BookingStatus.COMPLETED,
      },
    }),

    // reviews
    prisma.review.count({
      where: {
        technicianId: technicianProfile.id,
      },
    }),

    // upcoming count
    prisma.booking.count({
      where: {
        technicianId: technicianProfile.id,
        status: {
          in: [
            BookingStatus.REQUESTED,
            BookingStatus.ACCEPTED,
            BookingStatus.PAID,
            BookingStatus.IN_PROGRESS,
          ],
        },
        scheduledAt: {
          gte: new Date(),
        },
      },
    }),

    // total revenue
    prisma.booking.findMany({
      where: {
        technicianId: technicianProfile.id,
        status: BookingStatus.COMPLETED,
      },
      select: {
        service: {
          select: {
            price: true,
          },
        },
      },
    }),

    // current month revenue
    prisma.booking.findMany({
      where: {
        technicianId: technicianProfile.id,
        status: BookingStatus.COMPLETED,
        updatedAt: {
          gte: startOfMonth,
        },
      },
      select: {
        service: {
          select: {
            price: true,
          },
        },
      },
    }),
  ]);

  const totalRevenue = revenueData.reduce(
    (sum, booking) => sum + booking.service.price,
    0,
  );

  const monthlyRevenue = monthRevenueData.reduce(
    (sum, booking) => sum + booking.service.price,
    0,
  );

  return {
    profile: {
      id: technicianProfile.id,
      name: technicianProfile.user.name,
      email: technicianProfile.user.email,
      phone: technicianProfile.user.phone,
      bio: technicianProfile.bio,
      location: technicianProfile.location,
      experience: technicianProfile.experience,
      rating: technicianProfile.rating,
      totalReviews: technicianProfile.totalReviews,
    },

    overview: {
      totalServices,
      totalBookings,
      pendingBookings,
      completedBookings,
      totalReviews,
      upcomingBookings: upcomingBookingsCount,

      revenue: {
        total: totalRevenue,
        currentMonth: monthlyRevenue,
      },
    },
  };
};

export const technicianService = {
  getAllTechnicians,
  getTechnicianById,
  updateTechnicianProfile,
  getTechnicianBooking,
  updateTechnicianBookingStatus,
  updateAvailability,
  getMyProfile,
  getTechnicianDashboardOverview,
};
