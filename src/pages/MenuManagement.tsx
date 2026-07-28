import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { PageTitle } from '@/components/common/PageTitle'
import { PageSearch } from '@/components/common/PageSearch'
import { MenuSearch } from '@/components/menu/list/MenuSearch'
import { menuSearchRules, menuSearchSchema, type MenuSearchFormValues } from '@/components/menu/list/menuSearchSchema'
import { MenuContent } from '@/components/menu/list/MenuContent'
import { MenuCreateModal } from '@/components/menu/list/MenuCreateModal'
import { useMenusQuery } from '@/query/menu-admin-query'
import type { MenuSearchParams } from '@/types/menuAdmin'
import { showFormErrors } from '@/utils/formUtils'

export default function MenuManagement() {
  const [params, setParams] = useState<MenuSearchParams>({ keyword: '' })
  const [createOpen, setCreateOpen] = useState(false)

  const methods = useForm<MenuSearchFormValues>({
    resolver: zodResolver(menuSearchSchema),
    defaultValues: { keyword: '' },
  })

  const { data, isFetching } = useMenusQuery(params)

  const handleSearch = methods.handleSubmit(
    (values) => {
      setParams(values)
    },
    (errors) => showFormErrors(errors, menuSearchRules),
  )

  const handleReset = () => {
    setParams({ keyword: '' })
  }

  return (
    <FormProvider {...methods}>
      {/* 1. 타이틀 영역 — breadcrumb, 즐겨찾기 등은 공통 컴포넌트에서 주입 */}
      <PageTitle
        title="메뉴 목록"
        actionButtonsProps={{ onSearch: handleSearch, onRegister: () => setCreateOpen(true) }}
      />

      {/* 2. 조회 영역 — form reset 버튼 기본 포함 */}
      <PageSearch onReset={handleReset}>
        <MenuSearch />
      </PageSearch>

      {/* 3. 본문 — 그리드는 화면 전용 컴포넌트로 분리 */}
      <MenuContent data={data} isLoading={isFetching} />

      <MenuCreateModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </FormProvider>
  )
}
