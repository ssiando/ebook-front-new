import { apiClient } from '@/lib/axios'
import { delay } from '@/utils/delay'
import { ADMIN_STATUS_GROUP_CODE } from '@/types/admin'
import type {
  CodeGroup,
  CodeGroupListResponse,
  CodeItem,
  CodeItemListResponse,
  CommonCodeSearchParams,
} from '@/types/commonCode'

// NOTE: 백엔드 연동 전까지 화면 확인용 목데이터를 사용합니다.
// 실제 연동 시 아래 목데이터/지연 로직을 제거하고 apiClient 호출만 남기면 됩니다.
// 화면 자체도 "API는 추후 연동 예정, 현재는 화면·그리드 동작만 확인" 문구를 실제로 노출합니다.
const MOCK_GROUPS: CodeGroup[] = [
  {
    id: 'group-1',
    groupCode: 'VFX_CM003',
    groupName: '진행상태',
    description: '진행상태',
    useYn: true,
    i18nKey: 'code.vfx_cm003',
    createdAt: '2026-05-26 16:41:23',
    updatedAt: '2026-06-01 17:58:15',
  },
  {
    id: 'group-2',
    groupCode: 'VFX_CM001',
    groupName: '프로젝트유형',
    description: '프로젝트 유형 코드',
    useYn: true,
    i18nKey: 'code.vfx_cm001',
    createdAt: '2026-05-20 10:12:00',
    updatedAt: '2026-05-20 10:12:00',
  },
  {
    id: 'group-3',
    groupCode: 'VFX_CM002',
    groupName: '승인상태',
    description: '승인 상태 코드',
    useYn: false,
    i18nKey: 'code.vfx_cm002',
    createdAt: '2026-05-22 09:00:00',
    updatedAt: '2026-05-22 09:00:00',
  },
  {
    id: 'group-4',
    groupCode: ADMIN_STATUS_GROUP_CODE,
    groupName: '관리자 상태',
    description: '관리자 계정 상태 코드',
    useYn: true,
    i18nKey: 'code.admin_status',
    createdAt: '2026-07-01 09:00:00',
    updatedAt: '2026-07-01 09:00:00',
  },
]

const MOCK_ITEMS: CodeItem[] = [
  {
    id: 'item-1',
    groupId: 'group-1',
    code: '001',
    codeName: '저장',
    sortOrder: 1,
    useYn: true,
    description: 'SX 공통 진행상태-저장',
    metadata: '',
    i18nKey: '',
    createdAt: '2026-07-21 09:53:18',
    updatedAt: '2026-07-22 11:59:16',
  },
  {
    id: 'item-2',
    groupId: 'group-1',
    code: '002',
    codeName: '확정',
    sortOrder: 2,
    useYn: true,
    description: 'SX 공통 진행상태-확정',
    metadata: '',
    i18nKey: '',
    createdAt: '2026-07-21 09:53:22',
    updatedAt: '2026-07-22 11:59:19',
  },
  {
    id: 'item-3',
    groupId: 'group-1',
    code: '999',
    codeName: '삭제',
    sortOrder: 3,
    useYn: true,
    description: 'SX 공통 진행상태-삭제',
    metadata: '',
    i18nKey: '',
    createdAt: '2026-07-21 09:53:25',
    updatedAt: '2026-07-22 11:59:19',
  },
  {
    id: 'item-4',
    groupId: 'group-1',
    code: '009',
    codeName: '확정취소',
    sortOrder: 4,
    useYn: true,
    description: 'SX 공통 진행상태-확정취소',
    metadata: '',
    i18nKey: '',
    createdAt: '2026-07-22 11:59:19',
    updatedAt: '2026-07-22 11:59:19',
  },
  {
    id: 'item-5',
    groupId: 'group-2',
    code: '001',
    codeName: '영화',
    sortOrder: 1,
    useYn: true,
    description: '',
    metadata: '',
    i18nKey: '',
    createdAt: '2026-05-20 10:12:00',
    updatedAt: '2026-05-20 10:12:00',
  },
  {
    id: 'item-6',
    groupId: 'group-2',
    code: '002',
    codeName: '광고',
    sortOrder: 2,
    useYn: true,
    description: '',
    metadata: '',
    i18nKey: '',
    createdAt: '2026-05-20 10:12:00',
    updatedAt: '2026-05-20 10:12:00',
  },
  // 관리자 상태 코드: metadata에 배지 색상(tone)을 담아 화면에서 그대로 사용합니다.
  {
    id: 'item-7',
    groupId: 'group-4',
    code: 'ACTIVE',
    codeName: '활성',
    sortOrder: 1,
    useYn: true,
    description: '정상적으로 활동 중인 관리자',
    metadata: 'green',
    i18nKey: '',
    createdAt: '2026-07-01 09:00:00',
    updatedAt: '2026-07-01 09:00:00',
  },
  {
    id: 'item-8',
    groupId: 'group-4',
    code: 'DORMANT',
    codeName: '휴면',
    sortOrder: 2,
    useYn: true,
    description: '장기 미접속으로 휴면 처리된 관리자',
    metadata: 'gray',
    i18nKey: '',
    createdAt: '2026-07-01 09:00:00',
    updatedAt: '2026-07-01 09:00:00',
  },
  {
    id: 'item-9',
    groupId: 'group-4',
    code: 'INACTIVE',
    codeName: '비활성',
    sortOrder: 3,
    useYn: true,
    description: '사용이 중지된 관리자',
    metadata: 'red',
    i18nKey: '',
    createdAt: '2026-07-01 09:00:00',
    updatedAt: '2026-07-01 09:00:00',
  },
  {
    id: 'item-10',
    groupId: 'group-4',
    code: 'NEW',
    codeName: '신규',
    sortOrder: 4,
    useYn: true,
    description: '새로 등록되어 아직 승인되지 않은 관리자',
    metadata: 'blue',
    i18nKey: '',
    createdAt: '2026-07-01 09:00:00',
    updatedAt: '2026-07-01 09:00:00',
  },
]

