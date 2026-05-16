import express, { Router } from "express";
import {
  createInteraction,
  editInteraction,
  deleteInteraction,
} from "../controllers/interactionController";

const router: Router = express.Router();

router.post("/create", createInteraction);
router.put("/edit/:id", editInteraction);
router.delete("/delete/:id", deleteInteraction);

export default router;