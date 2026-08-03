import { useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { themeQuartz, type ColDef, type ValueGetterParams } from 'ag-grid-community'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/common/ui/Badge'
import { useCodeItemsByGroupCodeQuery } from '@/query/common-code-query'
import { ADMIN_STATUS_GROUP_CODE, type Admin } from '@/types/admin'
import type { Role } from '@/types/role'
import { toBadgeTone } from '@/utils/badgeTone'

const gridTheme = themeQuartz.withParams({
  headerBackgroundColor: '#f9fafb',
  headerTextColor: '#374151',
  rowHoverColor: '#fef2f2',
  borderColor: '#e5e7eb',
  fontSize: 13,
})

interface AdminListGridProps {
  rows: Admin[]
  roles: Role[]
  loading: boolean
  page: number
  pageSize: number
}

export function AdminListGrid({ rows, roles, loading, page, pageSize }: AdminListGridProps) {
  const { t } = useTranslation('admin')

  const roleNameById = useMemo(() => new Map(roles.map((role) => [role.id, role.roleName])), [roles])

  // 관리자 상태 라벨/배지색은 공통코드(그룹코드 ADMIN_STATUS)의 codeName/metadata에서 가져온다.
  const statusCodesQuery = useCodeItemsByGroupCodeQuery(ADMIN_STATUS_GROUP_CODE)
  const statusCodeByValue = useMemo(
    () => new Map((statusCodesQuery.data ?? []).map((code) => [code.code, code])),
    [statusCodesQuery.data],
  )

  const columnDefs = useMemo<ColDef<Admin>[]>(
    () => [
      {
        headerName: t('columns.no'),
        width: 70,
        valueGetter: (p: ValueGetterParams<Admin>) =>
          (page - 1) * pageSize + (p.node?.rowIndex ?? 0) + 1,
      },
      { field: 'adminId', headerName: t('columns.adminId'), width: 140 },
      { field: 'adminName', headerName: t('columns.adminName'), flex: 1, minWidth: 140 },
      { field: 'department', headerName: t('columns.department'), width: 150 },
      {
        field: 'roleIds',
        headerName: t('columns.roles'),
        flex: 1,
        minWidth: 200,
        cellRenderer: (p: { value: Admin['roleIds'] }) => (
          <div className="flex flex-wrap items-center gap-1 py-1">
            {p.value.map((roleId) => (
              <Badge key={roleId} tone="gray">
                {roleNameById.get(roleId) ?? roleId}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        field: 'status',
        headerName: t('columns.status'),
        width: 110,
        cellRenderer: (p: { value: Admin['status'] }) => {
          const code = statusCodeByValue.get(p.value)
          return <Badge tone={toBadgeTone(code?.metadata)}>{code?.codeName ?? p.value}</Badge>
        },
      },
      {
        field: 'registrant',
        headerName: t('columns.registrant'),
        width: 100,
        cellRenderer: (p: { value: string }) => (
          <a href="#" className="text-blue-600 hover:underline" onClick={(e) => e.preventDefault()}>
            {p.value}
          </a>
        ),
      },
      { field: 'updatedAt', headerName: t('columns.updatedAt'), width: 120 },
    ],
    [t, page, pageSize, roleNameById, statusCodeByValue],
  )

  return (
    <div style={{ height: 480 }}>
      <AgGridReact<Admin>
        theme={gridTheme}
        rowData={rows}
        columnDefs={columnDefs}
        loading={loading}
        rowHeight={40}
        headerHeight={40}
        suppressCellFocus
      />
    </div>
  )
}
