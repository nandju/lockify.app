import { api } from "@/lib/api"
import type { Document as ApiDocument } from "@/types/api"

export interface DocumentItem extends ApiDocument {
  userId: string
  updatedAt?: string
  [key: string]: unknown
}

export interface DocumentFilters {
  page?: number
  limit?: number
  dateCreationDebut?: string
  dateCreationFin?: string
  search?: string
}

export interface UpdateDocumentPayload {
  fileName: string
}

export async function uploadDocument(file: File): Promise<DocumentItem> {
  const formData = new FormData()
  formData.append("file", file)

  const { data } = await api.post<DocumentItem>("documents", formData)

  return data
}

export async function getUserDocuments(
  userId: string,
  filters: DocumentFilters = {},
): Promise<DocumentItem[]> {
  const params = {
    page: filters.page,
    limit: filters.limit,
    dateCreationDebut: filters.dateCreationDebut,
    dateCreationFin: filters.dateCreationFin,
    search: filters.search,
  }

  const { data } = await api.get<DocumentItem[]>(`documents/${userId}`, {
    params,
  })
  return data
}

export async function getDocumentById(id: string): Promise<DocumentItem> {
  const { data } = await api.get<DocumentItem>(`documents/${id}`)
  return data
}

export async function updateDocument(
  id: string,
  payload: UpdateDocumentPayload,
): Promise<DocumentItem> {
  const { data } = await api.patch<DocumentItem>(`documents/${id}`, payload)
  return data
}

export async function deleteDocument(id: string): Promise<void> {
  await api.delete(`documents/${id}`)
}
