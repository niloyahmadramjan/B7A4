import { Router } from "express";
import { serviceController } from "./services.controller";
import { auth } from "../../middleware/auth";

const router = Router();

router.get(
  "/",
  auth("ADMIN", "CUSTOMER", "TECHNICIAN"),
  serviceController.getAllServices,
);

export const serviceRouter = router;
