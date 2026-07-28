import { Router } from "express";
import { AchievementController } from "../controllers/achievement.controller";
import { authorizedMiddleware, adminMiddleware } from "../middleware/authorized.middleware";

const router = Router();
const achievementController = new AchievementController();

router.use(authorizedMiddleware);

router.get("/badges", achievementController.getAllBadges.bind(achievementController));
router.get("/my", achievementController.getUserAchievements.bind(achievementController));
router.get("/my/badges", achievementController.getUserBadges.bind(achievementController));
router.post("/check", achievementController.checkAndUnlock.bind(achievementController));

// Admin routes
router.post("/badges", adminMiddleware, achievementController.createBadge.bind(achievementController));

export default router;

