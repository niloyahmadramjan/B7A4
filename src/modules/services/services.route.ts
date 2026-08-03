import { Router } from "express";
import { Role } from "../../../generated/prisma/client";
import { auth } from "../../middleware/auth";
import { serviceController } from "./services.controller";


const router = Router()
router.post("/", auth(Role.TECHNICIAN), serviceController.createService)

router.get("/all-services", serviceController.getAllServices)
router.get("/my-services", auth(Role.TECHNICIAN), serviceController.getMyServices)
router.put("/my-services/:id", auth(Role.TECHNICIAN), serviceController.updateService)
router.delete("/my-services/:id", auth(Role.TECHNICIAN), serviceController.deleteService)


export const serviceRouter =router