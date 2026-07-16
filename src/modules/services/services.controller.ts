import { NextFunction, Request, Response } from "express";

import httpStatus from "http-status";
import { service } from "./services.service";
import { catchAsync } from "../../utils/catchAsynce";
import { sendResponse } from "../../utils/sentResponse";

const createService = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const technicianId = req.user?.id;
    const payload = req.body;
    const result = await service.createService(payload, technicianId as string);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Service created successfully",
      data: result,
    });
  },
);

const getAllServices = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const quary = req.query;
    const result = await service.getAllService(quary);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Service fetched successfully",
      data: result,
    });
  },
);

export const serviceController = {
  createService,
  getAllServices,
};
