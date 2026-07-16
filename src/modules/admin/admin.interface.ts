import { Role, UserStatus } from "../../../generated/prisma/enums";

export interface IUser {
  searchUser?: string;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IUpdateUser {
  role?: Role;
  status?: UserStatus;
}

export interface IBookingQuery {
  searchItem?: string;
  status?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";

  customerId?: string;
  technicianId?: string;
}
