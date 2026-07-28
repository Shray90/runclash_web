import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export const getAllBadges = async () => {
    const response = await axiosInstance.get(API.ACHIEVEMENTS.BADGES);
    return response.data;
};

export const getUserAchievements = async () => {
    const response = await axiosInstance.get(API.ACHIEVEMENTS.MY);
    return response.data;
};

export const getUserBadges = async () => {
    const response = await axiosInstance.get(API.ACHIEVEMENTS.MY_BADGES);
    return response.data;
};

export const checkAchievements = async () => {
    const response = await axiosInstance.post(API.ACHIEVEMENTS.CHECK);
    return response.data;
};

export const createBadge = async (data: any) => {
    const response = await axiosInstance.post(API.ACHIEVEMENTS.CREATE_BADGE, data);
    return response.data;
};

