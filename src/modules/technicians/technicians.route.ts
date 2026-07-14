import { Router } from "express";
import { technicianController } from "./technicians.controller";

const router = Router();

router.get("/", technicianController.getAllTechnicians);
router.get("/:id", technicianController.getTechnicianById);

export const technicianRouter = router;
