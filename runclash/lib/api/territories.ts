import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export const getAllTerritories = async () => {
    const response = await axiosInstance.get(API.TERRITORIES.GET_ALL);
    return response.data;
};

export const getTerritoryById = async (id: string) => {
    const response = await axiosInstance.get(API.TERRITORIES.GET_BY_ID(id));
    return response.data;
};

export const createTerritory = async (data: any) => {
    const response = await axiosInstance.post(API.TERRITORIES.CREATE, data);
    return response.data;
};

export const updateTerritory = async (id: string, data: any) => {
    const response = await axiosInstance.put(API.TERRITORIES.UPDATE(id), data);
    return response.data;
};

export const deleteTerritory = async (id: string) => {
    const response = await axiosInstance.delete(API.TERRITORIES.DELETE(id));
    return response.data;
};

export const checkCapture = async (data: { territoryId: string; lat: number; lng: number }) => {
    const response = await axiosInstance.post(API.TERRITORIES.CAPTURE, data);
    return response.data;
};

export const checkTerritory = async (data: { territoryId: string; lat: number; lng: number }) => {
    const response = await axiosInstance.post(API.TERRITORIES.CHECK, data);
    return response.data;
};

export const getUserTerritories = async () => {
    const response = await axiosInstance.get(API.TERRITORIES.MY);
    return response.data;
};

export const getNearbyTerritories = async (lat: number, lng: number, distance?: number) => {
    const response = await axiosInstance.get(API.TERRITORIES.NEARBY, {
        params: { lat, lng, distance },
    });
    return response.data;
};

