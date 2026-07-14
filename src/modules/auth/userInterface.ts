import { UserRole } from "../../../generated/prisma/enums";

export interface RegisterUserPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  avatar?: string;
  role?: UserRole;
}

export interface UserLoginInfo {
  email: string;
  password: string;
}
