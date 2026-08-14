import { useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { themeQuartz, type ColDef, type ValueGetterParams } from 'ag-grid-community'
import { Star } from 'lucide-react'
import { Badge } from '@/components/common/ui/Badge'
import {
  BOOK_STATUS_LABELS,
  BOOK_STATUS_TONES,
  discountedPrice,
  formatPrice,
} from '@/utils/bookFormat'
import type { Book, BookStatus } from '@/types/book'

const gridTheme = themeQuartz.withParams({
  headerBackgroundColor: '#f9fafb',
  headerTextColor: '#374151',
  rowHoverColor: '#fef2f2',
  borderColor: '#e5e7eb',
  fontSize: 13,
})

interface BookListGridProps {
  rows: Book[]
  loading: boolean
}

export function BookListGrid({ rows, loading }: BookListGridProps) {
  const columnDefs = useMemo<ColDef<Book>[]>(
    () => [
      {
        headerName: 'No',
        width: 60,
        valueGetter: (p: ValueGetterParams<Book>) => (p.node?.rowIndex ?? 0) + 1,
      },
      {
        headerName: '표지',
        width: 60,
        cellDataType: false,
        cellRenderer: (p: { data?: Book }) =>
          p.data && (
            <div className="flex h-full items-center py-1">
              <span className="flex h-9 w-7 items-center justify-center rounded bg-rose-50 text-xs font-semibold text-rose-500">
                {p.data.title.slice(0, 1)}
              </span>
            </div>
          ),
      },
      { field: 'title', headerName: '도서명', flex: 1.4, minWidth: 200 },
      { field: 'author', headerName: '저자', width: 120 },
      { field: 'publisher', headerName: '출판사', width: 130 },
      { field: 'category', headerName: '카테고리', width: 100 },
      {
        headerName: '판매가',
        width: 130,
        valueGetter: (p: ValueGetterParams<Book>) =>
          p.data ? discountedPrice(p.data) : undefined,
        valueFormatter: (p) => (typeof p.value === 'number' ? formatPrice(p.value) : ''),
        cellRenderer: (p: { data?: Book; value: number }) =>
          p.data && (
            <div className="flex flex-col justify-center leading-tight">
              <span className="font-medium text-gray-800">{formatPrice(p.value)}</span>
              {p.data.discountRate > 0 && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(p.data.price)}
                </span>
              )}
            </div>
          ),
      },
      {
        headerName: '평점',
        width: 100,
        cellDataType: false,
        cellRenderer: (p: { data?: Book }) =>
          p.data && (
            <div className="flex items-center gap-1">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span className="font-medium text-gray-700">{p.data.rating.toFixed(1)}</span>
            </div>
          ),
      },
      {
        field: 'reviewCount',
        headerName: '리뷰수',
        width: 90,
        valueFormatter: (p) => `${Number(p.value).toLocaleString()}건`,
      },
      { field: 'stock', headerName: '재고', width: 80 },
      {
        field: 'status',
        headerName: '상태',
        width: 90,
        cellRenderer: (p: { value: BookStatus }) => (
          <Badge tone={BOOK_STATUS_TONES[p.value]}>{BOOK_STATUS_LABELS[p.value]}</Badge>
        ),
      },
      { field: 'updatedAt', headerName: '수정일', width: 110 },
    ],
    [],
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
        getRowId={(p) => p.data.id}
        suppressCellFocus
      />
    </div>
  )
}
