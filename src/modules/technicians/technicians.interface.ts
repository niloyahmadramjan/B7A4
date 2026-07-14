import { Prisma } from "../../../generated/prisma/client";


export interface ITechnicianQuery {
  page?: string;
  limit?: string;

  searchTerm?: string;

  location?: string;

  minRate?: string;
  maxRate?: string;

  minRating?: string;

  isAvailable?: string;

  sortBy?: keyof Prisma.TechnicianProfileOrderByWithRelationInput;
  sortOrder?: Prisma.SortOrder;
}