import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Plus, Minus } from 'lucide-react'
import { PageTitle } from '@/components/common/PageTitle'
import { PageSearch } from '@/components/common/PageSearch'
import { Button } from '@/components/common/ui/Button'
import { DeleteButton } from '@/components/common/ui/DeleteButton'
import { Authorized } from '@/components/auth/Authorized'
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
import { useWorkspacesQuery } from '@/query/workspace-query'
import type { ProgramAdminItem, ProgramSearchParams } from '@/types/programAdmin'

const DEFAULT_SEARCH_FORM: ProgramSearchFormValues = {
  workspaceId: '',
  keyword: '',
  type: 'ALL',
  useYn: 'ALL',
}

const DEFAULT_PARAMS: ProgramSearchParams = {
  workspaceId: 0,
  keyword: '',
  type: 'ALL',
  useYn: 'ALL',
}

let tempIdCounter = 0

export default function ProgramManagement() {
  const [params, setParams] = useState<ProgramSearchParams>(DEFAULT_PARAMS)
  const [rows, setRows] = useState<ProgramAdminItem[]>([])
  const [checkedIds, setCheckedIds] = useState<number[]>([])

  const methods = useForm<ProgramSearchFormValues>({
    resolver: zodResolver(programSearchSchema),
    defaultValues: DEFAULT_SEARCH_FORM,
  })

  const workspacesQuery = useWorkspacesQuery()
  const programsQuery = useProgramsQuery(params, { enabled: params.workspaceId > 0 })
  const savePrograms = useSaveProgramsMutation()
  const deletePrograms = useDeleteProgramsMutation()

  // 워크스페이스 목록이 로드되면 최초 1회 첫 워크스페이스를 기본 선택한다.
  useEffect(() => {
    const workspaces = workspacesQuery.data
    if (!workspaces || workspaces.length === 0 || params.workspaceId > 0) return
    const firstId = workspaces[0].id
    methods.reset({ ...DEFAULT_SEARCH_FORM, workspaceId: String(firstId) })
    setParams((prev) => ({ ...prev, workspaceId: firstId }))
  }, [workspacesQuery.data, params.workspaceId, methods])

  useEffect(() => {
    if (programsQuery.data) setRows(programsQuery.data.items)
  }, [programsQuery.data])

  const handleSearch = methods.handleSubmit((values) => {
    setParams({ ...values, workspaceId: Number(values.workspaceId) })
  })

  const handleReset = () => {
    const defaults = { ...DEFAULT_SEARCH_FORM, workspaceId: String(params.workspaceId) }
    methods.reset(defaults)
    setParams({ ...DEFAULT_PARAMS, workspaceId: params.workspaceId })
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
      workspaceId: params.workspaceId,
      parentProgramId: null,
      code: '',
      name: '',
      type: 'PAGE',
      httpMethod: '',
      url: '',
      sortOrder: 0,
      displayYn: true,
      useYn: true,
      i18nKeyId: null,
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
    <Authorized>
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
            <DeleteButton
              onClick={handleDelete}
              disabled={checkedIds.length === 0 || deletePrograms.isPending}
            />
          </div>
        </div>

        <ProgramListGrid
          rows={rows}
          loading={programsQuery.isFetching}
          onCellChange={handleCellChange}
          onSelectionChange={setCheckedIds}
        />
      </div>
    </Authorized>
  )
}
