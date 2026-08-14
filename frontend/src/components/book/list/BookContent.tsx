import { useState } from 'react'
import { LayoutGrid, List } from 'lucide-react'
import { BookListGrid } from './BookListGrid'
import { BookCardGrid } from './BookCardGrid'
import type { Book } from '@/types/book'

type ViewMode = 'table' | 'card'

interface BookContentProps {
  data: Book[] | undefined
  isLoading: boolean
}

export function BookContent({ data, isLoading }: BookContentProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [checkedIds, setCheckedIds] = useState<string[]>([])
  const rows = data ?? []

  const handleCheck = (id: string, checked: boolean) => {
    setCheckedIds((prev) =>
      checked ? [...prev, id] : prev.filter((checkedId) => checkedId !== id),
    )
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm text-gray-500">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          도서 목록 총 {rows.length}건
        </span>
        <div className="flex gap-1 rounded border border-gray-300 p-0.5">
          <button
            type="button"
            aria-label="목록형으로 보기"
            aria-pressed={viewMode === 'table'}
            onClick={() => setViewMode('table')}
            className={`flex h-7 w-7 items-center justify-center rounded ${
              viewMode === 'table' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            <List size={14} />
          </button>
          <button
            type="button"
            aria-label="그림형으로 보기"
            aria-pressed={viewMode === 'card'}
            onClick={() => setViewMode('card')}
            className={`flex h-7 w-7 items-center justify-center rounded ${
              viewMode === 'card' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            <LayoutGrid size={14} />
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <BookListGrid rows={rows} loading={isLoading} />
      ) : (
        <BookCardGrid
          rows={rows}
          loading={isLoading}
          checkedIds={checkedIds}
          onCheck={handleCheck}
        />
      )}
    </div>
  )
}
