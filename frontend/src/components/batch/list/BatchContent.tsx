import { useState } from 'react'
import { BatchListGrid } from './BatchListGrid'
import { BatchFormModal } from './BatchFormModal'
import { AddButton } from '@/components/common/ui/AddButton'
import { DeleteButton } from '@/components/common/ui/DeleteButton'
import { useDeleteBatchMutation } from '@/query/batch-query'
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
  const [formTarget, setFormTarget] = useState<Batch | null | 'create'>(null)
  const [checkedIds, setCheckedIds] = useState<string[]>([])
  const deleteBatch = useDeleteBatchMutation()

  const handleEditClick = (id: string) => {
    const batch = data?.find((item) => item.id === id)
    if (batch) setFormTarget(batch)
  }

  const handleDelete = async () => {
    if (checkedIds.length === 0) return
    if (!window.confirm(`선택한 배치 ${checkedIds.length}건을 삭제하시겠습니까?`)) return
    await Promise.all(checkedIds.map((id) => deleteBatch.mutateAsync(id)))
    setCheckedIds([])
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm text-gray-500">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          배치 목록 총 {data?.length ?? 0}건
        </span>
        <div className="flex gap-2">
          <AddButton onClick={() => setFormTarget('create')}>등록</AddButton>
          <DeleteButton
            onClick={handleDelete}
            disabled={checkedIds.length === 0 || deleteBatch.isPending}
          >
            삭제
          </DeleteButton>
        </div>
      </div>

      <BatchListGrid
        rows={data ?? []}
        loading={isLoading}
        runningId={runningId}
        onHistoryClick={onHistoryClick}
        onRunClick={onRunClick}
        onEditClick={handleEditClick}
        onSelectionChanged={setCheckedIds}
      />

      <BatchFormModal
        open={formTarget !== null}
        batch={formTarget === 'create' ? null : formTarget}
        onClose={() => setFormTarget(null)}
      />
    </div>
  )
}
