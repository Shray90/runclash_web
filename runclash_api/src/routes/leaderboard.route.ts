import { Router } from "express";
import { LeaderboardController } from "../controllers/leaderboard.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";

const router = Router();
const leaderboardController = new LeaderboardController();

router.get("/", authorizedMiddleware, leaderboardController.getLeaderboard.bind(leaderboardController));
router.get("/rank", authorizedMiddleware, leaderboardController.getUserRank.bind(leaderboardController));
router.get("/mini", authorizedMiddleware, leaderboardController.getMiniLeaderboard.bind(leaderboardController));

export default router;

