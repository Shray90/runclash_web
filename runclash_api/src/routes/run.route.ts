import { Router } from "express";
import { RunController } from "../controllers/run.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";

const router = Router();
const runController = new RunController();

router.use(authorizedMiddleware);

router.post("/start", runController.startRun.bind(runController));
router.get("/current", runController.getCurrentRun.bind(runController));
router.post("/location", runController.addLocation.bind(runController));
router.post("/pause", runController.pauseRun.bind(runController));
router.post("/resume", runController.resumeRun.bind(runController));
router.post("/finish", runController.finishRun.bind(runController));
router.get("/history", runController.getRunHistory.bind(runController));
router.get("/:id", runController.getRunById.bind(runController));

export default router;

