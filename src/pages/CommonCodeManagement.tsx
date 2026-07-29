import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { PageTitle } from '@/components/common/PageTitle'
import { PageSearch } from '@/components/common/PageSearch'
import { Button } from '@/components/common/ui/Button'
import { CommonCodeSearch } from '@/components/commonCode/list/CommonCodeSearch'
import {
  commonCodeSearchSchema,
  type CommonCodeSearchFormValues,
} from '@/components/commonCode/list/commonCodeSearchSchema'
import { GridSectionHeader } from '@/components/commonCode/list/GridSectionHeader'
import { CodeGroupGrid } from '@/components/commonCode/list/CodeGroupGrid'
import { CodeItemGrid } from '@/components/commonCode/list/CodeItemGrid'
import {
  useCodeGroupsQuery,
  useCodeItemsQuery,
  useSaveCodeGroupsMutation,
  useSaveCodeItemsMutation,
} from '@/query/common-code-query'
import type { CodeGroup, CodeItem, CommonCodeSearchParams } from '@/types/commonCode'

const DEFAULT_SEARCH: CommonCodeSearchFormValues = { keyword: '', useYn: 'ALL' }

export default function CommonCodeManagement() {
  const [params, setParams] = useState<CommonCodeSearchParams>(DEFAULT_SEARCH)
  const [groupRows, setGroupRows] = useState<CodeGroup[]>([])
  const [checkedGroupIds, setCheckedGroupIds] = useState<string[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [itemRows, setItemRows] = useState<CodeItem[]>([])
  const [checkedItemIds, setCheckedItemIds] = useState<string[]>([])

  const methods = useForm<CommonCodeSearchFormValues>({
    resolver: zodResolver(commonCodeSearchSchema),
    defaultValues: DEFAULT_SEARCH,
  })

  const groupsQuery = useCodeGroupsQuery(params)
  const itemsQuery = useCodeItemsQuery(selectedGroupId)
  const saveGroups = useSaveCodeGroupsMutation()
  const saveItems = useSaveCodeItemsMutation(selectedGroupId)

  useEffect(() => {
    if (groupsQuery.data) setGroupRows(groupsQuery.data.items)
  }, [groupsQuery.data])

  useEffect(() => {
    setItemRows(itemsQuery.data?.items ?? [])
  }, [itemsQuery.data])

  const handleSearch = methods.handleSubmit((values) => {
    setParams(values)
  })

  const handleReset = () => {
    methods.reset(DEFAULT_SEARCH)
    setParams(DEFAULT_SEARCH)
  }

  const handleGroupCellChange = (id: string, field: keyof CodeGroup, value: string | boolean) => {
    setGroupRows((prev) => prev.map((g) => (g.id === id ? { ...g, [field]: value } : g)))
  }

  const handleAddGroup = () => {
    const newGroup: CodeGroup = {
      id: `new-${Date.now()}`,
      groupCode: '',
      groupName: '',
      description: '',
      useYn: true,
      i18nKey: '',
      createdAt: '-',
      updatedAt: '-',
    }
    setGroupRows((prev) => [newGroup, ...prev])
  }

  const handleRemoveGroups = () => {
    setGroupRows((prev) => prev.filter((g) => !checkedGroupIds.includes(g.id)))
    if (selectedGroupId && checkedGroupIds.includes(selectedGroupId)) setSelectedGroupId(null)
    setCheckedGroupIds([])
  }

  const handleItemCellChange = (
    id: string,
    field: keyof CodeItem,
    value: string | number | boolean,
  ) => {
    setItemRows((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleAddItem = () => {
    if (!selectedGroupId) return
    const newItem: CodeItem = {
      id: `new-${Date.now()}`,
      groupId: selectedGroupId,
      code: '',
      codeName: '',
      sortOrder: itemRows.length + 1,
      useYn: true,
      description: '',
      metadata: '',
      i18nKey: '',
      createdAt: '-',
      updatedAt: '-',
    }
    setItemRows((prev) => [newItem, ...prev])
  }

  const handleRemoveItems = () => {
    setItemRows((prev) => prev.filter((item) => !checkedItemIds.includes(item.id)))
    setCheckedItemIds([])
  }

  return (
    <>
      {/* 1. 타이틀 영역 — breadcrumb은 menu.json에서 자동 탐색, 그룹/항목 저장 버튼은 extra로 주입 */}
      <PageTitle
        title="공통 코드"
        actionButtonsProps={{
          extra: (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={() => saveGroups.mutate(groupRows)}
                disabled={saveGroups.isPending}
              >
                그룹 저장
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => saveItems.mutate(itemRows)}
                disabled={!selectedGroupId || saveItems.isPending}
              >
                항목 저장
              </Button>
            </>
          ),
          onSearch: handleSearch,
        }}
      />

      {/* 2. 조회 영역 */}
      <PageSearch onReset={handleReset}>
        <CommonCodeSearch control={methods.control} />
      </PageSearch>

      {/* 3. 본문 — 코드 그룹(상단) 선택 시 코드 항목(하단)이 필터링되는 마스터-디테일 그리드 */}
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <GridSectionHeader
            title="코드 그룹"
            count={groupRows.length}
            onAdd={handleAddGroup}
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
            onAdd={handleAddItem}
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
      </div>
    </>
  )
}
