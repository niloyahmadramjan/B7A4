import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { categoryService } from "./category.service";
import { catchAsync } from "../../utils/catchAsynce";
import { sendResponse } from "../../utils/sentResponse";

const createCategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, description } = req.body;
    const result = await categoryService.createCategories(name, description);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Create ategories successfully",
      data: result,
    });
  },
);

const getAllCategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await categoryService.getAllCategories(query);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Categories retrieved successfully",
      data: result,
    });
  },
);

export const categoryController = {
  createCategories,
  getAllCategories,
};
