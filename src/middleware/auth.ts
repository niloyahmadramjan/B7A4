import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsynce";
import { jwtUtils } from "../utils/jwt";
import config from "../config/index.js";
import { JwtPayload } from "jsonwebtoken";
import { Role } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma";

declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        name: string;
        id: string;
        role: Role;
      };
    }
  }
}
export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // get the token from cookies and headers
    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization?.split(" ")[1]
        : req.headers.authorization;

    if (!token) {
      throw new Error(
        "you are not logged in , Please log in to access this resource.",
      );
    }

    // if have the token then verify token is valid or not
    const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);
    if (!verifiedToken.success) {
      throw new Error(verifiedToken.error);
    }

    const { name, email, id, role } = verifiedToken.data as JwtPayload;

    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw new Error(
        "Forbidden access. You don't have permission to access this resource",
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error("User not found. Please log in again");
    }
    console.log(email, name, id, role, "user decoded data");

    req.user = {
      email,
      name,
      id,
      role,
    };
    next();
  });
};
