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


const deleteCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;

    const result = await categoryService.deleteCategory(categoryId as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Category deleted successfully",
      data: result,
    });
  }
);

const updateCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;
    const { name, description } = req.body;

    const result = await categoryService.updateCategory(
      categoryId as string,
      name,
      description,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Category updated successfully",
      data: result,
    });
  },
);  

export const categoryController = {
  createCategories,
  getAllCategories,
  deleteCategory,
  updateCategory
};
