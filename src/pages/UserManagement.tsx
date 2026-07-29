import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { PageSearch } from '@/components/common/PageSearch'
import { UserSearch } from '@/components/user/list/UserSearch'
import {
  searchSchema,
  userSearchRules,
  type UserSearchFormValues,
} from '@/components/user/list/searchSchema'
import { UserContent } from '@/components/user/list/UserContent'
import { UserCreateModal } from '@/components/user/list/UserCreateModal'
import { useUsersQuery } from '@/query/user-query'
import type { UserSearchParams } from '@/types/user'
import { PageTitle } from '@/components/common/PageTitle'
import { showFormErrors } from '@/utils/formUtils'

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function defaultSearchValues(): UserSearchFormValues {
  const today = new Date()
  const monthAgo = new Date(today)
  monthAgo.setDate(monthAgo.getDate() - 30)
  return {
    updatedFrom: toDateInputValue(monthAgo),
    updatedTo: toDateInputValue(today),
    keyword: '',
  }
}

export default function UserManagement() {
  const { t } = useTranslation('user')
  const [params, setParams] = useState<UserSearchParams>({
    ...defaultSearchValues(),
    page: 1,
    pageSize: 15,
  })
  const [createOpen, setCreateOpen] = useState(false)

  const { control, reset, handleSubmit } = useForm<UserSearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: defaultSearchValues(),
  })

  const { data, isFetching } = useUsersQuery(params)

  const handleSearch = handleSubmit(
    (values) => {
      setParams((prev) => ({ ...prev, ...values, page: 1 }))
    },
    (errors) => showFormErrors(errors, userSearchRules),
  )

  const handleReset = () => {
    const defaults = defaultSearchValues()
    reset(defaults)
    setParams((prev) => ({ ...prev, ...defaults, page: 1 }))
  }

  return (
    <>
      {/* 1. 타이틀 영역 — breadcrumb, 즐겨찾기 등은 공통 컴포넌트에서 주입 */}
      <PageTitle
        title={t('title')}
        actionButtonsProps={{
          onSearch: handleSearch,
          searchLabel: t('search'),
          onRegister: () => setCreateOpen(true),
          registerLabel: t('register'),
        }}
      />

      {/* 2. 조회 영역 — form reset 버튼 기본 포함 */}
      <PageSearch onReset={handleReset}>
        <UserSearch control={control} />
      </PageSearch>

      {/* 3. 본문 — 그리드·페이지네이션은 화면 전용 컴포넌트로 분리 */}
      <UserContent
        data={data}
        isLoading={isFetching}
        page={params.page}
        pageSize={params.pageSize}
        onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
        onPageSizeChange={(pageSize) => setParams((prev) => ({ ...prev, pageSize, page: 1 }))}
      />

      <UserCreateModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  )
}
