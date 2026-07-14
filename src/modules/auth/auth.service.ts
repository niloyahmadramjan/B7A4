import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { SignOptions } from "jsonwebtoken";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";
import { RegisterUserPayload, UserLoginInfo } from "./userInterface";

const userRegisterService = async (payload: RegisterUserPayload) => {
  const { name, email, password, phone, avatar } = payload;
  const isUserExist = await prisma.user.findUnique({
    where: { email },
  });
  if (isUserExist) {
    throw new Error("User already exists");
  }

  const hastPass = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const createUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hastPass,
      avatar,
      phone,
    },
    omit: {
      password: true,
    },
  });

  return createUser;
};

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

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const geMeService = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    omit: {
      password: true,
    },
  });

  if (!user) {
    throw new Error("user not find!");
  }

  return user;
};

export const authService = {
  userLoginService,
  userRegisterService,
  geMeService,
};
