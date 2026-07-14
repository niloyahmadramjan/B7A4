import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import config from "./config";
import { authRouters } from "./modules/auth/auth.route";
import { serviceRouter } from "./modules/services/services.route";


const app : Application = express();

app.use(cors({
    origin : config.app_url,
    credentials : true,
}))

app.use(express.json());
app.use(express.urlencoded({ extended : true }));
app.use(cookieParser());


app.get("/",(req : Request, res : Response) => {
    res.send("Fixit-now server is running...");
});

// Auth
app.use("/api/auth", authRouters)

//Services & 367Technicians (Public)

app.use("/api/services", serviceRouter)


export default app;