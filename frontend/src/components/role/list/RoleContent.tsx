import { useEffect, useState } from 'react'
import { confirm } from '@/store/useConfirmStore'
import { AddButton } from '@/components/common/ui/AddButton'
import { SaveButton } from '@/components/common/ui/SaveButton'
import { DeleteButton } from '@/components/common/ui/DeleteButton'
import { RoleListGrid } from './RoleListGrid'
import { RoleCreateModal } from './RoleCreateModal'
import { MenuGrantTree } from './MenuGrantTree'
import {
  useDeleteRoleMutation,
  useRolesQuery,
  useUpdateRoleMutation,
  useUpdateRoleProgramsMutation,
} from '@/query/role-query'
import { useProgramsQuery } from '@/query/program-admin-query'
import type { Role, RoleSearchParams } from '@/types/role'
import type { ProgramSearchParams } from '@/types/programAdmin'

interface RoleContentProps {
  params: RoleSearchParams
  enabled: boolean
}

export function RoleContent({ params, enabled }: RoleContentProps) {
  const [roleRows, setRoleRows] = useState<Role[]>([])
  const [checkedRoleIds, setCheckedRoleIds] = useState<string[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [checkedMenuIds, setCheckedMenuIds] = useState<Set<number>>(new Set())
  const [createOpen, setCreateOpen] = useState(false)

  const rolesQuery = useRolesQuery(params, { enabled })
  const updateRole = useUpdateRoleMutation()
  const deleteRole = useDeleteRoleMutation()
  const updatePrograms = useUpdateRoleProgramsMutation()

  const programSearchParams: ProgramSearchParams = {
    workspaceId: params.workspaceId,
    keyword: '',
    type: 'ALL',
    useYn: 'ALL',
  }
  const programsQuery = useProgramsQuery(programSearchParams, { enabled })
  const programs = programsQuery.data?.items ?? []

  useEffect(() => {
    if (rolesQuery.data) setRoleRows(rolesQuery.data)
  }, [rolesQuery.data])

  const selectedRole = roleRows.find((role) => role.id === selectedId) ?? null

  // 역할을 클릭할 때마다 좌측 메뉴 그리드의 체크 상태를 해당 역할의 programIds로 다시 렌더링한다.
  useEffect(() => {
    setCheckedMenuIds(new Set(selectedRole?.programIds ?? []))
  }, [selectedRole])

  const handleCellChange = (id: string, field: keyof Role, value: string) => {
    const current = roleRows.find((role) => role.id === id)
    if (!current) return
    updateRole.mutate({ ...current, [field]: value })
  }

  const handleDeleteRoles = async () => {
    if (checkedRoleIds.length === 0) return
    if (!(await confirm(`선택한 ${checkedRoleIds.length}건을 삭제하시겠습니까?`))) return
    await Promise.all(checkedRoleIds.map((id) => deleteRole.mutateAsync(id)))
    if (selectedId && checkedRoleIds.includes(selectedId)) setSelectedId(null)
    setCheckedRoleIds([])
  }

  const handleToggleMenu = (id: number, checked: boolean) => {
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
    <div className="mt-4 grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm text-gray-500">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            역할 목록 총 {roleRows.length}건
          </span>
          <div className="flex gap-2">
            <AddButton onClick={() => setCreateOpen(true)}>등록</AddButton>
            <DeleteButton
              onClick={handleDeleteRoles}
              disabled={checkedRoleIds.length === 0 || deleteRole.isPending}
            >
              삭제
            </DeleteButton>
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
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm text-gray-500">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            프로그램 목록{selectedRole ? ` · ${selectedRole.roleName}` : ''} 총 {programs.length}건
          </span>
          <SaveButton
            onClick={handleSaveMenus}
            disabled={!selectedRole || updatePrograms.isPending}
          />
        </div>
        {!selectedRole && (
          <p className="text-xs text-gray-400">역할을 선택하면 프로그램을 지정할 수 있습니다.</p>
        )}
        <MenuGrantTree
          rows={programs}
          loading={programsQuery.isFetching}
          checkedIds={checkedMenuIds}
          disabled={!selectedRole}
          onToggle={handleToggleMenu}
        />
      </div>

      <RoleCreateModal
        open={createOpen}
        workspaceId={params.workspaceId}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  )
}
