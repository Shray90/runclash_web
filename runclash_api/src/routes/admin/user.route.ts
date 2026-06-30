import { Router } from "express";
import { AdminUserController } from "../../controllers/admin/user.controller";
import { authorizedMiddleware, adminMiddleware } from "../../middleware/authorized.middleware";
import upload from "../../middleware/upload.middleware";

const router = Router();
const adminUserController = new AdminUserController();

router.use(authorizedMiddleware, adminMiddleware);

router.get("/", adminUserController.listUsers);
router.get("/:id", adminUserController.getUserById);
router.post("/", adminUserController.createUser);
// allow admin to upload profile image when updating
router.put("/:id", upload.single("profileImage"), adminUserController.updateUser);
router.put("/:id/password", adminUserController.updatePassword);
router.delete("/:id", adminUserController.deleteUser);

export default router;
