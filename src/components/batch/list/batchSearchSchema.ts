import type { z } from 'zod'
import { defineFormRules, validateForm } from '@/utils/formUtils'

export const batchSearchRules = defineFormRules({
  keyword: { type: 'string', label: '배치명' },
})

export const batchSearchSchema = validateForm(batchSearchRules)

export type BatchSearchFormValues = z.infer<typeof batchSearchSchema>
