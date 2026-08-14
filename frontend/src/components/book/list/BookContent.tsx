import { useState } from 'react'
import { LayoutGrid, List } from 'lucide-react'
import { BookListGrid } from './BookListGrid'
import { BookCardGrid } from './BookCardGrid'
import { BookFormModal } from './BookFormModal'
import { BookDetailModal } from '../detail/BookDetailModal'
import { AddButton } from '@/components/common/ui/AddButton'
import { DeleteButton } from '@/components/common/ui/DeleteButton'
import { useDeleteBookMutation } from '@/query/book-query'
import type { Book } from '@/types/book'

type ViewMode = 'table' | 'card'

interface BookContentProps {
  data: Book[] | undefined
  isLoading: boolean
}

export function BookContent({ data, isLoading }: BookContentProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [checkedIds, setCheckedIds] = useState<string[]>([])
  const [formTarget, setFormTarget] = useState<Book | null | 'create'>(null)
  const [detailTarget, setDetailTarget] = useState<Book | null>(null)
  const rows = data ?? []
  const deleteBook = useDeleteBookMutation()

  const handleCheck = (id: string, checked: boolean) => {
    setCheckedIds((prev) =>
      checked ? [...prev, id] : prev.filter((checkedId) => checkedId !== id),
    )
  }

  const handleEditClick = (id: string) => {
    const book = rows.find((row) => row.id === id)
    if (book) setFormTarget(book)
  }

  const handleDetailClick = (id: string) => {
    const book = rows.find((row) => row.id === id)
    if (book) setDetailTarget(book)
  }

  const handleDelete = async () => {
    if (checkedIds.length === 0) return
    if (!window.confirm(`선택한 도서 ${checkedIds.length}건을 삭제하시겠습니까?`)) return
    await Promise.all(checkedIds.map((id) => deleteBook.mutateAsync(id)))
    setCheckedIds([])
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm text-gray-500">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          도서 목록 총 {rows.length}건
        </span>
        <div className="flex items-center gap-2">
          <AddButton onClick={() => setFormTarget('create')}>등록</AddButton>
          <DeleteButton
            onClick={handleDelete}
            disabled={checkedIds.length === 0 || deleteBook.isPending}
          >
            삭제
          </DeleteButton>
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
      </div>

      {viewMode === 'table' ? (
        <BookListGrid
          rows={rows}
          loading={isLoading}
          onEditClick={handleEditClick}
          onDetailClick={handleDetailClick}
          onSelectionChanged={setCheckedIds}
        />
      ) : (
        <BookCardGrid
          rows={rows}
          loading={isLoading}
          checkedIds={checkedIds}
          onCheck={handleCheck}
          onEditClick={handleEditClick}
          onDetailClick={handleDetailClick}
        />
      )}

      <BookFormModal
        open={formTarget !== null}
        book={formTarget === 'create' ? null : formTarget}
        onClose={() => setFormTarget(null)}
      />

      <BookDetailModal
        open={detailTarget !== null}
        book={detailTarget}
        onClose={() => setDetailTarget(null)}
        onEditClick={handleEditClick}
      />
    </div>
  )
}
