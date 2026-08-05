import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Modal } from '@/components/common/ui/Modal'
import { Button } from '@/components/common/ui/Button'
import { FormInput } from '@/components/common/form/FormInput'
import { useCreateRoleMutation } from '@/query/role-query'
import { useAuthStore } from '@/store/useAuthStore'
import { defineFormRules, showFormErrors, validateForm } from '@/utils/formUtils'

const createRoleRules = defineFormRules({
  roleName: { type: 'string', required: true, maxLength: 100, label: '역할명' },
  description: { type: 'string', maxLength: 255, label: '설명' },
})

const createRoleSchema = validateForm(createRoleRules)

interface RoleCreateModalProps {
  open: boolean
  onClose: () => void
}

export function RoleCreateModal({ open, onClose }: RoleCreateModalProps) {
  const createRole = useCreateRoleMutation()
  const currentAdmin = useAuthStore((s) => s.currentAdmin)

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(createRoleSchema),
    defaultValues: { roleName: '', description: '' },
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = handleSubmit(
    async (values) => {
      await createRole.mutateAsync({ ...values, registrant: currentAdmin?.adminId ?? '' })
      handleClose()
    },
    (errors) => showFormErrors(errors, createRoleRules),
  )

  return (
    <Modal open={open} title="역할 등록" onClose={handleClose}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
        <FormInput name="roleName" control={control} label={createRoleRules.roleName.label} required />
        <FormInput name="description" control={control} label={createRoleRules.description.label} />
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            취소
          </Button>
          <Button type="submit" variant="primary" disabled={createRole.isPending}>
            저장
          </Button>
        </div>
      </form>
    </Modal>
  )
}
