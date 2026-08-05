import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { PageTitle } from '@/components/common/PageTitle'
import { PageSearch } from '@/components/common/PageSearch'
import { Authorized } from '@/components/auth/Authorized'
import { CommonCodeSearch } from '@/components/commonCode/list/CommonCodeSearch'
import { commonCodeSearchSchema } from '@/components/commonCode/list/commonCodeSearchSchema'
import { CommonCodeContent } from '@/components/commonCode/list/CommonCodeContent'
import type { CommonCodeSearchParams } from '@/types/commonCode'

function defaultSearchValues(): CommonCodeSearchParams {
  return { keyword: '', useYn: 'ALL' }
}

export default function CommonCodeManagement() {
  const [appliedSearch, setAppliedSearch] = useState<CommonCodeSearchParams>(defaultSearchValues())

  const { control, handleSubmit } = useForm<CommonCodeSearchParams>({
    resolver: zodResolver(commonCodeSearchSchema),
    defaultValues: defaultSearchValues(),
  })

  const handleSearch = handleSubmit((values) => {
    setAppliedSearch(values)
  })

  return (
    <Authorized>
      <PageTitle title="공통 코드" />

      <PageSearch control={control} onSearch={handleSearch}>
        <CommonCodeSearch control={control} />
      </PageSearch>

      <CommonCodeContent params={appliedSearch} />
    </Authorized>
  )
}
