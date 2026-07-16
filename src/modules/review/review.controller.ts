import { NextFunction, Request, Response } from "express";
import statusCode from "http-status";
import { reviewService } from "./review.service";
import { catchAsync } from "../../utils/catchAsynce";
import { sendResponse } from "../../utils/sentResponse";

const giveReviewOnTechnician = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { comment, rating, bookingId } = req.body;

    console.log(req.body);
    const result = await reviewService.giveReviewOnTechnician(
      userId as string,
      bookingId as string,
      rating,
      comment,
    );
    sendResponse(res, {
      success: true,
      statusCode: statusCode.OK,
      message: "Successfully give review",
      data: result,
    });
  },
);

export const reviewController = {
  giveReviewOnTechnician,
};
