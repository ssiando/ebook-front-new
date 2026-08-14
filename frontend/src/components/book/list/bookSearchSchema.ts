import { z } from 'zod'
import { BOOK_TYPES, type BookSearchParams } from '@/types/book'

// bookType/activeYn이 'ALL'을 포함하는 enum select라 defineFormRules 표준 규칙 밖의 경우 — 패턴 B 사용.
export const bookSearchSchema = z.object({
  keyword: z.string(),
  bookType: z.enum(['ALL', ...BOOK_TYPES] as const),
  activeYn: z.enum(['ALL', 'true', 'false']),
}) satisfies z.ZodType<BookSearchParams>

export type BookSearchFormValues = z.infer<typeof bookSearchSchema>
