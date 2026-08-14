import { BookCard } from './BookCard'
import type { Book } from '@/types/book'

interface BookCardGridProps {
  rows: Book[]
  loading: boolean
  checkedIds: string[]
  onCheck: (id: string, checked: boolean) => void
  onEditClick: (id: string) => void
  onDetailClick: (id: string) => void
}

export function BookCardGrid({
  rows,
  loading,
  checkedIds,
  onCheck,
  onEditClick,
  onDetailClick,
}: BookCardGridProps) {
  if (!loading && rows.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded border border-gray-200 text-sm text-gray-400">
        조회된 도서가 없습니다.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-x-10 gap-y-12 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {rows.map((book, index) => (
        <BookCard
          key={book.id}
          book={book}
          rank={index + 1}
          checked={checkedIds.includes(book.id)}
          onCheck={onCheck}
          onEditClick={onEditClick}
          onDetailClick={onDetailClick}
        />
      ))}
    </div>
  )
}
