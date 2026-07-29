import { Minus, Plus } from 'lucide-react'

interface GridSectionHeaderProps {
  title: string
  count: number
  onAdd: () => void
  onRemove: () => void
  removeDisabled: boolean
}

export function GridSectionHeader({
  title,
  count,
  onAdd,
  onRemove,
  removeDisabled,
}: GridSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-sm text-gray-500">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
        {title} 총 {count}건
      </span>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={onAdd}
          aria-label={`${title} 행 추가`}
          className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-gray-500 hover:bg-gray-50"
        >
          <Plus size={14} />
        </button>
        <button
          type="button"
          onClick={onRemove}
          disabled={removeDisabled}
          aria-label={`${title} 선택 행 삭제`}
          className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus size={14} />
        </button>
      </div>
    </div>
  )
}
