import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Modal } from '@/components/common/ui/Modal'
import { Button } from '@/components/common/ui/Button'
import { FormInput } from '@/components/common/form/FormInput'
import { useCreateMenuMutation } from '@/query/menu-admin-query'
import { defineFormRules, showFormErrors, validateForm } from '@/utils/formUtils'

const createMenuRules = defineFormRules({
  label: { type: 'string', required: true, label: '메뉴명' },
  parentLabel: { type: 'string', label: '상위메뉴' },
  path: { type: 'string', label: '경로' },
})

const createMenuSchema = validateForm(createMenuRules)

type CreateMenuFormValues = z.infer<typeof createMenuSchema>

interface MenuCreateModalProps {
  open: boolean
  onClose: () => void
}

export function MenuCreateModal({ open, onClose }: MenuCreateModalProps) {
  const createMenu = useCreateMenuMutation()
  const methods = useForm<CreateMenuFormValues>({
    resolver: zodResolver(createMenuSchema),
    defaultValues: { label: '', parentLabel: '-', path: '' },
  })

  const handleSubmit = methods.handleSubmit(
    async (values) => {
      await createMenu.mutateAsync(values)
      methods.reset()
      onClose()
    },
    (errors) => showFormErrors(errors, createMenuRules),
  )

  return (
    <Modal open={open} title="메뉴 등록" onClose={onClose}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <FormInput name="label" label={createMenuRules.label.label} required />
          <FormInput name="parentLabel" label={createMenuRules.parentLabel.label} placeholder="-" />
          <FormInput name="path" label={createMenuRules.path.label} placeholder="/example" />
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" variant="primary" disabled={createMenu.isPending}>
              저장
            </Button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  )
}
