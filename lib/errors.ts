import axios from "axios"

export class ApiError extends Error {
  status?: number
  details?: unknown

  constructor(message: string, status?: number, details?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.details = details
  }
}

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const responseMessage =
      (error.response?.data as { message?: string } | undefined)?.message ??
      error.response?.statusText

    return responseMessage || error.message || "Request failed"
  }

  if (error instanceof Error) {
    return error.message
  }

  return "An unexpected error occurred"
}
