import { BatchListGrid } from './BatchListGrid'
import type { Batch } from '@/types/batch'

interface BatchContentProps {
  data: Batch[] | undefined
  isLoading: boolean
  runningId: string | null
  onHistoryClick: (id: string) => void
  onRunClick: (id: string) => void
}

export function BatchContent({
  data,
  isLoading,
  runningId,
  onHistoryClick,
  onRunClick,
}: BatchContentProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm text-gray-500">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          배치 목록 총 {data?.length ?? 0}건
        </span>
      </div>

      <BatchListGrid
        rows={data ?? []}
        loading={isLoading}
        runningId={runningId}
        onHistoryClick={onHistoryClick}
        onRunClick={onRunClick}
      />
    </div>
  )
}
