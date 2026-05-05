import express from "express";
import { createInteraction, editInteraction, deleteInteraction } from "../controllers/interactionController.js";
const router = express.Router();

router.post("/create", createInteraction);
router.put("/edit/:id", editInteraction);
router.delete("/delete/:id", deleteInteraction);

export default router;
