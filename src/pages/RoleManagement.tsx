import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type Control } from 'react-hook-form'
import { PageTitle } from '@/components/common/PageTitle'
import { PageSearch } from '@/components/common/PageSearch'
import { RoleSearch } from '@/components/role/list/RoleSearch'
import { roleSearchRules, roleSearchSchema, type RoleSearchFormValues } from '@/components/role/list/roleSearchSchema'
import { RoleContent } from '@/components/role/list/RoleContent'
import { RoleCreateModal } from '@/components/role/list/RoleCreateModal'
import { RoleMenuModal } from '@/components/role/list/RoleMenuModal'
import { useRolesQuery } from '@/query/role-query'
import type { Role, RoleSearchParams } from '@/types/role'
import { showFormErrors } from '@/utils/formUtils'

export default function RoleManagement() {
  const [params, setParams] = useState<RoleSearchParams>({ keyword: '' })
  const [createOpen, setCreateOpen] = useState(false)
  const [menuModalRole, setMenuModalRole] = useState<Role | null>(null)

  const methods = useForm<RoleSearchFormValues>({
    resolver: zodResolver(roleSearchSchema),
    defaultValues: { keyword: '' },
  })
  // Control<T>는 내부 validate 함수 프로퍼티가 반공변이라 재사용 컴포넌트가 받는
  // Control<any, any, any>로 자동 캐스팅되지 않는다 — 호출부에서 한 번만 캐스팅한다.
  const control = methods.control as Control<any, any, any>

  const { data, isFetching } = useRolesQuery(params)

  const handleSearch = methods.handleSubmit(
    (values) => {
      setParams(values)
    },
    (errors) => showFormErrors(errors, roleSearchRules),
  )

  const handleReset = () => {
    methods.reset({ keyword: '' })
    setParams({ keyword: '' })
  }

  return (
    <>
      {/* 1. 타이틀 영역 — breadcrumb, 즐겨찾기 등은 공통 컴포넌트에서 주입 */}
      <PageTitle
        title="역할 목록"
        actionButtonsProps={{ onSearch: handleSearch, onRegister: () => setCreateOpen(true) }}
      />

      {/* 2. 조회 영역 — form reset 버튼 기본 포함 */}
      <PageSearch onReset={handleReset}>
        <RoleSearch control={control} />
      </PageSearch>

      {/* 3. 본문 — 그리드는 화면 전용 컴포넌트로 분리, 메뉴 설정은 별도 모달로 처리 */}
      <RoleContent data={data} isLoading={isFetching} onConfigureMenus={setMenuModalRole} />

      <RoleCreateModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <RoleMenuModal role={menuModalRole} onClose={() => setMenuModalRole(null)} />
    </>
  )
}
