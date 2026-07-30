import { useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { themeQuartz, type ColDef, type ValueGetterParams } from 'ag-grid-community'
import type { Admin } from '@/types/admin'

const gridTheme = themeQuartz.withParams({
  headerBackgroundColor: '#f9fafb',
  headerTextColor: '#374151',
  rowHoverColor: '#fef2f2',
  borderColor: '#e5e7eb',
  fontSize: 13,
})

interface AdminRoleListGridProps {
  rows: Admin[]
  loading: boolean
  page: number
  pageSize: number
  selectedId: string | null
  onSelectRow: (id: string) => void
}

export function AdminRoleListGrid({
  rows,
  loading,
  page,
  pageSize,
  selectedId,
  onSelectRow,
}: AdminRoleListGridProps) {
  const columnDefs = useMemo<ColDef<Admin>[]>(
    () => [
      {
        headerName: '#',
        width: 60,
        valueGetter: (p: ValueGetterParams<Admin>) =>
          (page - 1) * pageSize + (p.node?.rowIndex ?? 0) + 1,
      },
      { field: 'adminName', headerName: '이름', width: 140 },
      { field: 'email', headerName: '이메일', flex: 1, minWidth: 180 },
      {
        headerName: '역할 수',
        width: 90,
        valueGetter: (p: ValueGetterParams<Admin>) => p.data?.roleIds.length ?? 0,
      },
      { field: 'status', headerName: '상태', width: 100 },
    ],
    [page, pageSize],
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
        getRowId={(p) => p.data.id}
        onRowClicked={(e) => e.data && onSelectRow(e.data.id)}
        getRowStyle={(p) => (p.data?.id === selectedId ? { background: '#fef2f2' } : undefined)}
      />
    </div>
  )
}
