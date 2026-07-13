import { Request, Response } from "express";
import { sendResponse } from "../../utils/sentResponse";
import { status } from "http-status";
import { authService } from "./auth.service";

const userLogin = async (req: Request, res: Response) => {
  const payload = req.body;
  const { refreshToken, accessToken } =
    await authService.userLoginService(payload);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 12, // 12 hour
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
  });

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Successfully Login !",
    data: { accessToken, refreshToken },
  });
};

export const authController = {
  userLogin,
};
