import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export const searchUsers = async (params: { search: string; page?: number; limit?: number }) => {
    const response = await axiosInstance.get(API.AUTH.SEARCH, { params });
    return response.data;
};