import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { PageTitle } from '@/components/common/PageTitle'
import { PageSearch } from '@/components/common/PageSearch'
import { Button } from '@/components/common/ui/Button'
import { Pagination } from '@/components/common/Pagination'
import { Authorized } from '@/components/auth/Authorized'
import { RoleSearch } from '@/components/role/list/RoleSearch'
import {
  roleSearchSchema,
  type RoleSearchFormValues,
} from '@/components/role/list/roleSearchSchema'
import { RoleListGrid } from '@/components/role/list/RoleListGrid'
import { MenuGrantTree } from '@/components/role/list/MenuGrantTree'
import {
  useDeleteRolesMutation,
  useRolesQuery,
  useSaveRolesMutation,
  useUpdateRoleProgramsMutation,
} from '@/query/role-query'
import type { Role, RoleSearchParams } from '@/types/role'
import type { ProgramItem } from '@/types/program'
import programsData from '@/data/programs.json'

const DEFAULT_SEARCH: RoleSearchFormValues = { system: 'ALL', keyword: '' }
const programs = programsData as ProgramItem[]

export default function RoleManagement() {
  const [params, setParams] = useState<RoleSearchParams>({
    ...DEFAULT_SEARCH,
    page: 1,
    pageSize: 15,
  })
  const [roleRows, setRoleRows] = useState<Role[]>([])
  const [checkedRoleIds, setCheckedRoleIds] = useState<string[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [checkedMenuIds, setCheckedMenuIds] = useState<Set<string>>(new Set())

  const methods = useForm<RoleSearchFormValues>({
    resolver: zodResolver(roleSearchSchema),
    defaultValues: DEFAULT_SEARCH,
  })

  const rolesQuery = useRolesQuery(params)
  const saveRoles = useSaveRolesMutation()
  const deleteRoles = useDeleteRolesMutation()
  const updatePrograms = useUpdateRoleProgramsMutation()

  useEffect(() => {
    if (rolesQuery.data) setRoleRows(rolesQuery.data.items)
  }, [rolesQuery.data])

  const selectedRole = roleRows.find((role) => role.id === selectedId) ?? null

  // 역할을 클릭할 때마다 좌측 메뉴 그리드의 체크 상태를 해당 역할의 programIds로 다시 렌더링한다.
  useEffect(() => {
    setCheckedMenuIds(new Set(selectedRole?.programIds ?? []))
  }, [selectedRole])

  const handleSearch = methods.handleSubmit((values) => {
    setParams((prev) => ({ ...prev, ...values, page: 1 }))
  })

  const handleReset = () => {
    methods.reset(DEFAULT_SEARCH)
    setParams((prev) => ({ ...prev, ...DEFAULT_SEARCH, page: 1 }))
  }

  const handleCellChange = (id: string, field: keyof Role, value: string) => {
    setRoleRows((prev) => prev.map((role) => (role.id === id ? { ...role, [field]: value } : role)))
  }

  const handleAddRole = () => {
    const defaultSystem = params.system === 'ALL' ? 'VFX' : params.system
    const newRole: Role = {
      id: `new-${Date.now()}`,
      roleName: '',
      description: '',
      system: defaultSystem,
      memberCount: 0,
      programIds: [],
      registrant: 'me',
      createdAt: '-',
      updatedAt: '-',
    }
    setRoleRows((prev) => [newRole, ...prev])
  }

  const handleSaveRoles = () => {
    saveRoles.mutate(roleRows)
  }

  const handleDeleteRoles = () => {
    deleteRoles.mutate(checkedRoleIds, {
      onSuccess: () => {
        if (selectedId && checkedRoleIds.includes(selectedId)) setSelectedId(null)
        setCheckedRoleIds([])
      },
    })
  }

  const handleToggleMenu = (id: string, checked: boolean) => {
    setCheckedMenuIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const handleSaveMenus = () => {
    if (!selectedRole) return
    updatePrograms.mutate({ id: selectedRole.id, programIds: Array.from(checkedMenuIds) })
  }

  return (
    <Authorized>
      {/* 1. 타이틀 영역 — breadcrumb은 menu.json에서 자동 탐색 */}
      <PageTitle title="역할 관리" actionButtonsProps={{ onSearch: handleSearch }} />

      {/* 2. 조회 영역 */}
      <PageSearch onReset={handleReset}>
        <RoleSearch control={methods.control} />
      </PageSearch>

      {/* 3. 본문 — 좌: 선택한 역할의 메뉴 지정 그리드, 우: 역할 목록 그리드 (넓이 동일) */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              역할 목록 총 {rolesQuery.data?.totalCount ?? 0}건
            </span>
            <div className="flex gap-2">
              <Button type="button" variant="primary" onClick={handleAddRole}>
                등록
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleSaveRoles}
                disabled={saveRoles.isPending}
              >
                수정
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleDeleteRoles}
                disabled={checkedRoleIds.length === 0 || deleteRoles.isPending}
              >
                삭제
              </Button>
            </div>
          </div>

          <RoleListGrid
            rows={roleRows}
            loading={rolesQuery.isFetching}
            selectedId={selectedId}
            onSelectRow={setSelectedId}
            onCellChange={handleCellChange}
            onSelectionChange={setCheckedRoleIds}
          />

          <Pagination
            page={params.page}
            pageSize={params.pageSize}
            totalCount={rolesQuery.data?.totalCount ?? 0}
            onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              메뉴 목록{selectedRole ? ` · ${selectedRole.roleName}` : ''} 총 {programs.length}건
            </span>
            <Button
              type="button"
              variant="primary"
              onClick={handleSaveMenus}
              disabled={!selectedRole || updatePrograms.isPending}
            >
              저장
            </Button>
          </div>
          {!selectedRole && (
            <p className="text-xs text-gray-400">역할을 선택하면 메뉴를 지정할 수 있습니다.</p>
          )}
          <MenuGrantTree
            rows={programs}
            loading={false}
            checkedIds={checkedMenuIds}
            disabled={!selectedRole}
            onToggle={handleToggleMenu}
          />
        </div>
      </div>
    </Authorized>
  )
}
