import type { z } from 'zod'
import { defineFormRules, validateForm } from '@/utils/formUtils'

export const menuSearchRules = defineFormRules({
  keyword: { type: 'string', label: '메뉴명' },
})

export const menuSearchSchema = validateForm(menuSearchRules)

export type MenuSearchFormValues = z.infer<typeof menuSearchSchema>
