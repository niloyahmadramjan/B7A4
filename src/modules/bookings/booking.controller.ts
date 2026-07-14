import { Request, Response } from "express";
import { BookingService } from "./booking.service";
import { sendResponse } from "../../utils/sentResponse";
import status from "http-status";

// POST /api/bookings

const createBooking = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const payload = req.body;

  const result = await BookingService.createBooking(userId!, payload);

  sendResponse(res, {
    success: true,
    statusCode: status.CREATED,
    message: "Booking created successfully",
    data: { result },
  });
};

// GET /api/bookings

const getMyBookings = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const result = await BookingService.getMyBookings(userId!);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Bookings retrieved successfully",
    data: { result },
  });
};

// GET /api/bookings/:id

const getBookingById = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const bookingId = req.params.id;

  const result = await BookingService.getBookingById(
    bookingId as string,
    userId as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Booking details retrieved successfully",
    data: { result },
  });
};

export const bookingController = {
  createBooking,
  getMyBookings,
  getBookingById,
};
