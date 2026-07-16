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
      userId: id,
    },
    include: {
      services: true,
      availability: true,
      reviews: true,
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

const getTechnicianBooking = async (tecId: string) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: {
      userId: tecId,
    },
  });
  if (!technicianProfile) {
    throw new Error("Not Found technician Profile");
  }

  const result = await prisma.booking.findMany({
    where: {
      technicianId: technicianProfile.id,
    },
    include: {
      customer: {
        omit: {
          password: true,
        },
      },
      review: true,
      payment: true,
      service: true,
    },
  });
  console.log(result);
  return result;
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

export const technicianService = {
  getAllTechnicians,
  getTechnicianById,
  updateTechnicianProfile,
  getTechnicianBooking,
  updateTechnicianBookingStatus,
  updateAvailability,
};
