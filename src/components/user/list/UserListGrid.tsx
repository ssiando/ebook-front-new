import { useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { themeQuartz, type ColDef, type ValueGetterParams } from 'ag-grid-community'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/common/ui/Badge'
import type { User } from '@/types/user'

const gridTheme = themeQuartz.withParams({
  headerBackgroundColor: '#f9fafb',
  headerTextColor: '#374151',
  rowHoverColor: '#fef2f2',
  borderColor: '#e5e7eb',
  fontSize: 13,
})

interface UserListGridProps {
  rows: User[]
  loading: boolean
  page: number
  pageSize: number
}

export function UserListGrid({ rows, loading, page, pageSize }: UserListGridProps) {
  const { t } = useTranslation('user')

  const columnDefs = useMemo<ColDef<User>[]>(
    () => [
      {
        headerName: t('columns.no'),
        width: 70,
        valueGetter: (p: ValueGetterParams<User>) =>
          (page - 1) * pageSize + (p.node?.rowIndex ?? 0) + 1,
      },
      { field: 'userId', headerName: t('columns.userId'), width: 140 },
      { field: 'userName', headerName: t('columns.userName'), flex: 1, minWidth: 140 },
      { field: 'department', headerName: t('columns.department'), width: 150 },
      {
        field: 'role',
        headerName: t('columns.role'),
        width: 110,
        valueGetter: (p) => (p.data ? t(`role.${p.data.role}`) : ''),
      },
      {
        field: 'isActive',
        headerName: t('columns.isActive'),
        width: 100,
        cellRenderer: (p: { value: boolean }) => (
          <Badge tone={p.value ? 'green' : 'gray'}>{p.value ? 'Y' : 'N'}</Badge>
        ),
      },
      {
        field: 'projects',
        headerName: t('columns.projects'),
        flex: 1,
        minWidth: 160,
        cellRenderer: (p: { value: User['projects'] }) => {
          if (!p.value?.length) return null
          const [first, ...rest] = p.value
          return (
            <a
              href="#"
              className="text-blue-600 hover:underline"
              onClick={(e) => e.preventDefault()}
            >
              {first.name}
              {rest.length > 0 ? ` 외 ${rest.length}건` : ''}
            </a>
          )
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
    [t, page, pageSize],
  )

  return (
    <div style={{ height: 480 }}>
      <AgGridReact<User>
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
