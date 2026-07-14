import { Request, Response } from "express";
import { CategoryService } from "./category.service";
import { sendResponse } from "../../utils/sentResponse";
import status from "http-status";

const getAllCategories = async (req: Request, res: Response) => {
  const result = await CategoryService.getAllCategories();
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Categories retrieved successfully",
    data: { result },
  });
};

export const categroiesController = {
  getAllCategories,
};
