/**
 * Shared axios instance สำหรับ client-side API calls
 * ใช้แทน raw fetch เพื่อให้ base URL, timeout และ error handling สม่ำเสมอ
 */

import axios, { type AxiosError } from "axios";

import { API_TIMEOUT_MS } from "@/lib/constants";

const baseURL =
  typeof window !== "undefined"
    ? ""
    : process.env.NEXT_PUBLIC_APP_URL ?? "";

export const api = axios.create({
  baseURL,
  timeout: API_TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    const message =
      err.response?.data && typeof err.response.data === "object" && "error" in err.response.data
        ? (err.response.data as { error: string }).error
        : err.message;
    console.error("[api]", err.config?.url, err.response?.status, message);
    return Promise.reject(err);
  }
);

export default api;
