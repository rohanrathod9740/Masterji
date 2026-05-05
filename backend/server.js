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
            // Development origins
            'http://localhost:3000',
            'http://localhost:5173',
            // Production origins
            'https://masterji-w4jb.onrender.com',
            // Environment variable for dynamic configuration
            process.env.FRONTEND_URL,
        ].filter(Boolean);
        
        // Remove trailing slashes for consistent comparison
        const normalizedOrigin = origin ? origin.replace(/\/$/, '') : '';
        const normalizedAllowed = allowedOrigins.map(url => url.replace(/\/$/, ''));
        
        // Allow requests with no origin (like curl or server-to-server)
        // or allow if origin is in the allowedOrigins list
        if (!origin || normalizedAllowed.includes(normalizedOrigin)) {
            callback(null, true);
        } else {
            console.warn(`CORS rejected origin: ${origin}`);
            const err = new Error('Not allowed by CORS');
            err.statusCode = 403;
            callback(err);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
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
