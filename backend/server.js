import express from 'express'
import {config} from 'dotenv'
import cors from 'cors'
import authRouter from "./routers/userRouter.js";
import personRouter from "./routers/personRouter.js";
import tagRouter from "./routers/tagRouter.js";
import interactionRouter from "./routers/interactionRouter.js";
import prisma from './prisma/client.js';

config()
const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use("/api/v1/auth",authRouter);
app.use("/api/v1/persons",personRouter);
app.use("/api/v1/tags", tagRouter);
app.use("/api/v1/interactions", interactionRouter);

app.listen(PORT,async()=>{
        console.log(`Server is running on port ${PORT}`)
})