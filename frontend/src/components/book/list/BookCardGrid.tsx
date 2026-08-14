import { Heart, Star } from 'lucide-react'
import { Badge } from '@/components/common/ui/Badge'
import {
  BOOK_STATUS_LABELS,
  BOOK_STATUS_TONES,
  discountedPrice,
  estimatedPoints,
  formatPrice,
  isNewBook,
} from '@/utils/bookFormat'
import type { Book } from '@/types/book'

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

interface BookCardGridProps {
  rows: Book[]
  loading: boolean
  checkedIds: string[]
  onCheck: (id: string, checked: boolean) => void
}

export function BookCardGrid({ rows, loading, checkedIds, onCheck }: BookCardGridProps) {
  if (!loading && rows.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded border border-gray-200 text-sm text-gray-400">
        조회된 도서가 없습니다.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {rows.map((book, index) => {
        const palette = paletteFor(book.id)
        const price = discountedPrice(book)

        return (
          <div key={book.id} className="flex flex-col gap-2">
            <input
              type="checkbox"
              checked={checkedIds.includes(book.id)}
              onChange={(e) => onCheck(book.id, e.target.checked)}
              aria-label={`${book.title} 선택`}
              className="h-4 w-4 rounded border-gray-300"
            />

            <div
              className={`relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded p-4 text-center ${palette.bg}`}
            >
              <span className={`line-clamp-4 text-base font-bold leading-snug ${palette.text}`}>
                {book.title}
              </span>
              <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-xs font-semibold text-gray-600 shadow-sm">
                {index + 1}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1">
              <Badge tone="blue">{book.category}</Badge>
              {isNewBook(book.publishedAt) && <Badge tone="green">NEW</Badge>}
              {book.status !== 'ON_SALE' && (
                <Badge tone={BOOK_STATUS_TONES[book.status]}>{BOOK_STATUS_LABELS[book.status]}</Badge>
              )}
            </div>

            <p className="line-clamp-2 text-sm font-semibold text-gray-800">{book.title}</p>
            <p className="text-xs text-gray-400">
              {book.author} · {book.publisher}
            </p>

            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-rose-600">{book.discountRate}%</span>
              <span className="text-base font-bold text-gray-900">{formatPrice(price)}</span>
            </div>
            <span className="text-xs text-gray-400">{estimatedPoints(price)}P</span>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                <span className="font-medium text-gray-700">{book.rating.toFixed(1)}</span>
                <span className="text-gray-300">·</span>
                <span>{book.reviewCount.toLocaleString()}건</span>
              </span>
              <Heart size={16} className="text-gray-300" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
