import type { z } from 'zod'
import { defineFormRules, validateForm } from '@/utils/formUtils'

export const roleSearchRules = defineFormRules({
  keyword: { type: 'string', label: '역할명' },
})

export const roleSearchSchema = validateForm(roleSearchRules)

export type RoleSearchFormValues = z.infer<typeof roleSearchSchema>
