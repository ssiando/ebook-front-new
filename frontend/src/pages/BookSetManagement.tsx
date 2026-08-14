import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { PageTitle } from '@/components/common/PageTitle'
import { PageSearch } from '@/components/common/PageSearch'
import { Authorized } from '@/components/auth/Authorized'
import { BookSetSearch } from '@/components/bookSet/list/BookSetSearch'
import {
  bookSetSearchRules,
  bookSetSearchSchema,
  type BookSetSearchFormValues,
} from '@/components/bookSet/list/bookSetSearchSchema'
import { BookSetContent } from '@/components/bookSet/list/BookSetContent'
import { useBookSetsQuery } from '@/query/book-set-query'
import type { BookSetSearchParams } from '@/types/bookSet'
import { showFormErrors } from '@/utils/formUtils'

const DEFAULT_SEARCH: BookSetSearchFormValues = { keyword: '' }

export default function BookSetManagement() {
  const [params, setParams] = useState<BookSetSearchParams>(DEFAULT_SEARCH)

  const { control, reset, handleSubmit } = useForm<BookSetSearchFormValues>({
    resolver: zodResolver(bookSetSearchSchema),
    defaultValues: DEFAULT_SEARCH,
  })

  const { data, isFetching } = useBookSetsQuery(params)

  const handleSearch = handleSubmit(
    (values) => setParams(values),
    (errors) => showFormErrors(errors, bookSetSearchRules),
  )

  const handleReset = () => {
    reset(DEFAULT_SEARCH)
    setParams(DEFAULT_SEARCH)
  }

  return (
    <Authorized>
      {/* 1. 타이틀 영역 — breadcrumb은 menu.json에서 자동 탐색 */}
      <PageTitle title="도서 세트 관리" actionButtonsProps={{ onSearch: handleSearch }} />

      {/* 2. 조회 영역 — form reset 버튼 기본 포함 */}
      <PageSearch onReset={handleReset}>
        <BookSetSearch control={control} />
      </PageSearch>

      {/* 3. 본문 — 좌: 세트 목록, 우: 도서 배정 패널 */}
      <BookSetContent data={data} isLoading={isFetching} />
    </Authorized>
  )
}