function now(): string {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

export async function fetchCodeGroups(
  params: CommonCodeSearchParams,
): Promise<CodeGroupListResponse> {
  if (import.meta.env.DEV) {
    const filtered = MOCK_GROUPS.filter((group) => {
      const matchesKeyword = params.keyword
        ? group.groupCode.includes(params.keyword) || group.groupName.includes(params.keyword)
        : true
      const matchesUseYn = params.useYn === 'ALL' ? true : group.useYn === (params.useYn === 'Y')
      return matchesKeyword && matchesUseYn
    })
    return delay({ items: [...filtered], totalCount: filtered.length })
  }

  const { data } = await apiClient.get<CodeGroupListResponse>('/common-codes/groups', { params })
  return data
}

export async function saveCodeGroups(groups: CodeGroup[]): Promise<CodeGroupListResponse> {
  if (import.meta.env.DEV) {
    const saved = groups.map((group) =>
      group.id.startsWith('new-')
        ? {
            ...group,
            id: `group-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            updatedAt: now(),
          }
        : { ...group, updatedAt: now() },
    )
    MOCK_GROUPS.splice(0, MOCK_GROUPS.length, ...saved)
    return delay({ items: [...MOCK_GROUPS], totalCount: MOCK_GROUPS.length })
  }

  const { data } = await apiClient.put<CodeGroupListResponse>('/common-codes/groups', { groups })
  return data
}

export async function fetchCodeItems(groupId: string): Promise<CodeItemListResponse> {
  if (import.meta.env.DEV) {
    const filtered = MOCK_ITEMS.filter((item) => item.groupId === groupId)
    return delay({ items: [...filtered], totalCount: filtered.length })
  }

  const { data } = await apiClient.get<CodeItemListResponse>(
    `/common-codes/groups/${groupId}/items`,
  )
  return data
}

/** 그룹코드로 사용 중인 코드 항목만 조회합니다 (다른 화면의 select 옵션 등에서 사용). */
export async function fetchCodeItemsByGroupCode(groupCode: string): Promise<CodeItem[]> {
  if (import.meta.env.DEV) {
    const group = MOCK_GROUPS.find((g) => g.groupCode === groupCode)
    const items = group
      ? MOCK_ITEMS.filter((item) => item.groupId === group.id && item.useYn)
      : []
    return delay([...items].sort((a, b) => a.sortOrder - b.sortOrder))
  }

  const { data } = await apiClient.get<CodeItem[]>(
    `/common-codes/groups/by-code/${groupCode}/items`,
  )
  return data
}

export async function saveCodeItems(
  groupId: string,
  items: CodeItem[],
): Promise<CodeItemListResponse> {
  if (import.meta.env.DEV) {
    const saved = items.map((item) =>
      item.id.startsWith('new-')
        ? {
            ...item,
            id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            groupId,
            updatedAt: now(),
          }
        : { ...item, groupId, updatedAt: now() },
    )
    const others = MOCK_ITEMS.filter((item) => item.groupId !== groupId)
    MOCK_ITEMS.splice(0, MOCK_ITEMS.length, ...others, ...saved)
    return delay({ items: [...saved], totalCount: saved.length })
  }

  const { data } = await apiClient.put<CodeItemListResponse>(
    `/common-codes/groups/${groupId}/items`,
    { items },
  )
  return data
}
