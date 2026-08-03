import { Router } from "express";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { technicianController } from "./technicians.controller";

const router = Router();

router.get(
  "/bookings",
  auth(Role.TECHNICIAN),
  technicianController.getTechnicianBookings,
);
router.get("/", technicianController.getAllTechnicians);

router.put(
  "/availability",
  auth(Role.TECHNICIAN),
  technicianController.updateAvailability,
);

router.get("/info/:id", technicianController.getTechnicianById);
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
router.get(
  "/my-profile",
  auth(Role.TECHNICIAN),
  technicianController.getMyProfileInfo,
);
router.get(
  "/dashboard-overview",
  auth(Role.TECHNICIAN),
  technicianController.getTechnicianDashboardOverview,
);

export const technicianRouter = router;
