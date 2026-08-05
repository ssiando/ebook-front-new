import dayjs from 'dayjs'
import { apiClient } from '@/lib/axios'
import { delay } from '@/utils/delay'
import type {
  ProgramAdminItem,
  ProgramAdminListResponse,
  ProgramSearchParams,
} from '@/types/programAdmin'

// NOTE: 백엔드 연동 전까지 화면 확인용 목데이터를 사용합니다.
// 실제 연동 시 아래 목데이터/지연 로직을 제거하고 apiClient 호출만 남기면 됩니다.
// 엑셀 업/다운로드·대용량 다운로드 등 파일 연동 기능은 이 저장소 범위 밖이라 구현하지 않았습니다.
const MOCK_PROGRAMS: ProgramAdminItem[] = [
  {
    id: 502,
    system: 'VFX',
    parentProgramId: null,
    code: '2TEST',
    name: 'TEST123332211',
    type: 'API',
    httpMethod: '',
    url: '',
    sortOrder: 0,
    displayYn: true,
    useYn: true,
    platformAdminOnly: false,
    i18nKeyId: '',
    description: '',
    createdAt: '2026-06-04 10:52:51',
    updatedAt: '2026-06-04 10:52:51',
  },
  {
    id: 138,
    system: 'VFX',
    parentProgramId: null,
    code: 'PROGRAM_API_LIST',
    name: '프로그램 목록 조회',
    type: 'API',
    httpMethod: 'GET',
    url: '/api/v1/workspaces/{workspaceId}/programs',
    sortOrder: 1,
    displayYn: false,
    useYn: true,
    platformAdminOnly: false,
    i18nKeyId: '263',
    description: '프로그램 목록 조회 API',
    createdAt: '2026-05-08 14:41:11',
    updatedAt: '2026-05-08 14:41:11',
  },
  {
    id: 283,
    system: 'VFX',
    parentProgramId: null,
    code: 'MANAGEMENT_API_C',
    name: '프로젝트 목록 조회',
    type: 'API',
    httpMethod: 'GET',
    url: '/api/project/list',
    sortOrder: 1,
    displayYn: true,
    useYn: true,
    platformAdminOnly: false,
    i18nKeyId: '',
    description: '프로젝트 목록 조회',
    createdAt: '2026-05-08 14:41:11',
    updatedAt: '2026-05-08 14:41:11',
  },
  {
    id: 535,
    system: 'VFX',
    parentProgramId: null,
    code: 'USR_MGT',
    name: '사용자 관리',
    type: 'PAGE',
    httpMethod: 'GET',
    url: '/api/v1/users',
    sortOrder: 1,
    displayYn: true,
    useYn: true,
    platformAdminOnly: false,
    i18nKeyId: '611',
    description: '사용자 관리 화면',
    createdAt: '2026-06-08 17:19:32',
    updatedAt: '2026-06-08 17:19:32',
  },
  {
    id: 538,
    system: 'VFX',
    parentProgramId: null,
    code: 'VFXMASTERMNG',
    name: '대시보드',
    type: 'PAGE',
    httpMethod: 'GET',
    url: '/api/v1/users',
    sortOrder: 1,
    displayYn: true,
    useYn: true,
    platformAdminOnly: false,
    i18nKeyId: '622',
    description: '사용자 관리 화면',
    createdAt: '2026-06-08 17:27:13',
    updatedAt: '2026-06-08 17:27:13',
  },
  {
    id: 543,
    system: 'VFX',
    parentProgramId: null,
    code: 'USR_MGT_TEST_R',
    name: '사용자 관리',
    type: 'PAGE',
    httpMethod: 'GET',
    url: '/api/v1/users',
    sortOrder: 1,
    displayYn: true,
    useYn: true,
    platformAdminOnly: false,
    i18nKeyId: '612',
    description: '사용자 관리 화면',
    createdAt: '2026-06-09 08:47:33',
    updatedAt: '2026-06-09 08:47:33',
  },
  {
    id: 820,
    system: 'VFX',
    parentProgramId: null,
    code: 'USR_MGT_TEST',
    name: '사용자 관리TEST',
    type: 'PAGE',
    httpMethod: 'GET',
    url: '/api/v1/users',
    sortOrder: 1,
    displayYn: true,
    useYn: false,
    platformAdminOnly: false,
    i18nKeyId: '',
    description: '',
    createdAt: '2026-06-23 13:34:11',
    updatedAt: '2026-06-23 13:34:11',
  },
  {
    id: 823,
    system: 'VFX',
    parentProgramId: null,
    code: 'USR_MGT_TEST_123',
    name: '사용자 관리TEST12',
    type: 'PAGE',
    httpMethod: 'GET',
    url: '/api/v1/users',
    sortOrder: 1,
    displayYn: true,
    useYn: false,
    platformAdminOnly: false,
    i18nKeyId: '',
    description: '',
    createdAt: '2026-06-23 13:37:27',
    updatedAt: '2026-06-23 13:37:27',
  },
  {
    id: 827,
    system: 'VFX',
    parentProgramId: null,
    code: 'USR_MGT_TEST_test',
    name: '사용자 관리TEST_test',
    type: 'PAGE',
    httpMethod: 'GET',
    url: '/api/v1/users',
    sortOrder: 1,
    displayYn: true,
    useYn: false,
    platformAdminOnly: false,
    i18nKeyId: '',
    description: '',
    createdAt: '2026-06-23 13:50:49',
    updatedAt: '2026-06-23 13:50:49',
  },
  {
    id: 139,
    system: 'VFX',
    parentProgramId: 138,
    code: 'PROGRAM_API_DETAIL',
    name: '프로그램 상세 조회',
    type: 'API',
    httpMethod: 'GET',
    url: '/api/v1/workspaces/{workspaceId}/programs/{id}',
    sortOrder: 2,
    displayYn: false,
    useYn: true,
    platformAdminOnly: false,
    i18nKeyId: '302',
    description: '프로그램 상세 조회 API',
    createdAt: '2026-05-08 14:41:11',
    updatedAt: '2026-05-08 14:41:11',
  },
  {
    id: 284,
    system: 'VFX',
    parentProgramId: 283,
    code: 'PROJECT_API_DETAIL',
    name: '프로젝트 상세 조회',
    type: 'API',
    httpMethod: 'GET',
    url: '/api/project/detail',
    sortOrder: 2,
    displayYn: false,
    useYn: true,
    platformAdminOnly: false,
    i18nKeyId: '',
    description: '프로젝트 상세 조회',
    createdAt: '2026-05-08 14:41:11',
    updatedAt: '2026-05-08 14:41:11',
  },
]

