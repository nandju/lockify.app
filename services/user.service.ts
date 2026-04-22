import { api } from "@/lib/api"

export interface UserPayload {
  email: string
  firstName?: string
  lastName?: string
  password?: string
  [key: string]: unknown
}

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  [key: string]: unknown
}

export async function createUser(payload: UserPayload): Promise<User> {
  const { data } = await api.post<User>("users/create", payload)
  return data
}

export async function getAllUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>("users/All")
  return data
}

export async function getUserById(id: string): Promise<User> {
  const { data } = await api.get<User>(`users/${id}`)
  return data
}

export async function updateUser(id: string, payload: Partial<UserPayload>): Promise<User> {
  const { data } = await api.put<User>(`users/${id}`, payload)
  return data
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`users/${id}`)
}
