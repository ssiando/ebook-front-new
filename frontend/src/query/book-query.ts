import { useQuery } from '@tanstack/react-query'
import { fetchBooks } from '@/api/book-api'
import type { BookSearchParams } from '@/types/book'

export const bookKeys = {
  all: ['books'] as const,
  list: (params: BookSearchParams) => [...bookKeys.all, 'list', params] as const,
}

export function useBooksQuery(params: BookSearchParams) {
  return useQuery({
    queryKey: bookKeys.list(params),
    queryFn: () => fetchBooks(params),
    placeholderData: (prev) => prev,
  })
}
