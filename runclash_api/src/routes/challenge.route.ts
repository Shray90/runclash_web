import { Router } from "express";
import { ChallengeController } from "../controllers/challenge.controller";
import { authorizedMiddleware, adminMiddleware } from "../middleware/authorized.middleware";

const router = Router();
const challengeController = new ChallengeController();

router.use(authorizedMiddleware);

// User routes
router.get("/", challengeController.list.bind(challengeController));
router.get("/my", challengeController.getUserChallenges.bind(challengeController));
router.get("/my/history", challengeController.getChallengeHistory.bind(challengeController));
router.get("/:id", challengeController.getById.bind(challengeController));
router.post("/:id/join", challengeController.join.bind(challengeController));

// Admin routes
router.post("/", adminMiddleware, challengeController.create.bind(challengeController));
router.put("/:id", adminMiddleware, challengeController.update.bind(challengeController));
router.delete("/:id", adminMiddleware, challengeController.delete.bind(challengeController));
router.post("/generate-defaults", adminMiddleware, challengeController.generateDefaults.bind(challengeController));

export default router;

