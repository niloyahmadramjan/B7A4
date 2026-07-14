import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsynce";
import { servicesService } from "./services.service";
import { sendResponse } from "../../utils/sentResponse";
import status from "http-status";

const createService = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const id = req.user?.id;

  const result = await servicesService.createService(payload, id!);
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Get service data successfully",
    data: { result },
  });
});

const getAllServices = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const { data, meta } = await servicesService.getAllServices(query);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Get service data successfully",
    data: { data, meta },
  });
});

export const serviceController = {
  createService,
  getAllServices,
};
