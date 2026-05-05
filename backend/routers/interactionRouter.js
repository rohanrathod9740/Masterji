import express from "express";
import { createInteraction, editInteraction, deleteInteraction, listInteractions, getInteractionById } from "../controllers/interactionController.js";
const router = express.Router();

router.get("/", listInteractions);
router.get("/:id", getInteractionById);
router.post("/create", createInteraction);
router.put("/edit/:id", editInteraction);
router.delete("/delete/:id", deleteInteraction);

export default router;
