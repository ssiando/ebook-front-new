import { useState } from 'react'
import { BookSetGrid } from './BookSetGrid'
import { BookSetFormModal } from './BookSetFormModal'
import { BookAssignPanel } from './BookAssignPanel'
import { AddButton } from '@/components/common/ui/AddButton'
import { Button } from '@/components/common/ui/Button'
import { DeleteButton } from '@/components/common/ui/DeleteButton'
import { useDeleteBookSetMutation } from '@/query/book-set-query'
import type { BookSet } from '@/types/bookSet'

interface BookSetContentProps {
  data: BookSet[] | undefined
  isLoading: boolean
}

export function BookSetContent({ data, isLoading }: BookSetContentProps) {
  const rows = data ?? []
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [formTarget, setFormTarget] = useState<BookSet | null | 'create'>(null)
  const deleteBookSet = useDeleteBookSetMutation()

  const selected = rows.find((row) => row.id === selectedId) ?? null

  const handleDelete = async () => {
    if (!selected) return
    if (!window.confirm(`"${selected.setName}" 세트를 삭제하시겠습니까?`)) return
    await deleteBookSet.mutateAsync(selected.id)
    setSelectedId(null)
  }

  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <div className="mt-5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm text-gray-500">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            세트 목록 총 {rows.length}건
          </span>
          <div className="flex gap-2">
            <AddButton onClick={() => setFormTarget('create')}>등록</AddButton>
            <Button type="button" variant="secondary" onClick={() => selected && setFormTarget(selected)} disabled={!selected}>
              수정
            </Button>
            <DeleteButton onClick={handleDelete} disabled={!selected || deleteBookSet.isPending}>
              삭제
            </DeleteButton>
          </div>
        </div>

        <BookSetGrid
          rows={rows}
          loading={isLoading}
          selectedId={selectedId}
          onRowClick={(bookSet) => setSelectedId(bookSet.id)}
        />
      </div>

      <BookAssignPanel bookSet={selected} />

      <BookSetFormModal
        open={formTarget !== null}
        bookSet={formTarget === 'create' ? null : formTarget}
        onClose={() => setFormTarget(null)}
      />
    </div>
  )
}
