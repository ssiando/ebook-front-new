import { useEffect, useState } from 'react'
import { confirm } from '@/store/useConfirmStore'
import { GridSectionHeader } from './GridSectionHeader'
import { CodeGroupGrid } from './CodeGroupGrid'
import { CodeItemGrid } from './CodeItemGrid'
import { CodeGroupCreateModal } from './CodeGroupCreateModal'
import { CodeItemCreateModal } from './CodeItemCreateModal'
import {
  useCodeGroupsQuery,
  useCodeItemsQuery,
  useDeleteCodeGroupMutation,
  useDeleteCodeItemMutation,
  useUpdateCodeGroupMutation,
  useUpdateCodeItemMutation,
} from '@/query/common-code-query'
import type { CodeGroup, CodeItem, CommonCodeSearchParams } from '@/types/commonCode'

interface CommonCodeContentProps {
  params: CommonCodeSearchParams
}

export function CommonCodeContent({ params }: CommonCodeContentProps) {
  const [groupRows, setGroupRows] = useState<CodeGroup[]>([])
  const [checkedGroupIds, setCheckedGroupIds] = useState<string[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [itemRows, setItemRows] = useState<CodeItem[]>([])
  const [checkedItemIds, setCheckedItemIds] = useState<string[]>([])
  const [createGroupOpen, setCreateGroupOpen] = useState(false)
  const [createItemOpen, setCreateItemOpen] = useState(false)

  const groupsQuery = useCodeGroupsQuery(params)
  const itemsQuery = useCodeItemsQuery(selectedGroupId)
  const updateGroup = useUpdateCodeGroupMutation()
  const deleteGroup = useDeleteCodeGroupMutation()
  const updateItem = useUpdateCodeItemMutation(selectedGroupId)
  const deleteItem = useDeleteCodeItemMutation(selectedGroupId)

  useEffect(() => {
    if (groupsQuery.data) setGroupRows(groupsQuery.data)
  }, [groupsQuery.data])

  useEffect(() => {
    setItemRows(itemsQuery.data ?? [])
  }, [itemsQuery.data])

  const handleGroupCellChange = (id: string, field: keyof CodeGroup, value: string | boolean) => {
    const current = groupRows.find((g) => g.id === id)
    if (!current) return
    updateGroup.mutate({ ...current, [field]: value })
  }

  const handleRemoveGroups = async () => {
    if (checkedGroupIds.length === 0) return
    if (!(await confirm(`선택한 ${checkedGroupIds.length}건을 삭제하시겠습니까?`))) return
    await Promise.all(checkedGroupIds.map((id) => deleteGroup.mutateAsync(id)))
    if (selectedGroupId && checkedGroupIds.includes(selectedGroupId)) setSelectedGroupId(null)
    setCheckedGroupIds([])
  }

  const handleItemCellChange = (
    id: string,
    field: keyof CodeItem,
    value: string | number | boolean,
  ) => {
    const current = itemRows.find((item) => item.id === id)
    if (!current) return
    updateItem.mutate({ ...current, [field]: value })
  }

  const handleRemoveItems = async () => {
    if (checkedItemIds.length === 0) return
    if (!(await confirm(`선택한 ${checkedItemIds.length}건을 삭제하시겠습니까?`))) return
    await Promise.all(checkedItemIds.map((id) => deleteItem.mutateAsync(id)))
    setCheckedItemIds([])
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <GridSectionHeader
          title="코드 그룹"
          count={groupRows.length}
          onAdd={() => setCreateGroupOpen(true)}
          onRemove={handleRemoveGroups}
          removeDisabled={checkedGroupIds.length === 0}
        />
        <CodeGroupGrid
          rows={groupRows}
          loading={groupsQuery.isFetching}
          selectedId={selectedGroupId}
          onSelectRow={setSelectedGroupId}
          onCellChange={handleGroupCellChange}
          onSelectionChange={setCheckedGroupIds}
        />
      </div>

      <div className="flex flex-col gap-2">
        <GridSectionHeader
          title="코드 항목"
          count={itemRows.length}
          onAdd={() => setCreateItemOpen(true)}
          onRemove={handleRemoveItems}
          removeDisabled={!selectedGroupId || checkedItemIds.length === 0}
        />
        {selectedGroupId ? (
          <CodeItemGrid
            rows={itemRows}
            loading={itemsQuery.isFetching}
            onCellChange={handleItemCellChange}
            onSelectionChange={setCheckedItemIds}
          />
        ) : (
          <div className="flex h-24 items-center justify-center rounded border border-gray-200 bg-white text-sm text-gray-400">
            코드 그룹을 선택해 주세요.
          </div>
        )}
      </div>

      <CodeGroupCreateModal open={createGroupOpen} onClose={() => setCreateGroupOpen(false)} />
      {selectedGroupId && (
        <CodeItemCreateModal
          open={createItemOpen}
          groupId={selectedGroupId}
          onClose={() => setCreateItemOpen(false)}
        />
      )}
    </div>
  )
}
