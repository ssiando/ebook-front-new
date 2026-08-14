import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createBookRevision,
  deleteBookRevision,
  fetchBookRevisions,
  updateBookRevision,
} from '@/api/book-revision-api'
import type { CreateBookRevisionPayload } from '@/types/bookRevision'

export const bookRevisionKeys = {
  all: ['bookRevisions'] as const,
  list: (bookId: string) => [...bookRevisionKeys.all, 'list', bookId] as const,
}

export function useBookRevisionsQuery(bookId: string | null) {
  return useQuery({
    queryKey: bookRevisionKeys.list(bookId ?? ''),
    queryFn: () => fetchBookRevisions(bookId as string),
    enabled: bookId !== null,
  })
}

export function useCreateBookRevisionMutation(bookId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateBookRevisionPayload) => createBookRevision(bookId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookRevisionKeys.list(bookId) })
    },
  })
}

export function useUpdateBookRevisionMutation(bookId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateBookRevision,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookRevisionKeys.list(bookId) })
    },
  })
}

export function useDeleteBookRevisionMutation(bookId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBookRevision(bookId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookRevisionKeys.list(bookId) })
    },
  })
}
