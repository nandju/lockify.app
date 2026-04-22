import { api } from "@/lib/api"
import { setToken, removeToken } from "@/lib/token"

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  [key: string]: unknown
}

export interface LoginResponse {
  token?: string
  accessToken?: string
  user?: AuthUser
}

function extractToken(data: LoginResponse): string {
  return data.accessToken ?? data.token ?? ""
}

export async function login(payload: LoginPayload): Promise<AuthUser | null> {
  const { data } = await api.post<LoginResponse>("auth/login", payload)
  const token = extractToken(data)

  if (token) {
    setToken(token)
  }

  if (data.user) {
    return data.user
  }

  return getCurrentUser()
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data } = await api.get<AuthUser>("users/me")
    return data
  } catch {
    return null
  }
}

export function logout(): void {
  removeToken()
}
