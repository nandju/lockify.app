"use client"

import { FormEvent, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useDocuments } from "@/hooks/useDocuments"

export default function LockifyApiExamplePage() {
  const { user, loading: authLoading, error: authError, login, logout } = useAuth()
  const {
    documents,
    loading: docsLoading,
    error: docsError,
    fetchDocuments,
    upload,
    delete: deleteDocument,
    update,
  } = useDocuments()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userId, setUserId] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage(null)

    try {
      const loggedUser = await login({ email, password })
      setUserId(loggedUser?.id ?? "")
      setMessage("Login successful")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed")
    }
  }

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedFile) {
      setMessage("Please select a file before uploading")
      return
    }

    setMessage(null)

    try {
      await upload(selectedFile)
      setSelectedFile(null)
      setMessage("Document uploaded successfully")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed")
    }
  }

  const handleFetchDocuments = async () => {
    const targetUserId = user?.id || userId
    if (!targetUserId) {
      setMessage("Provide a user id or login first")
      return
    }

    setMessage(null)
    try {
      await fetchDocuments(targetUserId, {
        page: 1,
        limit: 10,
      })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load documents")
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6">
      <section className="rounded-md border p-4">
        <h1 className="mb-4 text-xl font-semibold">Lockify API Integration (Axios)</h1>
        <form onSubmit={handleLogin} className="grid gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            className="rounded border px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            className="rounded border px-3 py-2"
            required
          />
          <button
            type="submit"
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-60"
            disabled={authLoading}
          >
            {authLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-3 flex items-center gap-3">
          <input
            type="text"
            placeholder="User id (optional)"
            value={userId}
            onChange={event => setUserId(event.target.value)}
            className="rounded border px-3 py-2"
          />
          <button
            type="button"
            onClick={handleFetchDocuments}
            className="rounded border px-4 py-2"
            disabled={docsLoading}
          >
            Load Documents
          </button>
          <button type="button" onClick={logout} className="rounded border px-4 py-2">
            Logout
          </button>
        </div>
        {authError && <p className="mt-2 text-sm text-red-600">{authError}</p>}
      </section>

      <section className="rounded-md border p-4">
        <h2 className="mb-3 text-lg font-semibold">Upload Document</h2>
        <form onSubmit={handleUpload} className="flex flex-col gap-3">
          <input
            type="file"
            onChange={event => setSelectedFile(event.target.files?.[0] ?? null)}
            className="rounded border px-3 py-2"
          />
          <button
            type="submit"
            className="w-fit rounded bg-black px-4 py-2 text-white disabled:opacity-60"
            disabled={docsLoading}
          >
            {docsLoading ? "Uploading..." : "Upload"}
          </button>
        </form>
        {docsError && <p className="mt-2 text-sm text-red-600">{docsError}</p>}
      </section>

      <section className="rounded-md border p-4">
        <h2 className="mb-3 text-lg font-semibold">Documents</h2>
        <ul className="space-y-2">
          {documents.map(document => (
            <li key={document.id} className="flex items-center justify-between rounded border p-3">
              <div>
                <p className="font-medium">{document.fileName}</p>
                <p className="text-xs text-gray-500">ID: {document.id}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded border px-2 py-1 text-sm"
                  onClick={() => {
                    const nextName = window.prompt("New file name", document.fileName)
                    if (nextName) {
                      void update(document.id, nextName)
                    }
                  }}
                >
                  Rename
                </button>
                <button
                  type="button"
                  className="rounded border px-2 py-1 text-sm"
                  onClick={() => {
                    void deleteDocument(document.id)
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
          {!documents.length && <li className="text-sm text-gray-500">No documents loaded.</li>}
        </ul>
      </section>

      {message && <p className="rounded-md border p-3 text-sm">{message}</p>}
    </main>
  )
}
