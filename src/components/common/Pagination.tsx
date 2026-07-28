import { clsx } from '@/utils/clsx'

interface PaginationProps {
  page: number
  pageSize: number
  totalCount: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, pageSize, totalCount, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-1 py-2">
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={clsx(
            'flex h-7 w-7 items-center justify-center rounded-full text-sm',
            p === page
              ? 'bg-gray-900 font-medium text-white'
              : 'text-gray-500 hover:bg-gray-100',
          )}
        >
          {p}
        </button>
      ))}
    </div>
  )
}
