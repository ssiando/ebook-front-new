import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Modal } from '@/components/common/ui/Modal'
import { Button } from '@/components/common/ui/Button'
import { FormInput } from '@/components/common/form/FormInput'
import { useCreateRoleMutation } from '@/query/role-query'
import { defineFormRules, showFormErrors, validateForm } from '@/utils/formUtils'

const createRoleRules = defineFormRules({
  roleName: { type: 'string', required: true, maxLength: 30, label: '역할명' },
  description: { type: 'string', maxLength: 100, label: '설명' },
})

const createRoleSchema = validateForm(createRoleRules)

type CreateRoleFormValues = z.infer<typeof createRoleSchema>

interface RoleCreateModalProps {
  open: boolean
  onClose: () => void
}

export function RoleCreateModal({ open, onClose }: RoleCreateModalProps) {
  const createRole = useCreateRoleMutation()
  const methods = useForm<CreateRoleFormValues>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: { roleName: '', description: '' },
  })

  const handleSubmit = methods.handleSubmit(
    async (values) => {
      await createRole.mutateAsync(values)
      methods.reset()
      onClose()
    },
    (errors) => showFormErrors(errors, createRoleRules),
  )

  return (
    <Modal open={open} title="역할 등록" onClose={onClose}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <FormInput name="roleName" label={createRoleRules.roleName.label} required />
          <FormInput name="description" label={createRoleRules.description.label} />
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" variant="primary" disabled={createRole.isPending}>
              저장
            </Button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  )
}
