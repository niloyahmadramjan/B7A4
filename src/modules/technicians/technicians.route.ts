import { Router } from "express";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { technicianController } from "./technicians.controller";

const router = Router();

router.get(
  "/bookings",
  auth(Role.TECHNICIAN),
  technicianController.getTechnicianBooking,
);
router.get("/", technicianController.getAllTechnicians);

router.put(
  "/availability",
  auth(Role.TECHNICIAN),
  technicianController.updateAvailability,
);

router.get("/:id", technicianController.getTechnicianById);
router.put(
  "/:id",
  auth(Role.TECHNICIAN),
  technicianController.updateTechnicianProfile,
);

router.patch(
  "/bookings/:id",
  auth(Role.TECHNICIAN),
  technicianController.updateBookingStatus,
);

export const technicianRouter = router;
