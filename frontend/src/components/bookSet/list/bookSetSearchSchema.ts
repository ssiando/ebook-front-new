import type { z } from 'zod'
import { defineFormRules, validateForm } from '@/utils/formUtils'

export const bookSetSearchRules = defineFormRules({
  keyword: { type: 'string', label: '세트명' },
})

export const bookSetSearchSchema = validateForm(bookSetSearchRules)

export type BookSetSearchFormValues = z.infer<typeof bookSetSearchSchema>
