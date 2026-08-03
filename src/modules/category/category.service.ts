import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

interface ICategory {
  name?: string;
  description?: string;
  limit?: number;
  page?: number;
  sortBy?: "title" | "createdAt" | "duration";
  sortOrder?: "asc" | "desc";
  searchItem?: string;
}

const createCategories = async (name: string, description: string) => {
  if (!name) {
    throw new Error("Category name is required");
  }
  const existing = await prisma.category.findUnique({
    where: { name },
  });
  if (existing) {
    throw new Error("Category already exists");
  }
  const result = await prisma.category.create({
    data: {
      name,
      description,
    },
  });

  return result;
};

const getAllCategories = async (query: ICategory) => {
  const limit = query.limit ? Number(query.limit) : 10;

  const page = query.page ? Number(query.page) : 1;

  const skip = (page - 1) * limit;

  const allowedSortFields = ["title", "createdAt", "duration"] as const;

  const sortBy = allowedSortFields.includes(query.sortBy as any)
    ? query.sortBy
    : "createdAt";

  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  const andConditions: Prisma.CategoryWhereInput[] = [];

  if (query.searchItem) {
    andConditions.push({
      OR: [
        {
          name: {
            contains: query.searchItem,
            mode: "insensitive",
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

  if (query.name) {
    andConditions.push({
      name: {
        contains: query.name,
        mode: "insensitive",
      },
    });
  }
  if (query.description) {
    andConditions.push({
      description: {
        contains: query.description,
        mode: "insensitive",
      },
    });
  }

  const result = await prisma.category.findMany({
    where: {
      AND: andConditions,
    },
    skip: skip,
    take: limit,
    orderBy: {
      [sortBy as string]: sortOrder,
    },
  });

  const totalCategoriesCount = await prisma.category.count({
    where: {
      AND: andConditions,
    },
  });
  return {
    data: result,
    total: totalCategoriesCount,
    page: page,
    limit: limit,
    totalPages: Math.ceil(totalCategoriesCount / limit),
  };
};

const deleteCategory = async (categoryId: string) => {
  const existingCategory = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!existingCategory) {
    throw new Error("Category not found");
  }

  await prisma.category.delete({
    where: { id: categoryId },
  });

  return { message: "Category deleted successfully" };
};

const updateCategory = async (categoryId: string,
  name: string,
  description: string,
) => {
  const existingCategory = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!existingCategory) {
    throw new Error("Category not found");
  }

  const updatedCategory = await prisma.category.update({
    where: { id: categoryId },
    data: {
      name,
      description,
    },
  });

  return updatedCategory;
}

export const categoryService = {
  createCategories,
  getAllCategories,
  deleteCategory,
  updateCategory
};
