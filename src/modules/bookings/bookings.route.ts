import { Router } from "express";
import { auth } from "../../middleware/auth";
import { bookingController } from "./booking.controller";

const router = Router();

router.post("/", auth("CUSTOMER"), bookingController.createBooking);

router.get("/", auth("CUSTOMER"), bookingController.getMyBookings);

router.get("/:id", auth("CUSTOMER"), bookingController.getBookingById);

export const bookingRouter = router;
