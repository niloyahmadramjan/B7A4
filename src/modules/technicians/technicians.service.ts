import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { ITechnicianQuery } from "./technicians.interface";

const getAllTechnicians = async (query: ITechnicianQuery) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const skip = (page - 1) * limit;

  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";

  const andConditions: Prisma.TechnicianProfileWhereInput[] = [];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          bio: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          location: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          user: {
            name: {
              contains: query.searchTerm,
              mode: "insensitive",
            },
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

  if (query.minRate || query.maxRate) {
    andConditions.push({
      hourlyRate: {
        gte: query.minRate ? Number(query.minRate) : undefined,
        lte: query.maxRate ? Number(query.maxRate) : undefined,
      },
    });
  }

  if (query.minRating) {
    andConditions.push({
      averageRating: {
        gte: Number(query.minRating),
      },
    });
  }

  if (query.isAvailable !== undefined) {
    andConditions.push({
      isAvailable: query.isAvailable === "true",
    });
  }

  const where: Prisma.TechnicianProfileWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const technicians = await prisma.technicianProfile.findMany({
    where,

    take: limit,

    skip,

    orderBy: {
      [sortBy]: sortOrder,
    },

    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
        },
      },

      services: {
        include: {
          category: true,
        },
      },

      _count: {
        select: {
          services: true,
          reviews: true,
        },
      },
    },
  });

  const total = await prisma.technicianProfile.count({
    where,
  });

  return {
    data: technicians,

    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const TechnicianService = {
  getAllTechnicians,
};
