import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export const getNotifications = async (params?: { page?: number; limit?: number; unreadOnly?: boolean }) => {
    const response = await axiosInstance.get(API.NOTIFICATIONS.GET_ALL, { params });
    return response.data;
};

export const getUnreadCount = async () => {
    const response = await axiosInstance.get(API.NOTIFICATIONS.UNREAD_COUNT);
    return response.data;
};

export const generateWeeklySummary = async () => {
    const response = await axiosInstance.post(API.NOTIFICATIONS.WEEKLY_SUMMARY);
    return response.data;
};

export const markAsRead = async (id: string) => {
    const response = await axiosInstance.put(API.NOTIFICATIONS.MARK_READ(id));
    return response.data;
};

export const markAllAsRead = async () => {
    const response = await axiosInstance.put(API.NOTIFICATIONS.MARK_ALL_READ);
    return response.data;
};

export const deleteNotification = async (id: string) => {
    const response = await axiosInstance.delete(API.NOTIFICATIONS.DELETE(id));
    return response.data;
};

