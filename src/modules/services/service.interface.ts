import { Prisma } from "../../../generated/prisma/client";

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


export interface ICreateService {

    technicianId: string;

    categoryId: string;

    title: string;

    description: string;

    price: number;

    estimatedHours?: number;

}