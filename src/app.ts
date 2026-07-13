import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import config from "./config";
import { userRouters } from "./modules/users/user.route";


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

// Authentication 
app.use("/api/user", userRouters)


export default app;