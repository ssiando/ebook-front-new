import type { Control } from 'react-hook-form'
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { useWorkspacesQuery } from '@/query/workspace-query'
import type { RoleSearchFormValues } from './roleSearchSchema'

interface RoleSearchProps {
  control: Control<RoleSearchFormValues>
}

export function RoleSearch({ control }: RoleSearchProps) {
  const workspacesQuery = useWorkspacesQuery()
  const workspaces = workspacesQuery.data ?? []

  return (
    <>
      <FormSelect
        name="workspaceId"
        control={control}
        label="워크스페이스"
        required
        className="w-40"
        options={workspaces.map((workspace) => ({ label: workspace.name, value: String(workspace.id) }))}
      />
      <FormInput
        name="keyword"
        control={control}
        label="역할명·설명"
        placeholder="역할명 또는 설명을 입력해 주세요"
        className="w-64"
      />
    </>
  )
}
