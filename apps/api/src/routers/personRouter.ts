import express from "express";
import { getAllPersons, getPersonById, createPerson, deletePersonById, editPersonById, addTagToPerson } from "../controllers/personController";
const router = express.Router()

router.get("/",getAllPersons);
router.get("/get/:id",getPersonById);
router.post("/create",createPerson);
router.get("/delete/:id",deletePersonById);
router.put("/edit/:id",editPersonById);
router.post("/add/tags",addTagToPerson);


export default router