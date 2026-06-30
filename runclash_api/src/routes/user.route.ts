import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";
import upload from "../middleware/upload.middleware";

const router = Router();
const userController = new UserController();

router.post("/register", userController.createUser);
router.post("/login", userController.loginUser);
router.get("/whoami", authorizedMiddleware, userController.whoami);
// allow profile image upload via multipart/form-data
router.put("/update", authorizedMiddleware, upload.single("profileImage"), userController.updateUser);
router.put("/update-password", authorizedMiddleware, userController.updatePassword);

export default router;
