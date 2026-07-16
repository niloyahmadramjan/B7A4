import { Router } from "express";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { bookingController } from "./booking.controller";


const router = Router()

router.post("/", auth(Role.CUSTOMER), bookingController.createBooking)
router.get("/", auth(Role.CUSTOMER), bookingController.getMyBookings)
router.get("/:id", auth(Role.ADMIN, Role.CUSTOMER, Role.TECHNICIAN), bookingController.getBookingById)
router.patch("/:id/cancel", auth(Role.CUSTOMER), bookingController.cancelBooking);

export const bookingRouter = router