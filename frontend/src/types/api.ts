// API envelope types — mirrors the backend Pydantic models in API_RESPONSE.md.
// Use these when replacing mock services with real apiClient calls.

// ─── Error codes ──────────────────────────────────────────────────────────────

export const ApiErrorCode = {
  UNAUTHORIZED: "AUTH_UNAUTHORIZED",
  FORBIDDEN: "AUTH_FORBIDDEN",
  NOT_FOUND: "RESOURCE_NOT_FOUND",
  INTERNAL_ERROR: "INTERNAL_SERVER_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  BUSINESS_RULE_VIOLATION: "BUSINESS_RULE_VIOLATION",
  RESOURCE_CONFLICT: "RESOURCE_CONFLICT",
} as const;

export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

// ─── Metadata ─────────────────────────────────────────────────────────────────

export interface ApiMeta {
  request_id: string;
  timestamp: string; // ISO 8601
}

export interface ApiPaginationMeta extends ApiMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

// ─── Success envelopes ────────────────────────────────────────────────────────

export interface SuccessResponse<T> {
  status: "success";
  meta: ApiMeta;
  data: T;
}

export interface SuccessListResponse<T> {
  status: "success";
  meta: ApiPaginationMeta;
  data: T[];
}

// ─── Error envelope ───────────────────────────────────────────────────────────

export interface ApiErrorDetail {
  message: string;
  code: ApiErrorCode;
  detail: Record<string, unknown> | null;
}

export interface ErrorResponse {
  status: "error";
  meta: ApiMeta;
  error: ApiErrorDetail;
}
