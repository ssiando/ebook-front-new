import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { PageTitle } from '@/components/common/PageTitle'
import { PageSearch } from '@/components/common/PageSearch'
import { Authorized } from '@/components/auth/Authorized'
import { DbBackupSearch } from '@/components/dbBackup/list/DbBackupSearch'
import {
  dbBackupSearchRules,
  dbBackupSearchSchema,
  type DbBackupSearchFormValues,
} from '@/components/dbBackup/list/dbBackupSearchSchema'
import { DbBackupContent } from '@/components/dbBackup/list/DbBackupContent'
import { useDbBackupsQuery } from '@/query/db-backup-query'
import type { DbBackupSearchParams } from '@/types/dbBackup'
import { showFormErrors } from '@/utils/formUtils'

const DEFAULT_SEARCH: DbBackupSearchFormValues = { keyword: '' }

export default function DbBackupManagement() {
  const [params, setParams] = useState<DbBackupSearchParams>(DEFAULT_SEARCH)

  const { control, reset, handleSubmit } = useForm<DbBackupSearchFormValues>({
    resolver: zodResolver(dbBackupSearchSchema),
    defaultValues: DEFAULT_SEARCH,
  })

  const { data, isFetching } = useDbBackupsQuery(params)

  const handleSearch = handleSubmit(
    (values) => setParams(values),
    (errors) => showFormErrors(errors, dbBackupSearchRules),
  )

  const handleReset = () => {
    reset(DEFAULT_SEARCH)
    setParams(DEFAULT_SEARCH)
  }

  return (
    <Authorized>
      {/* 1. 타이틀 영역 — breadcrumb은 menu.json에서 자동 탐색 */}
      <PageTitle
        title="DB 백업 관리"
        description="DB를 백업하고, 백업 이력에서 원하는 시점으로 복원합니다."
        actionButtonsProps={{ onSearch: handleSearch }}
      />

      {/* 2. 조회 영역 — form reset 버튼 기본 포함 */}
      <PageSearch onReset={handleReset}>
        <DbBackupSearch control={control} />
      </PageSearch>

      {/* 3. 본문 */}
      <DbBackupContent data={data} isLoading={isFetching} />
    </Authorized>
  )
}
