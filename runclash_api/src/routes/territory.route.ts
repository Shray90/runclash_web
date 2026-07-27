import { Router } from "express";
import { TerritoryController } from "../controllers/territory.controller";
import { authorizedMiddleware, adminMiddleware } from "../middleware/authorized.middleware";

const router = Router();
const territoryController = new TerritoryController();

// Public (auth required)
router.get("/", authorizedMiddleware, territoryController.getAll.bind(territoryController));
router.get("/nearby", authorizedMiddleware, territoryController.getNearby.bind(territoryController));
router.get("/my", authorizedMiddleware, territoryController.getUserTerritories.bind(territoryController));
router.get("/:id", authorizedMiddleware, territoryController.getById.bind(territoryController));
router.post("/check", authorizedMiddleware, territoryController.checkTerritory.bind(territoryController));
router.post("/capture", authorizedMiddleware, territoryController.capture.bind(territoryController));

// Admin only
router.post("/", authorizedMiddleware, adminMiddleware, territoryController.create.bind(territoryController));
router.put("/:id", authorizedMiddleware, adminMiddleware, territoryController.update.bind(territoryController));
router.delete("/:id", authorizedMiddleware, adminMiddleware, territoryController.delete.bind(territoryController));

export default router;

