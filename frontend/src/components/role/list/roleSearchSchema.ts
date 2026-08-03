import { z } from 'zod'
import { SYSTEMS } from '@/types/role'

// system이 enum select라 defineFormRules 표준 규칙(문자열/숫자/불리언) 밖의 경우 — 패턴 B 사용.
export const roleSearchSchema = z.object({
  system: z.enum(['ALL', ...SYSTEMS]),
  keyword: z.string(),
})

export type RoleSearchFormValues = z.infer<typeof roleSearchSchema>
