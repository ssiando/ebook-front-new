import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type Control } from 'react-hook-form'
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
  // FormInput/FormSelect는 여러 폼에서 재사용하는 공용 컴포넌트라 Control<any, any, any>를 받는데,
  // react-hook-form의 Control<T>는 내부 validate 함수 프로퍼티가 반공변이라 구체 타입 → any 캐스팅이
  // 자동으로 되지 않는다. 호출부에서 한 번만 캐스팅해서 재사용한다.
  const control = methods.control as Control<any, any, any>

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
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
        <FormInput name="label" control={control} label={createMenuRules.label.label} required />
        <FormInput
          name="parentLabel"
          control={control}
          label={createMenuRules.parentLabel.label}
          placeholder="-"
        />
        <FormInput
          name="path"
          control={control}
          label={createMenuRules.path.label}
          placeholder="/example"
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" variant="primary" disabled={createMenu.isPending}>
            저장
          </Button>
        </div>
      </form>
    </Modal>
  )
}
