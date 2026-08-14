import { apiClient } from '@/lib/axios'
import type { BookSet, BookSetSearchParams, CreateBookSetPayload, UpdateBookSetPayload } from '@/types/bookSet'

// 백엔드는 id/bookIds를 Long(JSON number)으로 내려주지만, 화면 쪽 타입은 string으로 다룬다.
function toBookSet(raw: BookSet): BookSet {
  return { ...raw, id: String(raw.id), bookIds: raw.bookIds.map(String) }
}

export async function fetchBookSets(params: BookSetSearchParams): Promise<BookSet[]> {
  const { data } = await apiClient.get<BookSet[]>('/book-sets', {
    params: { keyword: params.keyword || undefined },
  })
  return data.map(toBookSet)
}

export async function createBookSet(payload: CreateBookSetPayload): Promise<BookSet> {
  const { data } = await apiClient.post<BookSet>('/book-sets', payload)
  return toBookSet(data)
}

export async function updateBookSet(payload: UpdateBookSetPayload): Promise<BookSet> {
  const { id, ...rest } = payload
  const { data } = await apiClient.put<BookSet>(`/book-sets/${id}`, rest)
  return toBookSet(data)
}

export async function deleteBookSet(id: string): Promise<void> {
  await apiClient.delete(`/book-sets/${id}`)
}

export async function updateBookSetBooks(id: string, bookIds: string[]): Promise<BookSet> {
  const { data } = await apiClient.put<BookSet>(`/book-sets/${id}/books`, { bookIds })
  return toBookSet(data)
}
