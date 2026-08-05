import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { PageSearch } from '@/components/common/PageSearch'
import { Authorized } from '@/components/auth/Authorized'
import { AdminSearch } from '@/components/admin/list/AdminSearch'
import { searchSchema } from '@/components/admin/list/searchSchema'
import { AdminContent } from '@/components/admin/list/AdminContent'
import type { AdminSearchParams } from '@/types/admin'
import { PageTitle } from '@/components/common/PageTitle'

function defaultSearchValues(): AdminSearchParams {
  return {
    keyword: '',
    department: 'ALL',
    status: 'ALL',
  }
}

export default function AdminManagement() {
  const { t } = useTranslation('admin')
  const [appliedSearch, setAppliedSearch] = useState<AdminSearchParams>(defaultSearchValues())
  const [searchRevision, setSearchRevision] = useState(0)

  const { control, handleSubmit } = useForm<AdminSearchParams>({
    resolver: zodResolver(searchSchema),
    defaultValues: defaultSearchValues(),
  })

  const handleSearch = handleSubmit((values) => {
    setAppliedSearch(values)
    setSearchRevision((prev) => prev + 1)
  })

  return (
    <Authorized>
      <PageTitle title={t('title')} />

      <PageSearch control={control} onSearch={handleSearch}>
        <AdminSearch control={control} />
      </PageSearch>

      <AdminContent params={appliedSearch} searchRevision={searchRevision} />
    </Authorized>
  )
}
