import { prisma } from "../../lib/prisma";

const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },

    include: {
      _count: {
        select: {
          services: true,
        },
      },
    },
  });

  return categories;
};

export const CategoryService = {
  getAllCategories,
};
