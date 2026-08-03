import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { PageTitle } from '@/components/common/PageTitle'
import { PageSearch } from '@/components/common/PageSearch'
import { Pagination } from '@/components/common/Pagination'
import { Authorized } from '@/components/auth/Authorized'
import { AdminRoleSearch } from '@/components/adminRole/list/AdminRoleSearch'
import {
  adminRoleSearchRules,
  adminRoleSearchSchema,
  type AdminRoleSearchFormValues,
} from '@/components/adminRole/list/adminRoleSearchSchema'
import { AdminRoleListGrid } from '@/components/adminRole/list/AdminRoleListGrid'
import { AdminRoleAssignPanel } from '@/components/adminRole/list/AdminRoleAssignPanel'
import { useAdminsQuery, useUpdateAdminRolesMutation } from '@/query/admin-query'
import { useRolesQuery } from '@/query/role-query'
import type { AdminSearchParams } from '@/types/admin'
import { showFormErrors } from '@/utils/formUtils'
import { useToastStore } from '@/store/useToastStore'

const DEFAULT_SEARCH: AdminRoleSearchFormValues = { keyword: '' }

export default function AdminRoleManagement() {
  const [params, setParams] = useState<AdminSearchParams>({
    ...DEFAULT_SEARCH,
    page: 1,
    pageSize: 15,
  })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [checkedRoleIds, setCheckedRoleIds] = useState<Set<string>>(new Set())

  const { control, reset, handleSubmit } = useForm<AdminRoleSearchFormValues>({
    resolver: zodResolver(adminRoleSearchSchema),
    defaultValues: DEFAULT_SEARCH,
  })

  const adminsQuery = useAdminsQuery(params)
  // 역할 할당 그룹을 표시하기 위해 전체 역할 목록을 함께 조회합니다.
  const rolesQuery = useRolesQuery({ system: 'ALL', keyword: '', page: 1, pageSize: 200 })
  const updateAdminRoles = useUpdateAdminRolesMutation()

  const admins = adminsQuery.data?.items ?? []
  const roles = rolesQuery.data?.items ?? []
  const selectedAdmin = admins.find((admin) => admin.id === selectedId) ?? null

  // 관리자를 클릭할 때마다 우측 역할 할당 체크 상태를 해당 관리자의 roleIds로 다시 렌더링한다.
  useEffect(() => {
    setCheckedRoleIds(new Set(selectedAdmin?.roleIds ?? []))
  }, [selectedAdmin])

  const handleSearch = handleSubmit(
    (values) => setParams((prev) => ({ ...prev, ...values, page: 1 })),
    (errors) => showFormErrors(errors, adminRoleSearchRules),
  )

  const handleReset = () => {
    reset(DEFAULT_SEARCH)
    setParams((prev) => ({ ...prev, ...DEFAULT_SEARCH, page: 1 }))
  }

  const handleToggleRole = (roleId: string, checked: boolean) => {
    setCheckedRoleIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(roleId)
      else next.delete(roleId)
      return next
    })
  }

  const handleSave = () => {
    if (!selectedAdmin) return
    updateAdminRoles.mutate(
      { id: selectedAdmin.id, roleIds: Array.from(checkedRoleIds) },
      { onSuccess: () => useToastStore.getState().push('역할을 저장했습니다.') },
    )
  }

  return (
    <Authorized>
      {/* 1. 타이틀 영역 — breadcrumb은 menu.json에서 자동 탐색 */}
      <PageTitle title="관리자별 역할 관리" actionButtonsProps={{ onSearch: handleSearch }} />

      {/* 2. 조회 영역 */}
      <PageSearch onReset={handleReset}>
        <AdminRoleSearch control={control} />
      </PageSearch>

      {/* 3. 본문 — 좌: 관리자 목록, 우: 선택한 관리자의 역할 할당 */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              사용자 목록 총 {adminsQuery.data?.totalCount ?? 0}건
            </span>
          </div>

          <AdminRoleListGrid
            rows={admins}
            loading={adminsQuery.isFetching}
            page={params.page}
            pageSize={params.pageSize}
            selectedId={selectedId}
            onSelectRow={setSelectedId}
          />

          <Pagination
            page={params.page}
            pageSize={params.pageSize}
            totalCount={adminsQuery.data?.totalCount ?? 0}
            onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
          />
        </div>

        <AdminRoleAssignPanel
          admin={selectedAdmin}
          roles={roles}
          checkedRoleIds={checkedRoleIds}
          saving={updateAdminRoles.isPending}
          onToggleRole={handleToggleRole}
          onSave={handleSave}
        />
      </div>
    </Authorized>
  )
}
