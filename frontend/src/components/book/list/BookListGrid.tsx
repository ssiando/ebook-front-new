import { useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import {
  themeQuartz,
  type ColDef,
  type SelectionChangedEvent,
  type ValueGetterParams,
} from 'ag-grid-community'
import { Badge } from '@/components/common/ui/Badge'
import { Button } from '@/components/common/ui/Button'
import type { Book, BookType } from '@/types/book'

const gridTheme = themeQuartz.withParams({
  headerBackgroundColor: '#f9fafb',
  headerTextColor: '#374151',
  rowHoverColor: '#fef2f2',
  borderColor: '#e5e7eb',
  fontSize: 13,
})

const BOOK_TYPE_LABELS: Record<BookType, string> = {
  EBOOK: '전자책',
  PAPER: '종이책',
  BOTH: '전자책+종이책',
}

interface BookListGridProps {
  rows: Book[]
  loading: boolean
  onEditClick: (id: string) => void
  onDetailClick: (id: string) => void
  onSelectionChanged: (ids: string[]) => void
}

export function BookListGrid({
  rows,
  loading,
  onEditClick,
  onDetailClick,
  onSelectionChanged,
}: BookListGridProps) {
  const columnDefs = useMemo<ColDef<Book>[]>(
    () => [
      { headerCheckboxSelection: true, checkboxSelection: true, width: 44, pinned: 'left' },
      {
        headerName: 'No',
        width: 56,
        valueGetter: (p: ValueGetterParams<Book>) => (p.node?.rowIndex ?? 0) + 1,
      },
      {
        headerName: '표지',
        width: 60,
        cellRenderer: (p: { data?: Book }) =>
          p.data && (
            <div className="flex h-full items-center py-1">
              {p.data.thumbnailUrl || p.data.coverImageUrl ? (
                <img
                  src={p.data.thumbnailUrl ?? p.data.coverImageUrl ?? ''}
                  alt={p.data.title}
                  className="h-9 w-7 rounded object-cover"
                />
              ) : (
                <span className="flex h-9 w-7 items-center justify-center rounded bg-rose-50 text-xs font-semibold text-rose-500">
                  {p.data.title.slice(0, 1)}
                </span>
              )}
            </div>
          ),
      },
      {
        headerName: '도서명',
        flex: 1.4,
        minWidth: 200,
        cellRenderer: (p: { data?: Book }) =>
          p.data && (
            <div className="flex flex-col justify-center leading-tight py-1">
              <span className="truncate font-medium text-gray-800">{p.data.title}</span>
              {p.data.subtitle && (
                <span className="truncate text-xs text-gray-400">{p.data.subtitle}</span>
              )}
            </div>
          ),
      },
      {
        field: 'bookType',
        headerName: '구분',
        width: 130,
        valueFormatter: (p) => BOOK_TYPE_LABELS[p.value as BookType],
      },
      { field: 'publisher', headerName: '발행자', width: 130, valueFormatter: (p) => p.value ?? '-' },
      {
        field: 'copyrightOwner',
        headerName: '판권소유자',
        width: 130,
        valueFormatter: (p) => p.value ?? '-',
      },
      { field: 'pageCount', headerName: '페이지', width: 90, valueFormatter: (p) => p.value ?? '-' },
      { field: 'isbn', headerName: 'ISBN', width: 140, valueFormatter: (p) => p.value ?? '-' },
      {
        field: 'freeYn',
        headerName: '무료',
        width: 80,
        cellRenderer: (p: { value: boolean }) => (
          <Badge tone={p.value ? 'blue' : 'gray'}>{p.value ? '무료' : '유료'}</Badge>
        ),
      },
      {
        field: 'activeYn',
        headerName: '상태',
        width: 90,
        cellRenderer: (p: { value: boolean }) => (
          <Badge tone={p.value ? 'green' : 'gray'}>{p.value ? '활성' : '비활성'}</Badge>
        ),
      },
      { field: 'firstPublishDt', headerName: '초판발행일', width: 110, valueFormatter: (p) => p.value ?? '-' },
      {
        headerName: '관리',
        width: 140,
        cellRenderer: (p: { data?: Book }) =>
          p.data && (
            <div className="flex h-full items-center gap-1.5">
              <Button
                type="button"
                variant="secondary"
                className="h-6 px-2 text-xs"
                onClick={() => onDetailClick(p.data!.id)}
              >
                상세
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-6 px-2 text-xs"
                onClick={() => onEditClick(p.data!.id)}
              >
                수정
              </Button>
            </div>
          ),
      },
    ],
    [onEditClick, onDetailClick],
  )

  return (
    <div style={{ height: 560 }}>
      <AgGridReact<Book>
        theme={gridTheme}
        rowData={rows}
        columnDefs={columnDefs}
        loading={loading}
        rowHeight={48}
        headerHeight={40}
        rowSelection="multiple"
        suppressRowClickSelection
        getRowId={(p) => p.data.id}
        onSelectionChanged={(e: SelectionChangedEvent<Book>) =>
          onSelectionChanged(e.api.getSelectedRows().map((row) => row.id))
        }
        suppressCellFocus
      />
    </div>
  )
}
