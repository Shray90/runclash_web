import axios from "axios";
import { getTokenCookie as getTokenCookieClient } from "../cookies-client";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8089";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(async (config) => {
  let token: string | null = null;

  if (typeof window === "undefined") {
    const { getTokenCookie } = await import("../cookies.server");
    token = await getTokenCookie();
  } else {
    token = getTokenCookieClient();
  }

  if (token) {
    if (!config.headers) {
      config.headers = { Authorization: `Bearer ${token}` } as any;
    } else {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosInstance;