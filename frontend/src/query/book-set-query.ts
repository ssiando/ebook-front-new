import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createBookSet,
  deleteBookSet,
  fetchBookSets,
  updateBookSet,
  updateBookSetBooks,
} from '@/api/book-set-api'
import type { BookSetSearchParams } from '@/types/bookSet'

export const bookSetKeys = {
  all: ['bookSets'] as const,
  list: (params: BookSetSearchParams) => [...bookSetKeys.all, 'list', params] as const,
}

export function useBookSetsQuery(params: BookSetSearchParams) {
  return useQuery({
    queryKey: bookSetKeys.list(params),
    queryFn: () => fetchBookSets(params),
    placeholderData: (prev) => prev,
  })
}

export function useCreateBookSetMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createBookSet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookSetKeys.all })
    },
  })
}

export function useUpdateBookSetMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateBookSet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookSetKeys.all })
    },
  })
}

export function useDeleteBookSetMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteBookSet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookSetKeys.all })
    },
  })
}

export function useUpdateBookSetBooksMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, bookIds }: { id: string; bookIds: string[] }) => updateBookSetBooks(id, bookIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookSetKeys.all })
    },
  })
}
