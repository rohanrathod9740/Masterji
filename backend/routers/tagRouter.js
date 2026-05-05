import express from "express";
import { createTag, editTag, deleteTag, listTags } from "../controllers/tagController.js";
const router = express.Router()

router.get("/", listTags);
router.post("/create", createTag);
router.post("/delete/:id", deleteTag); 
router.post("/edit/:id", editTag);

export default router;