let nextId = 1000

function now(): string {
  return dayjs().format('YYYY-MM-DD HH:mm:ss')
}

export async function fetchPrograms(
  params: ProgramSearchParams,
): Promise<ProgramAdminListResponse> {
  if (import.meta.env.DEV) {
    const filtered = MOCK_PROGRAMS.filter((program) => {
      const matchesSystem = program.system === params.system
      const matchesKeyword = params.keyword ? program.name.includes(params.keyword) : true
      const matchesType = params.type === 'ALL' ? true : program.type === params.type
      const matchesUseYn = params.useYn === 'ALL' ? true : program.useYn === (params.useYn === 'Y')
      return matchesSystem && matchesKeyword && matchesType && matchesUseYn
    })
    return delay({ items: [...filtered], totalCount: filtered.length })
  }

  const { data } = await apiClient.get<ProgramAdminListResponse>('/programs', { params })
  return data
}

export async function savePrograms(
  programs: ProgramAdminItem[],
): Promise<ProgramAdminListResponse> {
  if (import.meta.env.DEV) {
    const saved = programs.map((program) =>
      program.id < 0
        ? { ...program, id: nextId++, createdAt: now(), updatedAt: now() }
        : { ...program, updatedAt: now() },
    )
    const savedIds = new Set(saved.map((program) => program.id))
    const others = MOCK_PROGRAMS.filter((program) => !savedIds.has(program.id))
    MOCK_PROGRAMS.splice(0, MOCK_PROGRAMS.length, ...others, ...saved)
    return delay({ items: [...MOCK_PROGRAMS], totalCount: MOCK_PROGRAMS.length })
  }

  const { data } = await apiClient.put<ProgramAdminListResponse>('/programs', { programs })
  return data
}

export async function deletePrograms(ids: number[]): Promise<void> {
  if (import.meta.env.DEV) {
    const remaining = MOCK_PROGRAMS.filter((program) => !ids.includes(program.id))
    MOCK_PROGRAMS.splice(0, MOCK_PROGRAMS.length, ...remaining)
    await delay(undefined)
    return
  }

  await apiClient.delete('/programs', { data: { ids } })
}
