import type { z } from 'zod'
import { defineFormRules, validateForm } from '@/utils/formUtils'

export const userSearchRules = defineFormRules({
  updatedFrom: { type: 'string', label: '수정일(시작)' },
  updatedTo: { type: 'string', label: '수정일(종료)' },
  keyword: { type: 'string', label: '사용자명/ID' },
})

export const searchSchema = validateForm(userSearchRules)

export type UserSearchFormValues = z.infer<typeof searchSchema>
