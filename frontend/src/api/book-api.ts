import { apiClient } from '@/lib/axios'
import type { Book, BookSearchParams, CreateBookPayload, UpdateBookPayload } from '@/types/book'

// 백엔드는 book_id를 Long(JSON number)으로 내려주지만, 화면 쪽 타입(Book.id)은 string으로 다룬다 — 여기서 한 번에 변환한다.
function toBook(raw: Book): Book {
  return { ...raw, id: String(raw.id) }
}

export async function fetchBooks(params: BookSearchParams): Promise<Book[]> {
  const { data } = await apiClient.get<Book[]>('/books', {
    params: {
      keyword: params.keyword || undefined,
      bookType: params.bookType === 'ALL' ? undefined : params.bookType,
      activeYn: params.activeYn === 'ALL' ? undefined : params.activeYn,
    },
  })
  return data.map(toBook)
}

export async function createBook(payload: CreateBookPayload): Promise<Book> {
  const { data } = await apiClient.post<Book>('/books', payload)
  return toBook(data)
}

export async function updateBook(payload: UpdateBookPayload): Promise<Book> {
  const { id, ...rest } = payload
  const { data } = await apiClient.put<Book>(`/books/${id}`, rest)
  return toBook(data)
}

export async function deleteBook(id: string): Promise<void> {
  await apiClient.delete(`/books/${id}`)
}

export async function uploadBookFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await apiClient.post<{ url: string }>('/books/uploads', formData)
  return data.url
}
