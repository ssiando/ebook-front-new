import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Modal } from '@/components/common/ui/Modal'
import { Button } from '@/components/common/ui/Button'
import { FormInput } from '@/components/common/form/FormInput'
import { useCreateBatchMutation, useUpdateBatchMutation } from '@/query/batch-query'
import { defineFormRules, showFormErrors, validateForm } from '@/utils/formUtils'
import type { Batch } from '@/types/batch'

const batchFormRules = defineFormRules({
  batchCode: { type: 'string', required: true, maxLength: 50, label: '배치 코드' },
  batchName: { type: 'string', required: true, maxLength: 100, label: '배치명' },
  schedule: { type: 'string', maxLength: 100, label: '정기배치 시간' },
  description: { type: 'string', maxLength: 255, label: '설명' },
  requiresPath: { type: 'boolean', label: '실행 시 경로 입력 필요' },
})

const batchFormSchema = validateForm(batchFormRules)

const EMPTY_VALUES = {
  batchCode: '',
  batchName: '',
  schedule: '',
  description: '',
  requiresPath: false,
}

interface BatchFormModalProps {
  open: boolean
  /** null이면 신규 등록, 값이 있으면 해당 배치를 수정합니다 (배치 코드는 등록 후 변경 불가). */
  batch: Batch | null
  onClose: () => void
}

export function BatchFormModal({ open, batch, onClose }: BatchFormModalProps) {
  const isEdit = batch !== null
  const createBatch = useCreateBatchMutation()
  const updateBatch = useUpdateBatchMutation()
  const submitting = createBatch.isPending || updateBatch.isPending

  const { control, handleSubmit, reset, watch, setValue } = useForm({
    resolver: zodResolver(batchFormSchema),
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    if (!open) return
    reset(
      batch
        ? {
            batchCode: batch.batchCode,
            batchName: batch.batchName,
            schedule: batch.schedule,
            description: batch.description,
            requiresPath: batch.requiresPath,
          }
        : EMPTY_VALUES,
    )
  }, [open, batch, reset])

  const onSubmit = handleSubmit(
    async (values) => {
      if (isEdit && batch) {
        await updateBatch.mutateAsync({
          id: batch.id,
          batchName: values.batchName,
          schedule: values.schedule,
          description: values.description,
          requiresPath: values.requiresPath,
        })
      } else {
        await createBatch.mutateAsync(values)
      }
      onClose()
    },
    (errors) => showFormErrors(errors, batchFormRules),
  )

  return (
    <Modal open={open} title={isEdit ? '배치 수정' : '배치 등록'} onClose={onClose}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
        <FormInput
          name="batchCode"
          control={control}
          label={batchFormRules.batchCode.label}
          disabled={isEdit}
          required
        />
        <FormInput
          name="batchName"
          control={control}
          label={batchFormRules.batchName.label}
          required
        />
        <FormInput
          name="schedule"
          control={control}
          label={batchFormRules.schedule.label}
          placeholder="예: 매일 06:10"
        />
        <FormInput name="description" control={control} label={batchFormRules.description.label} />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={watch('requiresPath')}
            onChange={(e) => setValue('requiresPath', e.target.checked)}
          />
          {batchFormRules.requiresPath.label}
        </label>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {isEdit ? '수정' : '등록'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
