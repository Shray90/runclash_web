import { Router } from "express";
import { login, register, update, whoami } from "../controllers/auth.controller";
import { authorized } from "../middlewares/authorized.middleware";
import multer from "multer";

const router = Router();

router.post("/register", register);
router.post("/login", login);

// Protected endpoints
router.get("/whoami", authorized, whoami);

const upload = multer({ dest: "uploads/" });

// For now: accepts multipart fields; image handling will be wired next
router.post("/update", authorized, upload.single("image"), update);

export default router;

