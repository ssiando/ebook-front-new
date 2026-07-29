import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Plus, Minus } from 'lucide-react'
import { PageTitle } from '@/components/common/PageTitle'
import { PageSearch } from '@/components/common/PageSearch'
import { Button } from '@/components/common/ui/Button'
import { ProgramSearch } from '@/components/program/list/ProgramSearch'
import {
  programSearchSchema,
  type ProgramSearchFormValues,
} from '@/components/program/list/programSearchSchema'
import { ProgramListGrid } from '@/components/program/list/ProgramListGrid'
import {
  useDeleteProgramsMutation,
  useProgramsQuery,
  useSaveProgramsMutation,
} from '@/query/program-admin-query'
import type { ProgramAdminItem, ProgramSearchParams } from '@/types/programAdmin'

const DEFAULT_SEARCH: ProgramSearchFormValues = {
  system: 'VFX',
  keyword: '',
  type: 'ALL',
  useYn: 'ALL',
}

let tempIdCounter = 0

export default function ProgramManagement() {
  const [params, setParams] = useState<ProgramSearchParams>(DEFAULT_SEARCH)
  const [rows, setRows] = useState<ProgramAdminItem[]>([])
  const [checkedIds, setCheckedIds] = useState<number[]>([])

  const methods = useForm<ProgramSearchFormValues>({
    resolver: zodResolver(programSearchSchema),
    defaultValues: DEFAULT_SEARCH,
  })

  const programsQuery = useProgramsQuery(params)
  const savePrograms = useSaveProgramsMutation()
  const deletePrograms = useDeleteProgramsMutation()

  useEffect(() => {
    if (programsQuery.data) setRows(programsQuery.data.items)
  }, [programsQuery.data])

  const handleSearch = methods.handleSubmit((values) => {
    setParams(values)
  })

  const handleReset = () => {
    methods.reset(DEFAULT_SEARCH)
    setParams(DEFAULT_SEARCH)
  }

  const handleCellChange = (
    id: number,
    field: keyof ProgramAdminItem,
    value: string | number | boolean | null,
  ) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)))
  }

  const handleAddRow = () => {
    tempIdCounter -= 1
    const newRow: ProgramAdminItem = {
      id: tempIdCounter,
      system: params.system,
      parentProgramId: null,
      code: '',
      name: '',
      type: 'PAGE',
      httpMethod: '',
      url: '',
      sortOrder: 0,
      displayYn: true,
      useYn: true,
      platformAdminOnly: false,
      i18nKeyId: '',
      description: '',
      createdAt: '-',
      updatedAt: '-',
    }
    setRows((prev) => [newRow, ...prev])
  }

  const handleRemoveRows = () => {
    setRows((prev) => prev.filter((row) => !checkedIds.includes(row.id)))
    setCheckedIds([])
  }

  const handleSaveAll = () => {
    savePrograms.mutate(rows)
  }

  const handleDelete = () => {
    const existingIds = checkedIds.filter((id) => id > 0)
    if (existingIds.length === 0) {
      handleRemoveRows()
      return
    }
    deletePrograms.mutate(existingIds, {
      onSuccess: () => setCheckedIds([]),
    })
  }

  return (
    <>
      {/* 1. 타이틀 영역 — breadcrumb은 menu.json에서 자동 탐색 */}
      <PageTitle
        title="프로그램 관리"
        actionButtonsProps={{
          onSearch: handleSearch,
          onRegister: handleSaveAll,
          registerLabel: '저장',
        }}
      />

      {/* 2. 조회 영역 */}
      <PageSearch onReset={handleReset}>
        <ProgramSearch control={methods.control} />
      </PageSearch>

      {/* 3. 본문 */}
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm text-gray-500">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            프로그램 목록 총 {rows.length}건
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddRow}
              aria-label="행 추가"
              className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 text-gray-500 hover:bg-gray-50"
            >
              <Plus size={14} />
            </button>
            <button
              type="button"
              onClick={handleRemoveRows}
              disabled={checkedIds.length === 0}
              aria-label="선택 행 제거"
              className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus size={14} />
            </button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSaveAll}
              disabled={savePrograms.isPending}
            >
              단건등록
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSaveAll}
              disabled={savePrograms.isPending}
            >
              단건수정
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={checkedIds.length === 0 || deletePrograms.isPending}
            >
              삭제
            </Button>
          </div>
        </div>

        <ProgramListGrid
          rows={rows}
          loading={programsQuery.isFetching}
          onCellChange={handleCellChange}
          onSelectionChange={setCheckedIds}
        />
      </div>
    </>
  )
}
