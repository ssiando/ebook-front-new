import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Modal } from '@/components/common/ui/Modal'
import { Button } from '@/components/common/ui/Button'
import { FormInput } from '@/components/common/form/FormInput'
import { useCreateCodeItemMutation } from '@/query/common-code-query'
import { defineFormRules, showFormErrors, validateForm } from '@/utils/formUtils'

const createCodeItemRules = defineFormRules({
  code: { type: 'string', required: true, maxLength: 50, label: '코드' },
  codeName: { type: 'string', required: true, maxLength: 100, label: '코드명' },
  sortOrder: { type: 'number', min: 0, label: '정렬' },
  useYn: { type: 'boolean', label: '사용 여부' },
  description: { type: 'string', maxLength: 255, label: '설명' },
  metadata: { type: 'string', maxLength: 255, label: 'metadata(JSON)' },
  i18nKey: { type: 'string', maxLength: 100, label: 'i18n 키' },
})

const createCodeItemSchema = validateForm(createCodeItemRules)

interface CodeItemCreateModalProps {
  open: boolean
  groupId: string
  onClose: () => void
}

export function CodeItemCreateModal({ open, groupId, onClose }: CodeItemCreateModalProps) {
  const createCodeItem = useCreateCodeItemMutation(groupId)

  const { control, handleSubmit, reset, watch, setValue } = useForm({
    resolver: zodResolver(createCodeItemSchema),
    defaultValues: {
      code: '',
      codeName: '',
      sortOrder: 0,
      useYn: true,
      description: '',
      metadata: '',
      i18nKey: '',
    },
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = handleSubmit(
    async (values) => {
      await createCodeItem.mutateAsync({ groupId, ...values })
      handleClose()
    },
    (errors) => showFormErrors(errors, createCodeItemRules),
  )

  return (
    <Modal open={open} title="코드 항목 등록" onClose={handleClose}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
        <FormInput name="code" control={control} label={createCodeItemRules.code.label} required />
        <FormInput name="codeName" control={control} label={createCodeItemRules.codeName.label} required />
        <FormInput
          name="sortOrder"
          control={control}
          type="number"
          label={createCodeItemRules.sortOrder.label}
        />
        <FormInput name="description" control={control} label={createCodeItemRules.description.label} />
        <FormInput name="metadata" control={control} label={createCodeItemRules.metadata.label} />
        <FormInput name="i18nKey" control={control} label={createCodeItemRules.i18nKey.label} />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={watch('useYn')}
            onChange={(e) => setValue('useYn', e.target.checked)}
          />
          {createCodeItemRules.useYn.label}
        </label>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            취소
          </Button>
          <Button type="submit" variant="primary" disabled={createCodeItem.isPending}>
            저장
          </Button>
        </div>
      </form>
    </Modal>
  )
}
