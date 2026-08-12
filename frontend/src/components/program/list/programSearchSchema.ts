import { z } from 'zod'

// workspaceId/type/useYn이 모두 select(값이 항상 문자열)라 defineFormRules 표준 규칙 밖의 경우 — 패턴 B 사용.
// workspaceId는 실제 조회/등록 시 ProgramManagement에서 Number()로 변환한다.
export const programSearchSchema = z.object({
  workspaceId: z.string().min(1, '워크스페이스를 선택해 주세요'),
  keyword: z.string(),
  type: z.enum(['ALL', 'API', 'PAGE']),
  useYn: z.enum(['ALL', 'Y', 'N']),
})

export type ProgramSearchFormValues = z.infer<typeof programSearchSchema>
