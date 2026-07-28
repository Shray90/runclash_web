import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export const getDashboardStats = async () => {
    const response = await axiosInstance.get(API.STATS.DASHBOARD);
    return response.data;
};

export const getChartsData = async () => {
    const response = await axiosInstance.get(API.STATS.CHARTS);
    return response.data;
};

export const getAdminAnalytics = async () => {
    const response = await axiosInstance.get(API.STATS.ADMIN_ANALYTICS);
    return response.data;
};

