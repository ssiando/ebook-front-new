import { z } from 'zod'
import { SYSTEMS } from '@/types/role'

// system/type/useYn이 모두 enum select라 defineFormRules 표준 규칙 밖의 경우 — 패턴 B 사용.
export const programSearchSchema = z.object({
  system: z.enum(SYSTEMS),
  keyword: z.string(),
  type: z.enum(['ALL', 'API', 'PAGE']),
  useYn: z.enum(['ALL', 'Y', 'N']),
})

export type ProgramSearchFormValues = z.infer<typeof programSearchSchema>
