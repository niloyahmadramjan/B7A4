import { Request, Response } from "express";
import { userService } from "./user.service";
import { sendResponse } from "../../utils/sentResponse";
import { status } from "http-status";

const registerUser = (req: Request, res: Response) => {
  const payload = req.body;
  const user = userService.userRegisterService(payload);

  sendResponse(res, {
    success: true,
    statusCode: status.CREATED,
    message: "User registtered successfully",
    data: { user },
  });
};

export const userController = {
  registerUser,
};
