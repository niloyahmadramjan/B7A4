import { Request, Response } from "express";
import { userService } from "./user.service";
import { sendResponse } from "../../utils/sentResponse";
import { status } from "http-status";

const registerUser = async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await userService.userRegisterService(payload);
  console.log(result, "user data ");
  sendResponse(res, {
    success: true,
    statusCode: status.CREATED,
    message: "User registration successfully",
    data: result,
  });
};

export const userController = {
  registerUser,
};
