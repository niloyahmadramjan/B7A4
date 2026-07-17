import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import config from "./config";
import { authRouter } from "./modules/auth/auth.route";
import { serviceRouter } from "./modules/services/services.route";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { technicianRouter } from "./modules/technicians/technicians.route";
import { categoryRouter } from "./modules/category/category.route";
import { bookingRouter } from "./modules/bookings/bookings.route";
import { paymentRouter } from "./modules/payments/payments.route";
import { notFound } from "./middleware/notFound";
import { reviewRouter } from "./modules/review/review.route";
import { adminRouter } from "./modules/admin/admin.route";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.use(
  "/api/payments/confirm",
  express.raw({
    type: "application/json",
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Fixit-now server is running...");
});

app.use("/api/auth", authRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/technician", technicianRouter);
app.use("/api/services", serviceRouter);
app.use("/api/admin", adminRouter)
app.use("/api/bookings", bookingRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/reviews", reviewRouter);

app.use(globalErrorHandler);
app.use(notFound);

export default app;
