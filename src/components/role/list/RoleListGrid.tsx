import { useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { themeQuartz, type ColDef, type ValueGetterParams } from 'ag-grid-community'
import { Badge } from '@/components/common/ui/Badge'
import type { Role } from '@/types/role'

const gridTheme = themeQuartz.withParams({
  headerBackgroundColor: '#f9fafb',
  headerTextColor: '#374151',
  rowHoverColor: '#fef2f2',
  borderColor: '#e5e7eb',
  fontSize: 13,
})

interface RoleListGridProps {
  rows: Role[]
  loading: boolean
  onConfigureMenus: (role: Role) => void
}

export function RoleListGrid({ rows, loading, onConfigureMenus }: RoleListGridProps) {
  const columnDefs = useMemo<ColDef<Role>[]>(
    () => [
      {
        headerName: 'No',
        width: 70,
        valueGetter: (p: ValueGetterParams<Role>) => (p.node?.rowIndex ?? 0) + 1,
      },
      { field: 'roleName', headerName: '역할명', width: 160 },
      { field: 'description', headerName: '설명', flex: 1, minWidth: 200 },
      {
        field: 'menuIds',
        headerName: '설정된 메뉴',
        width: 120,
        valueGetter: (p) => (p.data ? `${p.data.menuIds.length}개` : ''),
      },
      {
        field: 'useYn',
        headerName: '사용여부',
        width: 100,
        cellRenderer: (p: { value: boolean }) => (
          <Badge tone={p.value ? 'green' : 'gray'}>{p.value ? 'Y' : 'N'}</Badge>
        ),
      },
      { field: 'registrant', headerName: '등록자', width: 100 },
      { field: 'updatedAt', headerName: '수정일', width: 120 },
      {
        headerName: '메뉴 설정',
        width: 110,
        sortable: false,
        cellRenderer: (p: { data?: Role }) =>
          p.data ? (
            <button
              type="button"
              onClick={() => onConfigureMenus(p.data!)}
              className="text-sm text-blue-600 hover:underline"
            >
              메뉴 설정
            </button>
          ) : null,
      },
    ],
    [onConfigureMenus],
  )

  return (
    <div style={{ height: 480 }}>
      <AgGridReact<Role>
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
