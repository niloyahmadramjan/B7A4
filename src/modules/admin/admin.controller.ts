import { NextFunction, Request, Response } from "express";
import statusCode from "http-status";
import { catchAsync } from "../../utils/catchAsynce";
import { sendResponse } from "../../utils/sentResponse";
import { adminService } from "./admin.service";

const getAllUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const quary = req.query;
    const result = await adminService.getAllUser(quary);
    sendResponse(res, {
      success: true,
      statusCode: statusCode.OK,
      message: "User get successfully",
      data: result,
    });
  },
);

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await adminService.updateUser(id as string, req.body);
  sendResponse(res, {
    success: true,
    statusCode: statusCode.OK,
    message: "User updated successfully",
    data: result,
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const quary = req.query;
  const result = await adminService.getAllBookings(quary);
  sendResponse(res, {
    success: true,
    statusCode: statusCode.OK,
    message: "Bookings retrieved successfully",
    data: result,
  });
});
export const adminController = {
  getAllUser,
  updateUser,
  getAllBookings,
};
