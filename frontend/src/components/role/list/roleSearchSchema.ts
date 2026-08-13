import { z } from 'zod'

// workspaceId가 select(값이 항상 문자열)라 defineFormRules 표준 규칙 밖의 경우 — 패턴 B 사용.
// workspaceId는 실제 조회 시 RoleManagement에서 Number()로 변환한다.
export const roleSearchSchema = z.object({
  workspaceId: z.string().min(1, '워크스페이스를 선택해 주세요'),
  keyword: z.string(),
})

export type RoleSearchFormValues = z.infer<typeof roleSearchSchema>
