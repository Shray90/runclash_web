import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export const getFriends = async () => {
    const response = await axiosInstance.get(API.FRIENDS.GET_ALL);
    return response.data;
};

export const getFriendRequests = async () => {
    const response = await axiosInstance.get(API.FRIENDS.REQUESTS);
    return response.data;
};

export const getSentRequests = async () => {
    const response = await axiosInstance.get(API.FRIENDS.SENT);
    return response.data;
};

export const getOnlineFriends = async () => {
    const response = await axiosInstance.get(API.FRIENDS.ONLINE);
    return response.data;
};

export const getFriendActivity = async () => {
    const response = await axiosInstance.get(API.FRIENDS.ACTIVITY);
    return response.data;
};

export const compareStats = async (friendId: string) => {
    const response = await axiosInstance.get(API.FRIENDS.COMPARE(friendId));
    return response.data;
};

export const sendFriendRequest = async (receiverId: string) => {
    const response = await axiosInstance.post(API.FRIENDS.SEND_REQUEST, { receiverId });
    return response.data;
};

export const respondToRequest = async (requestId: string, action: "accept" | "reject") => {
    const response = await axiosInstance.post(API.FRIENDS.RESPOND, { requestId, action });
    return response.data;
};

export const removeFriend = async (friendId: string) => {
    const response = await axiosInstance.delete(API.FRIENDS.REMOVE(friendId));
    return response.data;
};

