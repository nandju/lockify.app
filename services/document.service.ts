import { api } from "@/lib/api"

export interface DocumentItem {
  id: string
  userId: string
  fileName: string
  createdAt: string
  updatedAt?: string
  [key: string]: unknown
}

export interface DocumentFilters {
  page?: number
  limit?: number
  startCreationDate?: string
  endCreationDate?: string
  search?: string
}

export interface UpdateDocumentPayload {
  fileName: string
}

export async function uploadDocument(file: File): Promise<DocumentItem> {
  const formData = new FormData()
  formData.append("file", file)

  const { data } = await api.post<DocumentItem>("documents", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return data
}

export async function getUserDocuments(
  userId: string,
  filters: DocumentFilters = {},
): Promise<DocumentItem[]> {
  const { data } = await api.get<DocumentItem[]>(`documents/${userId}`, {
    params: filters,
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
