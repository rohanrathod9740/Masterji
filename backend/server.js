import express from 'express'
import {config} from 'dotenv'
import cors from 'cors'
import authRouter from "./routers/userRouter.js";
import personRouter from "./routers/personRouter.js";
import tagRouter from "./routers/tagRouter.js";
import interactionRouter from "./routers/interactionRouter.js";
import prisma from './prisma/client.js';
import { errorHandler } from './middlewares/errorHandler.js';

// Catch uncaught exceptions to prevent server crash
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! Shutting down...', err.name, err.message, err.stack);
});

// Catch unhandled promise rejections to prevent server crash
process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION! Shutting down...', reason);
});

config()
const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            'http://localhost:3000',
            'http://localhost:5173',
            'https://masterji-w4jb.onrender.com'
        ].filter(Boolean);
        
        // Remove trailing slashes for consistent comparison
        const normalizedOrigin = origin ? origin.replace(/\/$/, '') : '';
        const normalizedAllowed = allowedOrigins.map(url => url.replace(/\/$/, ''));
        
        if (!origin || normalizedAllowed.includes(normalizedOrigin)) {
            callback(null, true);
        } else {
            const err = new Error('Not allowed by CORS');
            err.statusCode = 403;
            callback(err);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
}));
app.use(express.json())

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

app.use("/api/v1/auth",authRouter);
app.use("/api/v1/persons",personRouter);
app.use("/api/v1/tags", tagRouter);
app.use("/api/v1/interactions", interactionRouter);

app.use(errorHandler);
app.listen(PORT,async()=>{
        console.log(`Server is running on port ${PORT}`)
})
