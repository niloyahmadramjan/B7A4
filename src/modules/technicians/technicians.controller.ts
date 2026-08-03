import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsynce";
import { technicianService } from "./technicians.service";
import { sendResponse } from "../../utils/sentResponse";
const getAllTechnicians = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await technicianService.getAllTechnicians(query);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Technician fetched successfully",
      data: result,
    });
  },
);

const getTechnicianById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await technicianService.getTechnicianById(id as string);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Technician fetched successfully",
      data: result,
    });
  },
);

const getMyProfileInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.id;
    console.log(id, "from user get profile info")
    const result = await technicianService.getMyProfile(id as string);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "My profile fetched successfully",
      data: result,
    });
  }
);

const updateTechnicianProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.id;
    const updateData = req.body;
    const result = await technicianService.updateTechnicianProfile(
      id as string,
      updateData,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Technician profile updated successfully",
      data: result,
    });
  },
);

const getTechnicianBookings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const result = await technicianService.getTechnicianBooking(
      userId as string,
      req.query,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Technician bookings fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;
  const { action } = req.body;

  const result = await technicianService.updateTechnicianBookingStatus(
    userId as string,
    id as string,
    action,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Booking  status update successfully  ",
    data: result,
  });
});

const updateAvailability = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { slots } = req.body;

  const result = await technicianService.updateAvailability(
    userId as string,
    slots,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Availability updated successfully",
    data: result,
  });
});

const getTechnicianDashboardOverview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const result = await technicianService.getTechnicianDashboardOverview(
      userId as string,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Technician dashboard overview fetched successfully",
      data: result,
    });
  },
);  

export const technicianController = {
  getAllTechnicians,
  getTechnicianById,
  updateTechnicianProfile,
  getTechnicianBookings,
  updateBookingStatus,
  updateAvailability,
  getMyProfileInfo,
  getTechnicianDashboardOverview
};
