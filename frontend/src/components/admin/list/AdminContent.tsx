import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AgGridReact } from 'ag-grid-react'
import {
  themeQuartz,
  type ColDef,
  type ICellRendererParams,
  type RowClassRules,
  type RowClickedEvent,
  type SelectionChangedEvent,
} from 'ag-grid-community'
import { AdminDetailPanel } from './AdminDetailPanel'
import { AdminCreateModal } from './AdminCreateModal'
import { AddButton } from '@/components/common/ui/AddButton'
import { DeleteButton } from '@/components/common/ui/DeleteButton'
import { Badge } from '@/components/common/ui/Badge'
import { useAdminsQuery, useDeleteAdminMutation } from '@/query/admin-query'
import { useCodeItemsByGroupCodeQuery } from '@/query/common-code-query'
import { ADMIN_STATUS_GROUP_CODE, type Admin, type AdminSearchParams } from '@/types/admin'
import { toBadgeTone } from '@/utils/badgeTone'

const gridTheme = themeQuartz.withParams({
  headerBackgroundColor: '#f9fafb',
  headerTextColor: '#374151',
  rowHoverColor: '#fef2f2',
  borderColor: '#e5e7eb',
  fontSize: 13,
})

function formatLastLogin(value: string | undefined): string {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 16)
}

interface AdminContentProps {
  params: AdminSearchParams
  searchRevision: number
}

export function AdminContent({ params, searchRevision }: AdminContentProps) {
  const { t } = useTranslation(['admin', 'common'])
  const { data, isFetching } = useAdminsQuery(params, searchRevision)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [checkedIds, setCheckedIds] = useState<string[]>([])
  const deleteAdmin = useDeleteAdminMutation()
  const selectedAdmin = data?.find((admin) => admin.id === selectedId) ?? null

  const statusCodesQuery = useCodeItemsByGroupCodeQuery(ADMIN_STATUS_GROUP_CODE)
  const statusCodeByValue = useMemo(
    () => new Map((statusCodesQuery.data ?? []).map((code) => [code.code, code])),
    [statusCodesQuery.data],
  )

  const rowClassRules = useMemo<RowClassRules<Admin>>(
    () => ({
      'bg-rose-50': (p) => p.data?.id === selectedId,
    }),
    [selectedId],
  )

  const columnDefs = useMemo<ColDef<Admin>[]>(
    () => [
      { headerCheckboxSelection: true, checkboxSelection: true, width: 44, pinned: 'left' },
      { field: 'id', headerName: 'ID', width: 70 },
      {
        headerName: t('columns.nameEmail'),
        flex: 1.4,
        minWidth: 180,
        cellRenderer: (p: ICellRendererParams<Admin>) =>
          p.data && (
            <div className="flex items-center gap-2 py-1">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
                {p.data.adminName.slice(0, 1)}
              </span>
              <div className="flex min-w-0 flex-col leading-tight">
                <span className="truncate font-medium text-gray-800">{p.data.adminName}</span>
                <span className="truncate text-xs text-gray-400">{p.data.email}</span>
              </div>
            </div>
          ),
      },
      {
        field: 'groups',
        headerName: t('columns.groups'),
        flex: 1,
        minWidth: 140,
        cellDataType: false,
        cellRenderer: (p: { value: Admin['groups'] }) => (
          <div className="flex flex-wrap items-center gap-1 py-1">
            {p.value.length === 0 ? (
              <span className="text-gray-300">-</span>
            ) : (
              p.value.map((group) => (
                <Badge key={group} tone="blue">
                  {group}
                </Badge>
              ))
            )}
          </div>
        ),
      },
      {
        field: 'status',
        headerName: t('columns.status'),
        width: 100,
        cellRenderer: (p: { value: Admin['status'] }) => {
          const code = statusCodeByValue.get(p.value)
          return <Badge tone={toBadgeTone(code?.metadata)}>{code?.codeName ?? p.value}</Badge>
        },
      },
      {
        field: 'lastLoginAt',
        headerName: t('columns.lastLogin'),
        width: 150,
        valueFormatter: (p) => formatLastLogin(p.value),
      },
    ],
    [t, statusCodeByValue],
  )

  const handleDelete = async () => {
    if (checkedIds.length === 0) return
    if (!window.confirm(t('deleteConfirm', { count: checkedIds.length }))) return
    await Promise.all(checkedIds.map((id) => deleteAdmin.mutateAsync(id)))
    setCheckedIds([])
  }

  return (
    <>
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mt-5">
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              {t('totalCount', { count: data?.length ?? 0 })}
            </span>
            <div className="flex gap-2">
              <AddButton onClick={() => setCreateOpen(true)}>
                {t('common:button.register')}
              </AddButton>
              <DeleteButton
                onClick={handleDelete}
                disabled={checkedIds.length === 0 || deleteAdmin.isPending}
              >
                {t('common:button.delete')}
              </DeleteButton>
            </div>
          </div>

          <div style={{ height: 480 }}>
            <AgGridReact<Admin>
              theme={gridTheme}
              rowData={data ?? []}
              columnDefs={columnDefs}
              loading={isFetching}
              rowHeight={44}
              headerHeight={40}
              rowSelection="multiple"
              suppressRowClickSelection
              rowClassRules={rowClassRules}
              getRowId={(p) => p.data.id}
              onRowClicked={(e: RowClickedEvent<Admin>) => e.data && setSelectedId(e.data.id)}
              onSelectionChanged={(e: SelectionChangedEvent<Admin>) =>
                setCheckedIds(e.api.getSelectedRows().map((row) => row.id))
              }
              suppressCellFocus
            />
          </div>
        </div>

        <AdminDetailPanel admin={selectedAdmin} />
      </div>

      <AdminCreateModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  )
}
