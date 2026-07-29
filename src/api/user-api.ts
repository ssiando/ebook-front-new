import { apiClient } from '@/lib/axios'
import { delay } from '@/utils/delay'
import type { CreateUserPayload, User, UserListResponse, UserSearchParams } from '@/types/user'

// NOTE: 백엔드 연동 전까지 화면 확인용 목데이터를 사용합니다.
// 실제 연동 시 아래 목데이터/지연 로직을 제거하고 apiClient 호출만 남기면 됩니다.
const MOCK_USERS: User[] = Array.from({ length: 23 }, (_, i) => {
  const idx = 23 - i
  return {
    id: String(idx),
    userId: `user${String(idx).padStart(3, '0')}`,
    userName: `사용자 ${idx}`,
    department: ['콘텐츠운영팀', '라이선스팀', '플랫폼개발팀', '데이터팀'][idx % 4],
    role: (['ADMIN', 'MANAGER', 'MEMBER'] as const)[idx % 3],
    isActive: idx % 5 !== 0,
    projects:
      idx % 3 === 0
        ? [{ id: `p${idx}`, name: `프로젝트 ${idx}` }]
        : [
            { id: `p${idx}a`, name: `프로젝트 ${idx}A` },
            { id: `p${idx}b`, name: `프로젝트 ${idx}B` },
          ],
    registrant: 'vfx',
    updatedAt: `2026-07-${String((idx % 28) + 1).padStart(2, '0')}`,
  }
})

export async function fetchUsers(params: UserSearchParams): Promise<UserListResponse> {
  if (import.meta.env.DEV) {
    const filtered = MOCK_USERS.filter((user) => {
      const matchesKeyword = params.keyword
        ? user.userName.includes(params.keyword) || user.userId.includes(params.keyword)
        : true
      const matchesDate = user.updatedAt >= params.updatedFrom && user.updatedAt <= params.updatedTo
      return matchesKeyword && matchesDate
    })
    const start = (params.page - 1) * params.pageSize
    const items = filtered.slice(start, start + params.pageSize)
    return delay({ items, totalCount: filtered.length })
  }

  const { data } = await apiClient.get<UserListResponse>('/users', { params })
  return data
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  if (import.meta.env.DEV) {
    const created: User = {
      id: String(Date.now()),
      ...payload,
      isActive: true,
      projects: [],
      registrant: 'me',
      updatedAt: new Date().toISOString().slice(0, 10),
    }
    MOCK_USERS.unshift(created)
    return delay(created)
  }

  const { data } = await apiClient.post<User>('/users', payload)
  return data
}
