import {UserController} from "../controllers/user.controller";
import { Router } from "express";   

const userController = new UserController();
const userRouter = Router();

userRouter.post("/register", userController.createUser);
userRouter.post("/login",userController.loginUser)

export default userRouter;