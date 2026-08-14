import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Modal } from '@/components/common/ui/Modal'
import { Button } from '@/components/common/ui/Button'
import { FormInput } from '@/components/common/form/FormInput'
import { useUpdateDbBackupMutation } from '@/query/db-backup-query'
import { defineFormRules, showFormErrors, validateForm } from '@/utils/formUtils'
import type { DbBackup } from '@/types/dbBackup'

const renameRules = defineFormRules({
  backupName: { type: 'string', required: true, maxLength: 200, label: '백업명' },
})

const renameSchema = validateForm(renameRules)

interface DbBackupRenameModalProps {
  open: boolean
  target: DbBackup | null
  onClose: () => void
}

export function DbBackupRenameModal({ open, target, onClose }: DbBackupRenameModalProps) {
  const updateDbBackup = useUpdateDbBackupMutation()

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(renameSchema),
    defaultValues: { backupName: '' },
  })

  useEffect(() => {
    if (!open) return
    reset({ backupName: target?.backupName ?? '' })
  }, [open, target, reset])

  const onSubmit = handleSubmit(
    async (values) => {
      if (!target) return
      await updateDbBackup.mutateAsync({ id: target.id, backupName: values.backupName })
      onClose()
    },
    (errors) => showFormErrors(errors, renameRules),
  )

  return (
    <Modal open={open} title="백업명 수정" onClose={onClose}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
        <FormInput
          name="backupName"
          control={control}
          label={renameRules.backupName.label}
          required
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" variant="primary" disabled={updateDbBackup.isPending}>
            수정
          </Button>
        </div>
      </form>
    </Modal>
  )
}
