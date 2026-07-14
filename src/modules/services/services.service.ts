/**
Method	Endpoint	Description
GET	/api/services	Get all services with filters (type, location, rating)

*/

import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

export interface IServiceQuery {
  page?: string;

  limit?: string;

  searchTerm?: string;

  title?: string;

  categoryId?: string;

  technicianId?: string;

  minPrice?: string;

  maxPrice?: string;

  estimatedHours?: string;

  isActive?: string;

  sortBy?: keyof Prisma.ServiceOrderByWithRelationInput;

  sortOrder?: "asc" | "desc";
}

const getAllServices = async (query: IServiceQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;

  const page = query.page ? Number(query.page) : 1;

  const skip = (page - 1) * limit;

  const sortBy = query.sortBy ? query.sortBy : "createdAt";

  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  const andConditions: Prisma.ServiceWhereInput[] = [];

  // Search title + description

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },

        {
          description: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  // exact title filter

  if (query.title) {
    andConditions.push({
      title: {
        contains: query.title,
        mode: "insensitive",
      },
    });
  }

  // category filter

  if (query.categoryId) {
    andConditions.push({
      categoryId: query.categoryId,
    });
  }

  // technician filter

  if (query.technicianId) {
    andConditions.push({
      technicianId: query.technicianId,
    });
  }

  // price range

  if (query.minPrice || query.maxPrice) {
    andConditions.push({
      price: {
        gte: query.minPrice ? Number(query.minPrice) : undefined,

        lte: query.maxPrice ? Number(query.maxPrice) : undefined,
      },
    });
  }

  // estimated hours

  if (query.estimatedHours) {
    andConditions.push({
      estimatedHours: Number(query.estimatedHours),
    });
  }

  // active filter

  if (query.isActive !== undefined) {
    andConditions.push({
      isActive: query.isActive === "true",
    });
  }

  const whereCondition: Prisma.ServiceWhereInput = {
    AND: andConditions,
  };

  const services = await prisma.service.findMany({
    where: whereCondition,

    take: limit,

    skip,

    orderBy: {
      [sortBy]: sortOrder,
    },

    include: {
      category: true,

      technician: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            },
          },
        },
      },
    },
  });

  const total = await prisma.service.count({
    where: whereCondition,
  });

  return {
    data: services,

    meta: {
      page,

      limit,

      total,

      totalPages: Math.ceil(total / limit),
    },
  };
};

export const servicesService = {
  getAllServices,
};
