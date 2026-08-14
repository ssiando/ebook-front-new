import { useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/common/ui/Button'
import { useBooksQuery } from '@/query/book-query'
import { useUpdateBookSetBooksMutation } from '@/query/book-set-query'
import { BOOK_TYPES, type Book, type BookType } from '@/types/book'
import type { BookSet } from '@/types/bookSet'
import { clsx } from '@/utils/clsx'

const BOOK_TYPE_LABELS: Record<BookType, string> = {
  EBOOK: '전자책',
  PAPER: '종이책',
  BOTH: '전자책+종이책',
}

const BOOK_TYPE_DOT_CLASSES: Record<BookType, string> = {
  EBOOK: 'bg-sky-500',
  PAPER: 'bg-emerald-500',
  BOTH: 'bg-amber-500',
}

interface BookAssignPanelProps {
  bookSet: BookSet | null
}

export function BookAssignPanel({ bookSet }: BookAssignPanelProps) {
  const booksQuery = useBooksQuery({ keyword: '', bookType: 'ALL', activeYn: 'ALL' })
  const books = booksQuery.data ?? []
  const updateBooks = useUpdateBookSetBooksMutation()

  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [expandedType, setExpandedType] = useState<BookType | null>(null)

  useEffect(() => {
    setCheckedIds(new Set(bookSet?.bookIds ?? []))
  }, [bookSet])

  if (!bookSet) {
    return (
      <div className="flex h-full min-h-[480px] items-center justify-center rounded border border-gray-200 bg-white text-sm text-gray-400">
        좌측 목록에서 세트를 선택해 주세요.
      </div>
    )
  }

  const handleToggle = (bookId: string, checked: boolean) => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(bookId)
      else next.delete(bookId)
      return next
    })
  }

  const handleSave = () => {
    updateBooks.mutate({ id: bookSet.id, bookIds: Array.from(checkedIds) })
  }

  const groups = BOOK_TYPES.map((type) => ({
    type,
    books: books.filter((book) => book.bookType === type),
  }))

  return (
    <div className="flex h-full flex-col gap-3 rounded border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">{bookSet.setName}</h2>
          <p className="text-xs text-gray-400">선택된 도서 {checkedIds.size}건</p>
        </div>
        <Button type="button" variant="primary" onClick={handleSave} disabled={updateBooks.isPending}>
          저장
        </Button>
      </div>

      <div className="flex flex-col divide-y divide-gray-100 overflow-y-auto">
        {groups.map(({ type, books: groupBooks }) => (
          <BookTypeGroup
            key={type}
            type={type}
            books={groupBooks}
            expanded={expandedType === type}
            checkedIds={checkedIds}
            onToggleExpand={() => setExpandedType((prev) => (prev === type ? null : type))}
            onToggleBook={handleToggle}
          />
        ))}
      </div>
    </div>
  )
}

interface BookTypeGroupProps {
  type: BookType
  books: Book[]
  expanded: boolean
  checkedIds: Set<string>
  onToggleExpand: () => void
  onToggleBook: (bookId: string, checked: boolean) => void
}

function BookTypeGroup({
  type,
  books,
  expanded,
  checkedIds,
  onToggleExpand,
  onToggleBook,
}: BookTypeGroupProps) {
  return (
    <div className="py-2">
      <button
        type="button"
        onClick={onToggleExpand}
        className="flex w-full items-center justify-between py-1.5"
      >
        <span className="flex items-center gap-2">
          <span className={clsx('h-2.5 w-2.5 rounded-full', BOOK_TYPE_DOT_CLASSES[type])} />
          <span className="text-sm font-semibold text-gray-700">{BOOK_TYPE_LABELS[type]}</span>
        </span>
        <span className="flex items-center gap-2 text-xs text-gray-400">
          도서 {books.length}개
          <ChevronRight size={14} className={clsx('transition-transform', expanded && 'rotate-90')} />
        </span>
      </button>

      {expanded && (
        <table className="mt-1.5 w-full text-xs">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-3 py-2 text-left font-medium">도서명</th>
              <th className="px-3 py-2 text-left font-medium">발행자</th>
              <th className="px-3 py-2 text-right font-medium">포함</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {books.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-3 py-4 text-center text-gray-400">
                  도서가 없습니다.
                </td>
              </tr>
            ) : (
              books.map((book) => (
                <tr key={book.id} className="text-gray-700">
                  <td className="px-3 py-2">{book.title}</td>
                  <td className="px-3 py-2 text-gray-500">{book.publisher ?? '-'}</td>
                  <td className="px-3 py-2 text-right">
                    <input
                      type="checkbox"
                      checked={checkedIds.has(book.id)}
                      onChange={(e) => onToggleBook(book.id, e.target.checked)}
                      aria-label={`${book.title} 포함`}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
