import express from "express";
import { getAllPersons, getPersonById, createPerson, deletePersonById, editPersonById } from "../controllers/personController.js";
const router = express.Router()

router.get("/",getAllPersons);
router.get("/get/:id",getPersonById);
router.post("/create",createPerson);
router.get("/delete/:id",deletePersonById);
router.put("/edit/:id",editPersonById);

export default router