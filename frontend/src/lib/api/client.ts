import axios from "axios";
import type { ErrorResponse } from "@/src/types";

// Same-origin base path. Requests go to the frontend origin and are proxied to
// the backend by the /api/* rewrite in next.config.ts, keeping the auth cookie
// first-party. This is environment-independent, so it is a constant, not env.
const API_BASE_PATH = "/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_PATH,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
  withCredentials: true,
});

// Unwrap the success envelope so callers receive T directly via response.data.
// A service doing `const { data } = await apiClient.get<User>("/users/me")`
// gets the User object — not the raw { status, meta, data } wrapper.
apiClient.interceptors.response.use(
  (res) => {
    if (res.data?.status === "success") {
      res.data = res.data.data;
    }
    return res;
  },
  async (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
      // Exclude auth-init endpoints — their callers handle 401 themselves.
      const isAuthRelatedEndpoint =
        error.config?.url?.startsWith("/auth/") ||
        error.config?.url === "/users/me";
      if (
        error.response.status === 401 &&
        !isAuthRelatedEndpoint &&
        typeof window !== "undefined"
      ) {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }

      // Extract structured message and code from the error envelope when available,
      // so callers can read error.message and error.code without parsing raw JSON.
      const body = error.response.data as ErrorResponse | undefined;
      if (body?.status === "error" && body.error?.message) {
        const structured = new Error(body.error.message) as Error & {
          code: string;
        };
        structured.code = body.error.code;
        return Promise.reject(structured);
      }
    }

    return Promise.reject(error);
  },
);
