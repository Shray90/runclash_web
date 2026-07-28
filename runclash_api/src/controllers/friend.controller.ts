import { Request, Response } from "express";
import { FriendService } from "../services/friend.service";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { SendFriendRequestDTO, RespondFriendRequestDTO } from "../dtos/friend.dto";
import { z } from "zod";

const friendService = new FriendService();

export class FriendController {
    async sendRequest(req: Request, res: Response) {
        try {
            const parsed = SendFriendRequestDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const request = await friendService.sendFriendRequest(req.user!._id.toString(), parsed.data.receiverId);
            return ApiResponseHelper.success(res, request, "Friend request sent");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async respondToRequest(req: Request, res: Response) {
        try {
            const parsed = RespondFriendRequestDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const request = await friendService.respondToRequest(parsed.data.requestId, req.user!._id.toString(), parsed.data.action);
            return ApiResponseHelper.success(res, request, `Friend request ${parsed.data.action}ed`);
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async removeFriend(req: Request, res: Response) {
        try {
            const { friendId } = req.params;
            const fid = Array.isArray(friendId) ? friendId[0] : friendId;
            await friendService.removeFriend(req.user!._id.toString(), fid);
            return ApiResponseHelper.success(res, null, "Friend removed");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getFriends(req: Request, res: Response) {
        try {
            const friends = await friendService.getFriends(req.user!._id.toString());
            return ApiResponseHelper.success(res, friends, "Friends fetched");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getFriendRequests(req: Request, res: Response) {
        try {
            const requests = await friendService.getFriendRequests(req.user!._id.toString());
            return ApiResponseHelper.success(res, requests, "Pending requests fetched");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getSentRequests(req: Request, res: Response) {
        try {
            const requests = await friendService.getSentRequests(req.user!._id.toString());
            return ApiResponseHelper.success(res, requests, "Sent requests fetched");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getOnlineFriends(req: Request, res: Response) {
        try {
            const friends = await friendService.getOnlineFriends(req.user!._id.toString());
            return ApiResponseHelper.success(res, friends, "Online friends fetched");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async compareStats(req: Request, res: Response) {
        try {
            const { friendId } = req.params;
            const fid = Array.isArray(friendId) ? friendId[0] : friendId;
            const result = await friendService.compareStats(req.user!._id.toString(), fid);
            return ApiResponseHelper.success(res, result, "Stats comparison fetched");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getFriendActivity(req: Request, res: Response) {
        try {
            const activity = await friendService.getFriendActivity(req.user!._id.toString());
            return ApiResponseHelper.success(res, activity, "Friend activity fetched");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}

