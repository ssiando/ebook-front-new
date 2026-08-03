import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { Modal } from '@/components/common/ui/Modal'
import { Button } from '@/components/common/ui/Button'
import { FormInput } from '@/components/common/form/FormInput'
import { FormCheckboxGroup } from '@/components/common/form/FormCheckboxGroup'
import { useCreateAdminMutation } from '@/query/admin-query'
import { useRolesQuery } from '@/query/role-query'
import { showFormErrors, type FormRules } from '@/utils/formUtils'

// roleIds가 다중 선택(체크박스)이라 defineFormRules 표준 규칙(문자열/숫자/불리언) 밖의 경우 —
// 패턴 B(z.object 직접 작성)를 사용합니다.
const createAdminSchema = z.object({
  adminId: z.string().min(1, '관리자ID를 입력해 주세요'),
  adminName: z.string().min(1, '관리자명을 입력해 주세요'),
  email: z.string().min(1, '이메일을 입력해 주세요').email('이메일 형식이 올바르지 않습니다'),
  department: z.string().min(1, '소속을 입력해 주세요'),
  roleIds: z.array(z.string()).min(1, '역할을 하나 이상 선택해 주세요'),
})

type CreateAdminFormValues = z.infer<typeof createAdminSchema>

interface AdminCreateModalProps {
  open: boolean
  onClose: () => void
}

export function AdminCreateModal({ open, onClose }: AdminCreateModalProps) {
  const { t } = useTranslation('admin')
  const createAdmin = useCreateAdminMutation()
  // 역할 다중 선택 목록을 위해 전체 역할을 조회합니다 (역할 관리 화면과 동일한 Role 엔티티 참조).
  const rolesQuery = useRolesQuery({ system: 'ALL', keyword: '', page: 1, pageSize: 200 })
  const roleOptions = (rolesQuery.data?.items ?? []).map((role) => ({
    label: `${role.roleName} (${role.system})`,
    value: role.id,
  }))

  const methods = useForm<CreateAdminFormValues>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: { adminId: '', adminName: '', email: '', department: '', roleIds: [] },
  })

  // 패턴 B에서도 showFormErrors에 라벨만 넘기기 위한 최소 매핑
  const errorLabels: FormRules = {
    adminId: { type: 'string', label: t('modal.adminId') },
    adminName: { type: 'string', label: t('modal.adminName') },
    email: { type: 'string', label: t('modal.email') },
    department: { type: 'string', label: t('modal.department') },
    roleIds: { type: 'string', label: t('modal.roles') },
  }

  const handleSubmit = methods.handleSubmit(
    async (values) => {
      await createAdmin.mutateAsync(values)
      methods.reset()
      onClose()
    },
    (errors) => showFormErrors(errors, errorLabels),
  )

  return (
    <Modal open={open} title={t('modal.title')} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
        <FormInput name="adminId" control={methods.control} label={t('modal.adminId')} required />
        <FormInput
          name="adminName"
          control={methods.control}
          label={t('modal.adminName')}
          required
        />
        <FormInput
          name="email"
          control={methods.control}
          type="email"
          label={t('modal.email')}
          required
        />
        <FormInput
          name="department"
          control={methods.control}
          label={t('modal.department')}
          required
        />
        <FormCheckboxGroup
          name="roleIds"
          control={methods.control}
          label={t('modal.roles')}
          required
          options={roleOptions}
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('modal.cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={createAdmin.isPending}>
            {t('modal.submit')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
