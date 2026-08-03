import { Pagination } from '@/components/common/Pagination'
import { BatchListGrid } from './BatchListGrid'
import type { BatchListResponse } from '@/types/batch'

const PAGE_SIZE_OPTIONS = [15, 30, 50, 100]

interface BatchContentProps {
  data: BatchListResponse | undefined
  isLoading: boolean
  page: number
  pageSize: number
  runningId: string | null
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onHistoryClick: (id: string) => void
  onRunClick: (id: string) => void
}

export function BatchContent({
  data,
  isLoading,
  page,
  pageSize,
  runningId,
  onPageChange,
  onPageSizeChange,
  onHistoryClick,
  onRunClick,
}: BatchContentProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm text-gray-500">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          배치 목록 총 {data?.totalCount ?? 0}건
        </span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="h-8 rounded border border-gray-300 px-2 text-sm"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <BatchListGrid
        rows={data?.items ?? []}
        loading={isLoading}
        page={page}
        pageSize={pageSize}
        runningId={runningId}
        onHistoryClick={onHistoryClick}
        onRunClick={onRunClick}
      />

      <Pagination
        page={page}
        pageSize={pageSize}
        totalCount={data?.totalCount ?? 0}
        onPageChange={onPageChange}
      />
    </div>
  )
}
