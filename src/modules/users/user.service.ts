import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { RegisterUserPayload } from "./userInterface";
import config from "../../config";

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
  });

  return createUser;
};

export const userService = {
  userRegisterService,
};
