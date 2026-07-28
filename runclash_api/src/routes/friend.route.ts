import { Router } from "express";
import { FriendController } from "../controllers/friend.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";

const router = Router();
const friendController = new FriendController();

router.use(authorizedMiddleware);

router.get("/", friendController.getFriends.bind(friendController));
router.get("/requests", friendController.getFriendRequests.bind(friendController));
router.get("/sent", friendController.getSentRequests.bind(friendController));
router.get("/online", friendController.getOnlineFriends.bind(friendController));
router.get("/compare/:friendId", friendController.compareStats.bind(friendController));
router.get("/activity", friendController.getFriendActivity.bind(friendController));
router.post("/request", friendController.sendRequest.bind(friendController));
router.post("/respond", friendController.respondToRequest.bind(friendController));
router.delete("/:friendId", friendController.removeFriend.bind(friendController));

export default router;

