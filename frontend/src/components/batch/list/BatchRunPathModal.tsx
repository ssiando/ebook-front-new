import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Modal } from '@/components/common/ui/Modal'
import { Button } from '@/components/common/ui/Button'
import { FormInput } from '@/components/common/form/FormInput'
import { defineFormRules, showFormErrors, validateForm } from '@/utils/formUtils'

const runPathRules = defineFormRules({
  targetPath: { type: 'string', required: true, maxLength: 255, label: '저장 경로' },
})

const runPathSchema = validateForm(runPathRules)

interface BatchRunPathModalProps {
  open: boolean
  submitting: boolean
  onClose: () => void
  onConfirm: (targetPath: string) => void
}

export function BatchRunPathModal({
  open,
  submitting,
  onClose,
  onConfirm,
}: BatchRunPathModalProps) {
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(runPathSchema),
    defaultValues: { targetPath: '' },
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = handleSubmit(
    (values) => onConfirm(values.targetPath),
    (errors) => showFormErrors(errors, runPathRules),
  )

  return (
    <Modal open={open} title="DB 백업 실행" onClose={handleClose}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
        <p className="text-sm text-gray-500">백업 파일(.sql)을 저장할 폴더 경로를 입력해 주세요.</p>
        <FormInput
          name="targetPath"
          control={control}
          label={runPathRules.targetPath.label}
          placeholder="C:\backup\ebook"
          required
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            취소
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? '백업 중...' : '실행'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
