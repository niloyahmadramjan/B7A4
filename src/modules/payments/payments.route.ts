import { Router } from "express";
import { paymnetController } from "./payment.controller";
import { auth } from "../../middleware/auth";

const router = Router();

router.post("/create", auth("CUSTOMER"), paymnetController.createPayment);
router.post("/confirm", paymnetController.confirmPayment);
router.get("/", auth("CUSTOMER"), paymnetController.getMyPayment);
router.get("/:id", auth("CUSTOMER"), paymnetController.getPaymentById);

export const paymentRouter = router;
