import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export const getLeaderboard = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    period?: string;
}) => {
    const response = await axiosInstance.get(API.LEADERBOARD.GET_ALL, { params });
    return response.data;
};

export const getUserRank = async () => {
    const response = await axiosInstance.get(API.LEADERBOARD.RANK);
    return response.data;
};

export const getMiniLeaderboard = async (limit?: number) => {
    const response = await axiosInstance.get(API.LEADERBOARD.MINI, {
        params: { limit },
    });
    return response.data;
};

