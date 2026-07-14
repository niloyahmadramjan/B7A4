import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsynce";
import { servicesService } from "./services.service";
import { sendResponse } from "../../utils/sentResponse";
import status from "http-status";

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
  getAllServices,
};
