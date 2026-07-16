import { Router } from "express";
import { Role } from "../../../generated/prisma/client";
import { auth } from "../../middleware/auth";
import { serviceController } from "./services.controller";


const router = Router()
router.post("/", auth(Role.TECHNICIAN), serviceController.createService)

router.get("/", serviceController.getAllServices)
export const serviceRouter =router