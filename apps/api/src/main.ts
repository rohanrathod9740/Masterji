import express from "express";
import { config } from "dotenv";
import cors from "cors";
import { checkDatabaseConnection } from "./lib/db";

import userRouter from "./routers/userRouter"
import personRouter from "./routers/personRouter"
import tagRouter from "./routers/tagRouter"
import interactionRouter from "./routers/interactionRouter"
import { errorHandler } from "./middlewares/errorHandler";


config();

const app = express();

const PORT = process.env.PORT || 5000;

app.get("/",(req,res)=>{
    res.send(`Server running at port ${PORT}`);
})

app.use(cors());
app.use(express.json());
app.use("/api/v1/auth",userRouter);
app.use("/api/v1/persons",personRouter);
app.use("/api/v1/tags", tagRouter);
app.use("/api/v1/interactions", interactionRouter);
app.use(errorHandler);

app.listen(PORT, async () => {
    await checkDatabaseConnection();
    console.log(`Server listening at port ${PORT}`);
});