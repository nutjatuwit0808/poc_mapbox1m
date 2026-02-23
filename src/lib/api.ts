/**
 * Shared axios instance for client-side API calls.
 * Use this instead of raw fetch so base URL, timeouts, and error handling stay consistent.
 */

import axios, { type AxiosError } from "axios";

const baseURL =
  typeof window !== "undefined"
    ? ""
    : process.env.NEXT_PUBLIC_APP_URL ?? "";

export const api = axios.create({
  baseURL,
  timeout: 15_000,
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
