import { z } from 'zod'
import type { CommonCodeSearchParams } from '@/types/commonCode'

// useYn이 enum select라 defineFormRules 표준 규칙(문자열/숫자/불리언) 밖의 경우 — 패턴 B 사용.
// CommonCodeSearchParams(types/commonCode.ts)와 폼 값 타입을 하나로 유지하기 위해 satisfies로 스키마가
// 해당 타입과 어긋나지 않는지 컴파일 타임에 검증한다.
export const commonCodeSearchSchema = z.object({
  keyword: z.string(),
  useYn: z.enum(['ALL', 'Y', 'N']),
}) satisfies z.ZodType<CommonCodeSearchParams>
