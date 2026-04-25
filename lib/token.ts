const TOKEN_STORAGE_KEY = "lockify_token"

export function setToken(token: string): void {
  if (typeof window === "undefined") return
  if (!token || token === "null" || token === "undefined" || token.trim() === "") return
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null

  const token = localStorage.getItem(TOKEN_STORAGE_KEY)

  if (!token || token === "null" || token === "undefined" || token.trim() === "") {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    return null
  }

  return token
}

export function removeToken(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}
