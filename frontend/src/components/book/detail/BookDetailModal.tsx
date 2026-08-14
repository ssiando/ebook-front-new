import { useState } from 'react'
import { confirm } from '@/store/useConfirmStore'
import { Modal } from '@/components/common/ui/Modal'
import { Badge } from '@/components/common/ui/Badge'
import { AddButton } from '@/components/common/ui/AddButton'
import { Button } from '@/components/common/ui/Button'
import { BookRevisionList } from './BookRevisionList'
import { BookRevisionFormModal } from './BookRevisionFormModal'
import { useBookRevisionsQuery, useDeleteBookRevisionMutation } from '@/query/book-revision-query'
import type { Book, BookType } from '@/types/book'
import type { BookRevision } from '@/types/bookRevision'

const BOOK_TYPE_LABELS: Record<BookType, string> = {
  EBOOK: '전자책',
  PAPER: '종이책',
  BOTH: '전자책+종이책',
}

interface BookDetailModalProps {
  open: boolean
  book: Book | null
  onClose: () => void
  onEditClick: (id: string) => void
}

export function BookDetailModal({ open, book, onClose, onEditClick }: BookDetailModalProps) {
  const [revisionFormTarget, setRevisionFormTarget] = useState<BookRevision | null | 'create'>(null)
  const revisionsQuery = useBookRevisionsQuery(book?.id ?? null)
  const revisions = revisionsQuery.data ?? []
  const deleteRevision = useDeleteBookRevisionMutation(book?.id ?? '')
  const nextRevisionNo = revisions.reduce((max, r) => Math.max(max, r.revisionNo), 0) + 1

  if (!book) return null

  const handleDeleteRevision = async (revision: BookRevision) => {
    if (!(await confirm(`v${revision.revisionNo} 버전을 삭제하시겠습니까?`))) return
    deleteRevision.mutate(revision.id)
  }

  return (
    <Modal open={open} title="도서 상세" onClose={onClose} size="xl">
      <div className="flex flex-col gap-5">
        <section className="flex gap-4">
          <div className="h-36 w-24 shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-50">
            {book.coverImageUrl ? (
              <img src={book.coverImageUrl} alt={book.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-2xl font-bold text-gray-300">
                {book.title.slice(0, 1)}
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold text-gray-800">{book.title}</h3>
                {book.subtitle && <p className="text-xs text-gray-400">{book.subtitle}</p>}
              </div>
              <Button type="button" variant="secondary" className="shrink-0" onClick={() => onEditClick(book.id)}>
                정보 수정
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-1">
              <Badge tone="blue">{BOOK_TYPE_LABELS[book.bookType]}</Badge>
              {book.freeYn && <Badge tone="green">무료</Badge>}
              <Badge tone={book.activeYn ? 'green' : 'gray'}>{book.activeYn ? '활성' : '비활성'}</Badge>
            </div>

            <dl className="grid grid-cols-[80px_1fr_80px_1fr] gap-y-1.5 text-xs">
              <dt className="text-gray-400">발행자</dt>
              <dd className="text-gray-700">{book.publisher ?? '-'}</dd>
              <dt className="text-gray-400">판권소유자</dt>
              <dd className="text-gray-700">{book.copyrightOwner ?? '-'}</dd>
              <dt className="text-gray-400">페이지수</dt>
              <dd className="text-gray-700">{book.pageCount ?? '-'}</dd>
              <dt className="text-gray-400">ISBN</dt>
              <dd className="text-gray-700">{book.isbn ?? '-'}</dd>
              <dt className="text-gray-400">초판발행일</dt>
              <dd className="text-gray-700">{book.firstPublishDt ?? '-'}</dd>
              <dt className="text-gray-400">수정일</dt>
              <dd className="text-gray-700">{book.updatedAt.slice(0, 10)}</dd>
            </dl>
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">버전 관리</h3>
            <AddButton onClick={() => setRevisionFormTarget('create')}>버전 추가</AddButton>
          </div>
          <BookRevisionList
            revisions={revisions}
            loading={revisionsQuery.isFetching}
            onEditClick={setRevisionFormTarget}
            onDeleteClick={handleDeleteRevision}
          />
        </section>
      </div>

      <BookRevisionFormModal
        open={revisionFormTarget !== null}
        bookId={book.id}
        revision={revisionFormTarget === 'create' ? null : revisionFormTarget}
        nextRevisionNo={nextRevisionNo}
        onClose={() => setRevisionFormTarget(null)}
      />
    </Modal>
  )
}
