import type { z } from 'zod'
import { defineFormRules, validateForm } from '@/utils/formUtils'

export const adminRoleSearchRules = defineFormRules({
  keyword: { type: 'string', label: '이름·이메일' },
})

export const adminRoleSearchSchema = validateForm(adminRoleSearchRules)

export type AdminRoleSearchFormValues = z.infer<typeof adminRoleSearchSchema>
