export interface ApiError {
  message: string
  code?: string
  status?: number
}

export type ApiResult<T> =
  | { data: T; error: null }
  | { data: null; error: ApiError }

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

/** Standard async query state — aligned with `useAsyncData` */
export interface LoadingState<T = unknown> {
  data: T | null
  isLoading: boolean
  error: string | null
}

export function isApiSuccess<T>(result: ApiResult<T>): result is { data: T; error: null } {
  return result.error === null && result.data !== null
}

export function isApiError<T>(result: ApiResult<T>): result is { data: null; error: ApiError } {
  return result.error !== null
}
