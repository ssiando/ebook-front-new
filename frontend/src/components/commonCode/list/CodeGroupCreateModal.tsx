import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Modal } from '@/components/common/ui/Modal'
import { Button } from '@/components/common/ui/Button'
import { FormInput } from '@/components/common/form/FormInput'
import { useCreateCodeGroupMutation } from '@/query/common-code-query'
import { defineFormRules, showFormErrors, validateForm } from '@/utils/formUtils'

const createCodeGroupRules = defineFormRules({
  groupCode: { type: 'string', required: true, maxLength: 50, label: '그룹 코드' },
  groupName: { type: 'string', required: true, maxLength: 100, label: '그룹명' },
  description: { type: 'string', maxLength: 255, label: '설명' },
  useYn: { type: 'boolean', label: '사용 여부' },
  i18nKey: { type: 'string', maxLength: 100, label: 'i18n 키' },
})

const createCodeGroupSchema = validateForm(createCodeGroupRules)

interface CodeGroupCreateModalProps {
  open: boolean
  onClose: () => void
}

export function CodeGroupCreateModal({ open, onClose }: CodeGroupCreateModalProps) {
  const createCodeGroup = useCreateCodeGroupMutation()

  const { control, handleSubmit, reset, watch, setValue } = useForm({
    resolver: zodResolver(createCodeGroupSchema),
    defaultValues: { groupCode: '', groupName: '', description: '', useYn: true, i18nKey: '' },
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = handleSubmit(
    async (values) => {
      await createCodeGroup.mutateAsync(values)
      handleClose()
    },
    (errors) => showFormErrors(errors, createCodeGroupRules),
  )

  return (
    <Modal open={open} title="코드 그룹 등록" onClose={handleClose}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
        <FormInput
          name="groupCode"
          control={control}
          label={createCodeGroupRules.groupCode.label}
          required
        />
        <FormInput
          name="groupName"
          control={control}
          label={createCodeGroupRules.groupName.label}
          required
        />
        <FormInput name="description" control={control} label={createCodeGroupRules.description.label} />
        <FormInput name="i18nKey" control={control} label={createCodeGroupRules.i18nKey.label} />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={watch('useYn')}
            onChange={(e) => setValue('useYn', e.target.checked)}
          />
          {createCodeGroupRules.useYn.label}
        </label>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            취소
          </Button>
          <Button type="submit" variant="primary" disabled={createCodeGroup.isPending}>
            저장
          </Button>
        </div>
      </form>
    </Modal>
  )
}
