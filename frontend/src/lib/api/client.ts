import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      typeof window !== "undefined"
    ) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
