import type { z } from 'zod'
import { defineFormRules, validateForm } from '@/utils/formUtils'

export const dbBackupSearchRules = defineFormRules({
  keyword: { type: 'string', label: '백업명' },
})

export const dbBackupSearchSchema = validateForm(dbBackupSearchRules)

export type DbBackupSearchFormValues = z.infer<typeof dbBackupSearchSchema>
