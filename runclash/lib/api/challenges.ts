import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export const getChallenges = async (activeOnly?: boolean) => {
    const response = await axiosInstance.get(API.CHALLENGES.GET_ALL, {
        params: { active: activeOnly },
    });
    return response.data;
};

export const getChallengeById = async (id: string) => {
    const response = await axiosInstance.get(API.CHALLENGES.GET_BY_ID(id));
    return response.data;
};

export const createChallenge = async (data: any) => {
    const response = await axiosInstance.post(API.CHALLENGES.CREATE, data);
    return response.data;
};

export const updateChallenge = async (id: string, data: any) => {
    const response = await axiosInstance.put(API.CHALLENGES.UPDATE(id), data);
    return response.data;
};

export const deleteChallenge = async (id: string) => {
    const response = await axiosInstance.delete(API.CHALLENGES.DELETE(id));
    return response.data;
};

export const joinChallenge = async (id: string) => {
    const response = await axiosInstance.post(API.CHALLENGES.JOIN(id));
    return response.data;
};

export const getUserChallenges = async () => {
    const response = await axiosInstance.get(API.CHALLENGES.MY);
    return response.data;
};

export const getChallengeHistory = async () => {
    const response = await axiosInstance.get(API.CHALLENGES.MY_HISTORY);
    return response.data;
};

export const generateDefaultChallenges = async () => {
    const response = await axiosInstance.post(API.CHALLENGES.GENERATE_DEFAULTS);
    return response.data;
};

