import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export const startRun = async (data: { startLat: number; startLng: number }) => {
    const response = await axiosInstance.post(API.RUN.START, data);
    return response.data;
};

export const getCurrentRun = async () => {
    const response = await axiosInstance.get(API.RUN.CURRENT);
    return response.data;
};

export const addLocation = async (data: {
    runId: string;
    lat: number;
    lng: number;
    speed?: number;
    accuracy?: number;
    altitude?: number;
}) => {
    const response = await axiosInstance.post(API.RUN.LOCATION, data);
    return response.data;
};

export const pauseRun = async (runId: string) => {
    const response = await axiosInstance.post(API.RUN.PAUSE, { runId });
    return response.data;
};

export const resumeRun = async (runId: string) => {
    const response = await axiosInstance.post(API.RUN.RESUME, { runId });
    return response.data;
};

export const finishRun = async (data: {
    runId: string;
    distance: number;
    duration: number;
    avgSpeed: number;
    pace: number;
    calories: number;
}) => {
    const response = await axiosInstance.post(API.RUN.FINISH, data);
    return response.data;
};

export const getRunHistory = async (params?: { page?: number; limit?: number; period?: string }) => {
    const response = await axiosInstance.get(API.RUN.HISTORY, { params });
    return response.data;
};

export const getRunById = async (id: string) => {
    const response = await axiosInstance.get(API.RUN.GET_BY_ID(id));
    return response.data;
};

