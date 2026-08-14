import { z } from 'zod'
import { BOOK_CATEGORIES, BOOK_STATUSES, type BookSearchParams } from '@/types/book'

// category/status가 'ALL'을 포함하는 enum select라 defineFormRules 표준 규칙 밖의 경우 — 패턴 B 사용.
export const bookSearchSchema = z.object({
  keyword: z.string(),
  category: z.enum(['ALL', ...BOOK_CATEGORIES] as const),
  status: z.enum(['ALL', ...BOOK_STATUSES] as const),
}) satisfies z.ZodType<BookSearchParams>

export type BookSearchFormValues = z.infer<typeof bookSearchSchema>
