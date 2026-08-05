import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { PageTitle } from '@/components/common/PageTitle'
import { PageSearch } from '@/components/common/PageSearch'
import { Authorized } from '@/components/auth/Authorized'
import { RoleSearch } from '@/components/role/list/RoleSearch'
import { roleSearchSchema } from '@/components/role/list/roleSearchSchema'
import { RoleContent } from '@/components/role/list/RoleContent'
import type { RoleSearchParams } from '@/types/role'

function defaultSearchValues(): RoleSearchParams {
  return { keyword: '' }
}

export default function RoleManagement() {
  const [appliedSearch, setAppliedSearch] = useState<RoleSearchParams>(defaultSearchValues())

  const { control, handleSubmit } = useForm<RoleSearchParams>({
    resolver: zodResolver(roleSearchSchema),
    defaultValues: defaultSearchValues(),
  })

  const handleSearch = handleSubmit((values) => {
    setAppliedSearch(values)
  })

  return (
    <Authorized>
      <PageTitle title="역할 관리" />

      <PageSearch control={control} onSearch={handleSearch}>
        <RoleSearch control={control} />
      </PageSearch>

      <RoleContent params={appliedSearch} />
    </Authorized>
  )
}
