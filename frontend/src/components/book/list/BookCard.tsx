import { Pencil } from 'lucide-react'
import { Badge } from '@/components/common/ui/Badge'
import type { Book, BookType } from '@/types/book'

const BOOK_TYPE_LABELS: Record<BookType, string> = {
  EBOOK: '전자책',
  PAPER: '종이책',
  BOTH: '전자책+종이책',
}

const COVER_PALETTES = [
  { bg: 'bg-rose-100', text: 'text-rose-700' },
  { bg: 'bg-sky-100', text: 'text-sky-700' },
  { bg: 'bg-amber-100', text: 'text-amber-700' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  { bg: 'bg-slate-800', text: 'text-white' },
]

function paletteFor(id: string) {
  let hash = 0
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) % COVER_PALETTES.length
  return COVER_PALETTES[hash]
}

interface BookCardProps {
  book: Book
  rank: number
  checked: boolean
  onCheck: (id: string, checked: boolean) => void
  onEditClick: (id: string) => void
  onDetailClick: (id: string) => void
}

export function BookCard({ book, rank, checked, onCheck, onEditClick, onDetailClick }: BookCardProps) {
  const palette = paletteFor(book.id)

  return (
    <div className="mx-auto flex w-4/5 flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheck(book.id, e.target.checked)}
          aria-label={`${book.title} 선택`}
          className="h-3.5 w-3.5 rounded border-gray-300"
        />
        <button
          type="button"
          onClick={() => onEditClick(book.id)}
          aria-label={`${book.title} 수정`}
          className="text-gray-300 hover:text-gray-500"
        >
          <Pencil size={13} />
        </button>
      </div>

      <button
        type="button"
        onClick={() => onDetailClick(book.id)}
        aria-label={`${book.title} 상세보기`}
        className="flex cursor-pointer flex-col gap-1.5 text-left"
      >
        <div
          className={`relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded text-center ${book.coverImageUrl ? '' : `p-3 ${palette.bg}`}`}
        >
          {book.coverImageUrl ? (
            <img src={book.coverImageUrl} alt={book.title} className="h-full w-full object-cover" />
          ) : (
            <span className={`line-clamp-4 text-sm font-bold leading-snug ${palette.text}`}>
              {book.title}
            </span>
          )}
          <span className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-[10px] font-semibold text-gray-600 shadow-sm">
            {rank}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <Badge tone="blue">{BOOK_TYPE_LABELS[book.bookType]}</Badge>
          {book.freeYn && <Badge tone="green">무료</Badge>}
          {!book.activeYn && <Badge tone="gray">비활성</Badge>}
        </div>

        <p className="line-clamp-2 text-xs font-semibold text-gray-800">{book.title}</p>
        {book.subtitle && <p className="line-clamp-1 text-[10px] text-gray-400">{book.subtitle}</p>}
        <p className="text-[10px] text-gray-400">
          {book.copyrightOwner ?? '저자 미상'} · {book.publisher ?? '발행자 미상'}
        </p>
        <p className="text-[10px] text-gray-300">
          {book.isbn ?? 'ISBN 미등록'}
          {book.pageCount ? ` · ${book.pageCount}p` : ''}
        </p>
      </button>
    </div>
  )
}
