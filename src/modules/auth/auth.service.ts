import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import Jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import config from "../../config";

interface UserLoginInfo {
  email: string;
  password: string;
}

const userLoginService = async (payload: UserLoginInfo) => {
  const { email, password } = payload;
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("Oops Invalid user crediantial!");
  }

  const isMatchPass = await bcrypt.compare(password, user.password);
  if (!isMatchPass) {
    throw new Error("Oops Invalid user crediantial!");
  }

  // create the access token and refresh token
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = Jwt.sign(jwtPayload, config.jwt_access_secret, {
    expiresIn: config.jwt_access_expires_in,
  } as SignOptions);

  const refreshToken = Jwt.sign(jwtPayload, config.jwt_refresh_secret, {
    expiresIn: config.jwt_refresh_expires_in,
  } as SignOptions);

  return {
    accessToken,
    refreshToken,
  };
};

export const authService = {
  userLoginService,
};
