import { Router } from "express";
import { authController } from "./auth.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";


const router = Router()

router.post("/register", authController.registerUser)
router.post("/login", authController.loginUser)
router.post("/refresh-token", authController.refreshToken)
router.get("/me",auth(Role.CUSTOMER,Role.TECHNICIAN,Role.ADMIN),authController.getCurrentUser)

export const authRouter = router



