import { Router } from "express";
import { categroiesController } from "./category.controller";

const router = Router();

router.get("/", categroiesController.getAllCategories)

export const categoriesRouter = router;
