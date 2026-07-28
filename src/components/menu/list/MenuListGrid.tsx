import { useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { themeQuartz, type ColDef, type ValueGetterParams } from 'ag-grid-community'
import { Badge } from '@/components/common/ui/Badge'
import type { MenuAdminItem } from '@/types/menuAdmin'

const gridTheme = themeQuartz.withParams({
  headerBackgroundColor: '#f9fafb',
  headerTextColor: '#374151',
  rowHoverColor: '#fef2f2',
  borderColor: '#e5e7eb',
  fontSize: 13,
})

interface MenuListGridProps {
  rows: MenuAdminItem[]
  loading: boolean
}

export function MenuListGrid({ rows, loading }: MenuListGridProps) {
  const columnDefs = useMemo<ColDef<MenuAdminItem>[]>(
    () => [
      {
        headerName: 'No',
        width: 70,
        valueGetter: (p: ValueGetterParams<MenuAdminItem>) => (p.node?.rowIndex ?? 0) + 1,
      },
      { field: 'label', headerName: '메뉴명', flex: 1, minWidth: 160 },
      { field: 'parentLabel', headerName: '상위메뉴', width: 160 },
      { field: 'path', headerName: '경로', flex: 1, minWidth: 160 },
      { field: 'sortOrder', headerName: '정렬순서', width: 100 },
      {
        field: 'useYn',
        headerName: '사용여부',
        width: 100,
        cellRenderer: (p: { value: boolean }) => (
          <Badge tone={p.value ? 'green' : 'gray'}>{p.value ? 'Y' : 'N'}</Badge>
        ),
      },
      { field: 'updatedAt', headerName: '수정일', width: 120 },
    ],
    [],
  )

  return (
    <div style={{ height: 480 }}>
      <AgGridReact<MenuAdminItem>
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
