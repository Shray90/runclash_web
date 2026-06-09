import { Request, Response, Router } from "express";
import { PersonController } 
    from "../controllers/person.controller";

const router: Router = Router();
const personController = new PersonController();

// 1. Get All - persons (replace app with router)
router.get("/get/all", personController.getAllPersons);

// Task: implement router
// POST /create/person/new
// Make controller to store data in dataset 
// and return created person
// Implement and test in postman
router.post("/create/person/new", personController.createPerson);

export default router;