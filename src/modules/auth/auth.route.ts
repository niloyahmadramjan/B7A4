import { Router } from "express";
import { authController } from "./auth.controller";
import { auth } from "../../middleware/auth";

const router = Router();

router.post("/register", authController.registerUser);
router.post("/login", authController.userLogin);
router.get(
  "/me",
  auth("ADMIN", "CUSTOMER", "TECHNICIAN"),
  authController.getMe,
);

export const authRouters = router;
