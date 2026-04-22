"use client"

import { useCallback, useState } from "react"
import {
  deleteDocument,
  getUserDocuments,
  updateDocument,
  uploadDocument,
  type DocumentFilters,
  type DocumentItem,
} from "@/services/document.service"
import { extractErrorMessage } from "@/lib/errors"

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDocuments = useCallback(async (userId: string, filters?: DocumentFilters) => {
    setLoading(true)
    setError(null)

    try {
      const data = await getUserDocuments(userId, filters)
      setDocuments(data)
      return data
    } catch (err) {
      const message = extractErrorMessage(err)
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const upload = useCallback(async (file: File) => {
    setLoading(true)
    setError(null)

    try {
      const created = await uploadDocument(file)
      setDocuments(prev => [created, ...prev])
      return created
    } catch (err) {
      const message = extractErrorMessage(err)
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      await deleteDocument(id)
      setDocuments(prev => prev.filter(document => document.id !== id))
    } catch (err) {
      const message = extractErrorMessage(err)
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const update = useCallback(async (id: string, fileName: string) => {
    setLoading(true)
    setError(null)

    try {
      const updated = await updateDocument(id, { fileName })
      setDocuments(prev =>
        prev.map(document => (document.id === id ? { ...document, ...updated } : document)),
      )
      return updated
    } catch (err) {
      const message = extractErrorMessage(err)
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    upload,
    delete: remove,
    update,
  }
}
