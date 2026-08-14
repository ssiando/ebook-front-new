import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Modal } from '@/components/common/ui/Modal'
import { Button } from '@/components/common/ui/Button'
import { FormInput } from '@/components/common/form/FormInput'
import { useCreateBookSetMutation, useUpdateBookSetMutation } from '@/query/book-set-query'
import { defineFormRules, showFormErrors, validateForm } from '@/utils/formUtils'
import type { BookSet } from '@/types/bookSet'

const bookSetFormRules = defineFormRules({
  setName: { type: 'string', required: true, maxLength: 200, label: '세트명' },
  description: { type: 'string', maxLength: 500, label: '설명' },
})

const bookSetFormSchema = validateForm(bookSetFormRules)

const EMPTY_VALUES = { setName: '', description: '' }

interface BookSetFormModalProps {
  open: boolean
  /** null이면 신규 등록, 값이 있으면 해당 세트를 수정합니다. */
  bookSet: BookSet | null
  onClose: () => void
}

export function BookSetFormModal({ open, bookSet, onClose }: BookSetFormModalProps) {
  const isEdit = bookSet !== null
  const createBookSet = useCreateBookSetMutation()
  const updateBookSet = useUpdateBookSetMutation()
  const submitting = createBookSet.isPending || updateBookSet.isPending
  const [activeYn, setActiveYn] = useState(true)

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(bookSetFormSchema),
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    if (!open) return
    reset(
      bookSet
        ? { setName: bookSet.setName, description: bookSet.description ?? '' }
        : EMPTY_VALUES,
    )
    setActiveYn(bookSet?.activeYn ?? true)
  }, [open, bookSet, reset])

  const onSubmit = handleSubmit(
    async (values) => {
      if (isEdit && bookSet) {
        await updateBookSet.mutateAsync({
          id: bookSet.id,
          setName: values.setName,
          description: values.description || undefined,
          activeYn,
        })
      } else {
        await createBookSet.mutateAsync({
          setName: values.setName,
          description: values.description || undefined,
        })
      }
      onClose()
    },
    (errors) => showFormErrors(errors, bookSetFormRules),
  )

  return (
    <Modal open={open} title={isEdit ? '도서 세트 수정' : '도서 세트 등록'} onClose={onClose}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
        <FormInput
          name="setName"
          control={control}
          label={bookSetFormRules.setName.label}
          required
        />
        <FormInput name="description" control={control} label={bookSetFormRules.description.label} />
        {isEdit && (
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={activeYn}
              onChange={(e) => setActiveYn(e.target.checked)}
            />
            활성
          </label>
        )}
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
