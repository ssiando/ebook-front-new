import { z } from 'zod'
import { ADMIN_DEPARTMENTS, type AdminSearchParams } from '@/types/admin'

// department는 enum select, status는 공통코드(런타임 조회)라 값 목록을 정적으로 알 수 없어
// 문자열로만 받는다 — defineFormRules 표준 규칙 밖의 경우이므로 패턴 B 사용.
// AdminSearchParams(types/admin.ts)와 폼 값 타입을 하나로 유지하기 위해 satisfies로 스키마가
// 해당 타입과 어긋나지 않는지 컴파일 타임에 검증한다.
export const searchSchema = z.object({
  keyword: z.string(),
  department: z.enum(['ALL', ...ADMIN_DEPARTMENTS] as const),
  status: z.string(),
}) satisfies z.ZodType<AdminSearchParams>
