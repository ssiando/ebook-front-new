import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { PageSearch } from '@/components/common/PageSearch'
import { Authorized } from '@/components/auth/Authorized'
import { AdminSearch } from '@/components/admin/list/AdminSearch'
import { searchSchema, type AdminSearchFormValues } from '@/components/admin/list/searchSchema'
import { AdminContent } from '@/components/admin/list/AdminContent'
import { AdminCreateModal } from '@/components/admin/list/AdminCreateModal'
import { useAdminsQuery } from '@/query/admin-query'
import { useRolesQuery } from '@/query/role-query'
import type { AdminSearchParams } from '@/types/admin'
import { PageTitle } from '@/components/common/PageTitle'

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function defaultSearchValues(): AdminSearchFormValues {
  const today = new Date()
  const monthAgo = new Date(today)
  monthAgo.setDate(monthAgo.getDate() - 30)
  return {
    updatedFrom: toDateInputValue(monthAgo),
    updatedTo: toDateInputValue(today),
    keyword: '',
    department: 'ALL',
    status: 'ALL',
  }
}

export default function AdminManagement() {
  const { t } = useTranslation('admin')
  const [params, setParams] = useState<AdminSearchParams>({
    ...defaultSearchValues(),
    page: 1,
    pageSize: 15,
  })
  const [createOpen, setCreateOpen] = useState(false)

  const { control, reset, handleSubmit } = useForm<AdminSearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: defaultSearchValues(),
  })

  const { data, isFetching } = useAdminsQuery(params)
  // 그리드에 역할명을 표시하기 위해 전체 역할 목록을 함께 조회합니다.
  const rolesQuery = useRolesQuery({ system: 'ALL', keyword: '', page: 1, pageSize: 200 })

  const handleSearch = handleSubmit((values) => {
    setParams((prev) => ({ ...prev, ...values, page: 1 }))
  })

  const handleReset = () => {
    const defaults = defaultSearchValues()
    reset(defaults)
    setParams((prev) => ({ ...prev, ...defaults, page: 1 }))
  }

  return (
    <Authorized>
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
        <AdminSearch control={control} />
      </PageSearch>

      {/* 3. 본문 — 그리드·페이지네이션은 화면 전용 컴포넌트로 분리 */}
      <AdminContent
        data={data}
        roles={rolesQuery.data?.items ?? []}
        isLoading={isFetching}
        page={params.page}
        pageSize={params.pageSize}
        onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
        onPageSizeChange={(pageSize) => setParams((prev) => ({ ...prev, pageSize, page: 1 }))}
      />

      <AdminCreateModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </Authorized>
  )
}
