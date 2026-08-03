import { z } from 'zod'
import { ADMIN_DEPARTMENTS } from '@/types/admin'

// department는 enum select, status는 공통코드(런타임 조회)라 값 목록을 정적으로 알 수 없어
// 문자열로만 받는다 — defineFormRules 표준 규칙 밖의 경우이므로 패턴 B 사용.
export const searchSchema = z.object({
  updatedFrom: z.string(),
  updatedTo: z.string(),
  keyword: z.string(),
  department: z.enum(['ALL', ...ADMIN_DEPARTMENTS] as const),
  status: z.string(),
})

export type AdminSearchFormValues = z.infer<typeof searchSchema>
