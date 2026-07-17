import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsynce";
import { PaymentService } from "./payment.service";
import { sendResponse } from "../../utils/sentResponse";
import status from "http-status";

const createPayment = catchAsync(async (req: Request, res: Response) => {
  const bookingId = req.body.bookingId;
  const userId = req.user?.id;
  const result = await PaymentService.createPaymentSession(bookingId, userId!);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Payment intent created successfully",
    data: { result },
  });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;
  const payload = req.body;
  console.log(signature, payload);

  await PaymentService.confirmPayment(payload, signature);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Payment intent created successfully",
    data: {},
  });
});

const getMyPayment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const result = await PaymentService.getMyPayments(userId!);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Payment retrived successfully",
    data: { result },
  });
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const paymentId = req.params.id;

  const result = await PaymentService.getPaymentById(paymentId as string);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Payment id to retrived data successfully",
    data: { result },
  });
});

export const paymnetController = {
  createPayment,
  confirmPayment,
  getMyPayment,
  getPaymentById,
};
