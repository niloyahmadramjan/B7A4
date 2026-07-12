import { Request, Response } from "express";
import { authService } from "./auth.service";

const registerUser = (req: Request, res: Response) => {
  const payload = "user";
  const data = authService.userRegisterService(payload);
  res.status(200).json({
    data: data,
  });
};

export const authController = {
  registerUser,
};
