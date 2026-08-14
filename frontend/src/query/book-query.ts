import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createBook, deleteBook, fetchBooks, updateBook, uploadBookFile } from '@/api/book-api'
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

export function useCreateBookMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.all })
    },
  })
}

export function useUpdateBookMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.all })
    },
  })
}

export function useDeleteBookMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.all })
    },
  })
}

export function useUploadBookFileMutation() {
  return useMutation({
    mutationFn: uploadBookFile,
  })
}
