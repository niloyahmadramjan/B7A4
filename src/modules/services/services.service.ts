import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { IService, IServiceQuery } from "./service.interface";

const createService = async (payload: IService, technicianId: string) => {
  const { categoryId, title, description, price, duration } = payload;
  if (!categoryId || !title || !price || !duration) {
    throw new Error("All fields are required");
  }
  console.log(technicianId);
  const technician = await prisma.technicianProfile.findUnique({
    where: { userId: technicianId },
  });

  if (!technician) {
    throw new Error(
      "Technician profile not found ! pleace create your profile first",
    );
  }
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });
  if (!category) {
    throw new Error("Category not found");
  }

  const result = await prisma.service.create({
    data: {
      technicianId: technician.id,
      categoryId,
      title,
      description,
      price,
      duration,
    },
  });
  return result;
};

const getAllService = async (query: IServiceQuery) => {
  console.log("query", query);

  const limit = query.limit ? Number(query.limit) : 10;

  const page = query.page ? Number(query.page) : 1;

  const skip = (page - 1) * limit;

  const sortBy = query.sortBy ? query.sortBy : "createdAt";

  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  const andConditions: Prisma.ServiceWhereInput[] = [];

  if (query.searchItem) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: query.searchItem,
            mode: "insensitive",
          },
        },
        {
          category: {
            name: {
              contains: query.searchItem,
              mode: "insensitive",
            },
          },
        },
        {
          description: {
            contains: query.searchItem,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (query.title) {
    andConditions.push({
      title: {
        contains: query.title,
        mode: "insensitive",
      },
    });
  }

  if (query.category) {
    andConditions.push({
      category: {
        name: {
          contains: query.category,
          mode: "insensitive",
        },
      },
    });
  }

  if (query.location) {
    andConditions.push({
      technician: {
        location: {
          contains: query.location,
          mode: "insensitive",
        },
      },
    });
  }

  if (query.minPrice || query.maxPrice) {
    andConditions.push({
      price: {
        gte: query.minPrice ? Number(query.minPrice) : undefined,
        lte: query.maxPrice ? Number(query.maxPrice) : undefined,
      },
    });
  }

  if (query.rating) {
    andConditions.push({
      technician: {
        rating: {
          gte: Number(query.rating),
        },
      },
    });
  }
  const service = await prisma.service.findMany({
    where: {
      AND: andConditions,
    },
    take: limit,
    skip: skip,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const totalServiceCount = await prisma.service.count({
    where: {
      AND: andConditions,
    },
  });

  return {
    data: service,
    meta: {
      page: page,
      limit: limit,
      total: totalServiceCount,
      totalPages: Math.ceil(totalServiceCount / limit),
    },
  };
};

export const service = {
  createService,
  getAllService,
};
