import { z } from 'zod'

// useYn이 enum select라 defineFormRules 표준 규칙(문자열/숫자/불리언) 밖의 경우 — 패턴 B 사용.
export const commonCodeSearchSchema = z.object({
  keyword: z.string(),
  useYn: z.enum(['ALL', 'Y', 'N']),
})

export type CommonCodeSearchFormValues = z.infer<typeof commonCodeSearchSchema>
