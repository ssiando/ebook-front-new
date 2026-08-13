import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { PageTitle } from '@/components/common/PageTitle'
import { PageSearch } from '@/components/common/PageSearch'
import { Authorized } from '@/components/auth/Authorized'
import { RoleSearch } from '@/components/role/list/RoleSearch'
import { roleSearchSchema, type RoleSearchFormValues } from '@/components/role/list/roleSearchSchema'
import { RoleContent } from '@/components/role/list/RoleContent'
import { useWorkspacesQuery } from '@/query/workspace-query'
import type { RoleSearchParams } from '@/types/role'

const DEFAULT_SEARCH_FORM: RoleSearchFormValues = { workspaceId: '', keyword: '' }
const DEFAULT_PARAMS: RoleSearchParams = { workspaceId: 0, keyword: '' }

export default function RoleManagement() {
  const [params, setParams] = useState<RoleSearchParams>(DEFAULT_PARAMS)

  const { control, handleSubmit, reset } = useForm<RoleSearchFormValues>({
    resolver: zodResolver(roleSearchSchema),
    defaultValues: DEFAULT_SEARCH_FORM,
  })

  const workspacesQuery = useWorkspacesQuery()

  // 워크스페이스 목록이 로드되면 최초 1회 첫 워크스페이스를 기본 선택한다.
  useEffect(() => {
    const workspaces = workspacesQuery.data
    if (!workspaces || workspaces.length === 0 || params.workspaceId > 0) return
    const firstId = workspaces[0].id
    reset({ ...DEFAULT_SEARCH_FORM, workspaceId: String(firstId) })
    setParams((prev) => ({ ...prev, workspaceId: firstId }))
  }, [workspacesQuery.data, params.workspaceId, reset])

  const handleSearch = handleSubmit((values) => {
    setParams({ ...values, workspaceId: Number(values.workspaceId) })
  })

  const handleReset = () => {
    const defaults = { ...DEFAULT_SEARCH_FORM, workspaceId: String(params.workspaceId) }
    reset(defaults)
    setParams({ ...DEFAULT_PARAMS, workspaceId: params.workspaceId })
  }

  return (
    <Authorized>
      <PageTitle title="역할 관리" />

      <PageSearch onReset={handleReset} onSearch={handleSearch}>
        <RoleSearch control={control} />
      </PageSearch>

      <RoleContent params={params} enabled={params.workspaceId > 0} />
    </Authorized>
  )
}
