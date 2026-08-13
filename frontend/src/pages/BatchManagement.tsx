import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { PageTitle } from '@/components/common/PageTitle'
import { PageSearch } from '@/components/common/PageSearch'
import { Authorized } from '@/components/auth/Authorized'
import { BatchSearch } from '@/components/batch/list/BatchSearch'
import {
  batchSearchRules,
  batchSearchSchema,
  type BatchSearchFormValues,
} from '@/components/batch/list/batchSearchSchema'
import { BatchContent } from '@/components/batch/list/BatchContent'
import { BatchRunPathModal } from '@/components/batch/list/BatchRunPathModal'
import { useBatchesQuery, useRunBatchMutation } from '@/query/batch-query'
import type { BatchSearchParams } from '@/types/batch'
import { showFormErrors } from '@/utils/formUtils'
import { useToastStore } from '@/store/useToastStore'

const DEFAULT_SEARCH: BatchSearchFormValues = { keyword: '' }

export default function BatchManagement() {
  const [params, setParams] = useState<BatchSearchParams>(DEFAULT_SEARCH)
  const [runPathTargetId, setRunPathTargetId] = useState<string | null>(null)

  const { control, reset, handleSubmit } = useForm<BatchSearchFormValues>({
    resolver: zodResolver(batchSearchSchema),
    defaultValues: DEFAULT_SEARCH,
  })

  const { data, isFetching } = useBatchesQuery(params)
  const runBatch = useRunBatchMutation()

  const handleSearch = handleSubmit(
    (values) => setParams(values),
    (errors) => showFormErrors(errors, batchSearchRules),
  )

  const handleReset = () => {
    reset(DEFAULT_SEARCH)
    setParams(DEFAULT_SEARCH)
  }

  const handleHistoryClick = () => {
    useToastStore.getState().push('이력 조회 기능은 준비 중입니다.')
  }

  const handleRunClick = (id: string) => {
    const batch = data?.find((item) => item.id === id)
    if (!batch) return
    if (batch.requiresPath) {
      setRunPathTargetId(id)
      return
    }
    runBatch.mutate(
      { id, batchCode: batch.batchCode },
      { onSuccess: () => useToastStore.getState().push('배치를 실행했습니다.') },
    )
  }

  const handleRunPathConfirm = (targetPath: string) => {
    const batch = data?.find((item) => item.id === runPathTargetId)
    if (!runPathTargetId || !batch) return
    runBatch.mutate(
      { id: runPathTargetId, batchCode: batch.batchCode, targetPath },
      {
        onSuccess: () => {
          useToastStore.getState().push('DB 백업을 완료했습니다.')
          setRunPathTargetId(null)
        },
        onError: (error) => {
          useToastStore
            .getState()
            .push(error instanceof Error ? error.message : 'DB 백업에 실패했습니다.')
        },
      },
    )
  }

  return (
    <Authorized>
      {/* 1. 타이틀 영역 — breadcrumb은 menu.json에서 자동 탐색 */}
      <PageTitle
        title="배치 관리"
        description="배치 작업 목록을 조회하고, 이력을 확인하며 수동 실행이 가능한 배치를 실행합니다."
        actionButtonsProps={{ onSearch: handleSearch }}
      />

      {/* 2. 조회 영역 — form reset 버튼 기본 포함 */}
      <PageSearch onReset={handleReset}>
        <BatchSearch control={control} />
      </PageSearch>

      {/* 3. 본문 — 그리드는 화면 전용 컴포넌트로 분리 */}
      <BatchContent
        data={data}
        isLoading={isFetching}
        runningId={runBatch.isPending ? (runBatch.variables?.id ?? null) : null}
        onHistoryClick={handleHistoryClick}
        onRunClick={handleRunClick}
      />

      <BatchRunPathModal
        open={runPathTargetId !== null}
        submitting={runBatch.isPending}
        onClose={() => setRunPathTargetId(null)}
        onConfirm={handleRunPathConfirm}
      />
    </Authorized>
  )
}
