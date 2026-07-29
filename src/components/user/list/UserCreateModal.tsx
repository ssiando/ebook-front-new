import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { Modal } from '@/components/common/ui/Modal'
import { Button } from '@/components/common/ui/Button'
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { useCreateUserMutation } from '@/query/user-query'
import { showFormErrors, type FormRules } from '@/utils/formUtils'

// role이 enum(select)이라 defineFormRules 표준 규칙(문자열/숫자/불리언) 밖의 경우 —
// 패턴 B(z.object 직접 작성)를 사용합니다.
const createUserSchema = z.object({
  userId: z.string().min(1, '사용자ID를 입력해 주세요'),
  userName: z.string().min(1, '사용자명을 입력해 주세요'),
  department: z.string().min(1, '소속을 입력해 주세요'),
  role: z.enum(['ADMIN', 'MANAGER', 'MEMBER']),
})

type CreateUserFormValues = z.infer<typeof createUserSchema>

interface UserCreateModalProps {
  open: boolean
  onClose: () => void
}

export function UserCreateModal({ open, onClose }: UserCreateModalProps) {
  const { t } = useTranslation('user')
  const createUser = useCreateUserMutation()
  const methods = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { userId: '', userName: '', department: '', role: 'MEMBER' },
  })

  // 패턴 B에서도 showFormErrors에 라벨만 넘기기 위한 최소 매핑
  const errorLabels: FormRules = {
    userId: { type: 'string', label: t('modal.userId') },
    userName: { type: 'string', label: t('modal.userName') },
    department: { type: 'string', label: t('modal.department') },
    role: { type: 'string', label: t('modal.role') },
  }

  const handleSubmit = methods.handleSubmit(
    async (values) => {
      await createUser.mutateAsync(values)
      methods.reset()
      onClose()
    },
    (errors) => showFormErrors(errors, errorLabels),
  )

  return (
    <Modal open={open} title={t('modal.title')} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
        <FormInput name="userId" control={methods.control} label={t('modal.userId')} required />
        <FormInput name="userName" control={methods.control} label={t('modal.userName')} required />
        <FormInput
          name="department"
          control={methods.control}
          label={t('modal.department')}
          required
        />
        <FormSelect
          name="role"
          control={methods.control}
          label={t('modal.role')}
          required
          options={[
            { label: t('role.ADMIN'), value: 'ADMIN' },
            { label: t('role.MANAGER'), value: 'MANAGER' },
            { label: t('role.MEMBER'), value: 'MEMBER' },
          ]}
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('modal.cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={createUser.isPending}>
            {t('modal.submit')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
