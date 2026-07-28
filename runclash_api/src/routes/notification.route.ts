import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";

const router = Router();
const notificationController = new NotificationController();

router.use(authorizedMiddleware);

router.get("/", notificationController.list.bind(notificationController));
router.get("/unread-count", notificationController.getUnreadCount.bind(notificationController));
router.post("/weekly-summary", notificationController.generateWeeklySummary.bind(notificationController));
router.put("/:id/read", notificationController.markRead.bind(notificationController));
router.put("/read-all", notificationController.markAllRead.bind(notificationController));
router.delete("/:id", notificationController.delete.bind(notificationController));

export default router;

