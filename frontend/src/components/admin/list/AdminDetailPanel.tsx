import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { Button } from '@/components/common/ui/Button'
import { AdminRoleAssignSection } from './AdminRoleAssignSection'
import { clsx } from '@/utils/clsx'
import { useUpdateAdminMutation, useUpdateAdminRolesMutation } from '@/query/admin-query'
import { useCodeItemsByGroupCodeQuery } from '@/query/common-code-query'
import { useRolesQuery } from '@/query/role-query'
import { useWorkspacesQuery } from '@/query/workspace-query'
import { ADMIN_STATUS_GROUP_CODE, type Admin } from '@/types/admin'

const detailSchema = z.object({
  groups: z.array(z.string()),
  serviceExpiresAt: z.string(),
  status: z.string().min(1, '상태를 선택해 주세요'),
})

type DetailFormValues = z.infer<typeof detailSchema>

// 공통코드에는 라벨만 있고 설명 문구가 없어, 화면 전용 보조 설명을 로컬로 둔다.
const STATUS_DESCRIPTIONS: Record<string, string> = {
  ACTIVE: '로그인 및 시스템 사용이 가능합니다.',
  DORMANT: '장기 미접속으로 휴면 처리된 계정입니다.',
  INACTIVE: '로그인이 차단됩니다. 데이터는 보존됩니다.',
  NEW: '초대 후 첫 로그인 전 상태입니다.',
}

function formatDateTime(value: string | undefined): string {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 16)
}

interface RadioCardProps {
  checked: boolean
  onSelect: () => void
  title: string
  code: string
  description?: string
}

function RadioCard({ checked, onSelect, title, code, description }: RadioCardProps) {
  return (
    <label
      className={clsx(
        'flex cursor-pointer flex-col gap-0.5 rounded border p-3',
        checked ? 'border-rose-500 bg-rose-50/50' : 'border-gray-200',
      )}
    >
      <span className="flex items-center gap-2 text-sm font-medium text-gray-800">
        <input type="radio" checked={checked} onChange={onSelect} className="text-rose-500" />
        {title}
        <span className="text-xs font-normal text-gray-400">{code}</span>
      </span>
      {description && <span className="pl-5 text-xs text-gray-400">{description}</span>}
    </label>
  )
}

interface AdminDetailPanelProps {
  admin: Admin | null
}

export function AdminDetailPanel({ admin }: AdminDetailPanelProps) {
  const { t } = useTranslation('admin')
  const updateAdmin = useUpdateAdminMutation()
  const updateAdminRoles = useUpdateAdminRolesMutation()
  const statusCodesQuery = useCodeItemsByGroupCodeQuery(ADMIN_STATUS_GROUP_CODE)
  const statusCodes = statusCodesQuery.data ?? []
  // 역할 할당 그룹을 표시하기 위해 전체 역할 목록을 함께 조회합니다.
  // 관리자 관리 화면에는 아직 워크스페이스 선택 UI가 없어 첫 번째 워크스페이스를 기본으로 사용합니다.
  const workspacesQuery = useWorkspacesQuery()
  const workspaceId = workspacesQuery.data?.[0]?.id ?? 0
  const rolesQuery = useRolesQuery({ workspaceId, keyword: '' }, { enabled: workspaceId > 0 })
  const roles = rolesQuery.data ?? []
  const [checkedRoleIds, setCheckedRoleIds] = useState<Set<string>>(new Set())

  const { handleSubmit, reset, watch, setValue } = useForm<DetailFormValues>({
    resolver: zodResolver(detailSchema),
    defaultValues: { groups: [], serviceExpiresAt: '', status: '' },
  })

  useEffect(() => {
    if (!admin) return
    reset({
      groups: admin.groups,
      serviceExpiresAt: admin.serviceExpiresAt ?? '',
      status: admin.status,
    })
  }, [admin, reset])

  // 관리자를 바꿔 선택할 때마다 역할 체크 상태를 해당 관리자의 roleIds로 다시 채운다.
  useEffect(() => {
    setCheckedRoleIds(new Set(admin?.roleIds ?? []))
  }, [admin])

  const status = watch('status')

  const onSubmit = handleSubmit(async (values) => {
    if (!admin) return
    await updateAdmin.mutateAsync({
      id: admin.id,
      adminName: admin.adminName,
      email: admin.email,
      department: admin.department,
      status: values.status,
      groups: values.groups,
      serviceExpiresAt: values.serviceExpiresAt || undefined,
    })
  })

  const handleToggleRole = (roleId: string, checked: boolean) => {
    setCheckedRoleIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(roleId)
      else next.delete(roleId)
      return next
    })
  }

  const handleSaveRoles = () => {
    if (!admin) return
    updateAdminRoles.mutate({ id: admin.id, roleIds: Array.from(checkedRoleIds) })
  }

  if (!admin) {
    return (
      <div className="flex h-full min-h-[480px] items-center justify-center rounded border border-gray-200 bg-white text-sm text-gray-400">
        {t('detail.empty')}
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex h-full flex-col gap-5 overflow-y-auto rounded border border-gray-200 bg-white p-5"
    >
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-gray-700">{t('detail.basicInfo')}</h2>
        <dl className="grid grid-cols-[96px_1fr] gap-y-1.5 text-sm">
          <dt className="whitespace-nowrap text-gray-400">ID</dt>
          <dd className="text-gray-700">{admin.id}</dd>
          <dt className="whitespace-nowrap text-gray-400">{t('columns.adminId')}</dt>
          <dd className="text-gray-700">{admin.adminId}</dd>
          <dt className="whitespace-nowrap text-gray-400">{t('columns.adminName')}</dt>
          <dd className="text-gray-700">{admin.adminName}</dd>
          <dt className="whitespace-nowrap text-gray-400">{t('modal.email')}</dt>
          <dd className="text-gray-700">{admin.email}</dd>
          <dt className="whitespace-nowrap text-gray-400">{t('columns.department')}</dt>
          <dd className="text-gray-700">{admin.department || '-'}</dd>
          <dt className="whitespace-nowrap text-gray-400">{t('detail.lastLogin')}</dt>
          <dd className="text-gray-700">{formatDateTime(admin.lastLoginAt)}</dd>
        </dl>
      </section>

      <AdminRoleAssignSection
        admin={admin}
        roles={roles}
        checkedRoleIds={checkedRoleIds}
        saving={updateAdminRoles.isPending}
        onToggleRole={handleToggleRole}
        onSave={handleSaveRoles}
      />

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-gray-700">{t('columns.status')}</h2>
        <div className="flex flex-col gap-2">
          {statusCodes.map((code) => (
            <RadioCard
              key={code.code}
              checked={status === code.code}
              onSelect={() => setValue('status', code.code)}
              title={code.codeName}
              code={code.code}
              description={STATUS_DESCRIPTIONS[code.code]}
            />
          ))}
        </div>
      </section>

      <div className="mt-auto flex justify-end pt-2">
        <Button type="submit" variant="primary" disabled={updateAdmin.isPending}>
          {t('modal.submit')}
        </Button>
      </div>
    </form>
  )
}
