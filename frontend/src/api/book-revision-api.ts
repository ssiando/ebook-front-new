import { apiClient } from '@/lib/axios'
import type {
  BookRevision,
  CreateBookRevisionPayload,
  UpdateBookRevisionPayload,
} from '@/types/bookRevision'

// 백엔드는 id/bookId를 Long(JSON number)으로 내려주지만, 화면 쪽 타입은 string으로 다룬다.
function toBookRevision(raw: BookRevision): BookRevision {
  return { ...raw, id: String(raw.id), bookId: String(raw.bookId) }
}

export async function fetchBookRevisions(bookId: string): Promise<BookRevision[]> {
  const { data } = await apiClient.get<BookRevision[]>(`/books/${bookId}/revisions`)
  return data.map(toBookRevision)
}

export async function createBookRevision(
  bookId: string,
  payload: CreateBookRevisionPayload,
): Promise<BookRevision> {
  const { data } = await apiClient.post<BookRevision>(`/books/${bookId}/revisions`, payload)
  return toBookRevision(data)
}

export async function updateBookRevision(payload: UpdateBookRevisionPayload): Promise<BookRevision> {
  const { id, bookId, ...rest } = payload
  const { data } = await apiClient.put<BookRevision>(`/books/${bookId}/revisions/${id}`, rest)
  return toBookRevision(data)
}

export async function deleteBookRevision(bookId: string, id: string): Promise<void> {
  await apiClient.delete(`/books/${bookId}/revisions/${id}`)
}
