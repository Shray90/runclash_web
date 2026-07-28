import { Router } from "express";
import { StatsController } from "../controllers/stats.controller";
import { authorizedMiddleware, adminMiddleware } from "../middleware/authorized.middleware";

const router = Router();
const statsController = new StatsController();

router.use(authorizedMiddleware);

router.get("/dashboard", statsController.getDashboard.bind(statsController));
router.get("/charts", statsController.getCharts.bind(statsController));
router.get("/admin/analytics", adminMiddleware, statsController.getAdminAnalytics.bind(statsController));

export default router;

