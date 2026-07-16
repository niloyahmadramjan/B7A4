import { Router } from "express";
import { adminController } from "./admin.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();
router.get("/users", auth(Role.ADMIN), adminController.getAllUser);
router.put("/users/:id", auth(Role.ADMIN), adminController.updateUser);
router.get("/bookings", auth(Role.ADMIN), adminController.getAllBookings);

export const adminRouter = router;
