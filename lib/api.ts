import axios, { type AxiosError } from "axios"
import { removeToken, getToken } from "@/lib/token"
import { ApiError } from "@/lib/errors"

export const api = axios.create({
  baseURL: "https://lockify-project.vercel.app/api/",
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
})

api.interceptors.request.use(
  config => {
    const token = getToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  error => Promise.reject(error),
)

api.interceptors.response.use(
  response => response,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message || "Request failed"

    if (status === 401) {
      removeToken()
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }

    return Promise.reject(new ApiError(message, status, error.response?.data))
  },
)
