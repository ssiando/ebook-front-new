import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { PageTitle } from '@/components/common/PageTitle'
import { PageSearch } from '@/components/common/PageSearch'
import { Authorized } from '@/components/auth/Authorized'
import { BookSearch } from '@/components/book/list/BookSearch'
import { bookSearchSchema, type BookSearchFormValues } from '@/components/book/list/bookSearchSchema'
import { BookContent } from '@/components/book/list/BookContent'
import { useBooksQuery } from '@/query/book-query'
import type { BookSearchParams } from '@/types/book'

const DEFAULT_SEARCH: BookSearchFormValues = { keyword: '', bookType: 'ALL', activeYn: 'ALL' }

export default function BookManagement() {
  const [params, setParams] = useState<BookSearchParams>(DEFAULT_SEARCH)

  const { control, reset, handleSubmit } = useForm<BookSearchFormValues>({
    resolver: zodResolver(bookSearchSchema),
    defaultValues: DEFAULT_SEARCH,
  })

  const { data, isFetching } = useBooksQuery(params)

  const handleSearch = handleSubmit((values) => setParams(values))

  const handleReset = () => {
    reset(DEFAULT_SEARCH)
    setParams(DEFAULT_SEARCH)
  }

  return (
    <Authorized>
      {/* 1. 타이틀 영역 — breadcrumb은 menu.json에서 자동 탐색 */}
      <PageTitle title="도서 관리" actionButtonsProps={{ onSearch: handleSearch }} />

      {/* 2. 조회 영역 — form reset 버튼 기본 포함 */}
      <PageSearch onReset={handleReset}>
        <BookSearch control={control} />
      </PageSearch>

      {/* 3. 본문 */}
      <BookContent data={data} isLoading={isFetching} />
    </Authorized>
  )
}
