import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsynce";
import { TechnicianService } from "./technicians.service";
import { sendResponse } from "../../utils/sentResponse";
import status from "http-status";

const getAllTechnicians = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const { data, meta } = await TechnicianService.getAllTechnicians(query);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Get technicians data successfully",
    data: { data, meta },
  });
});

export const technicianController = {
  getAllTechnicians,
};
