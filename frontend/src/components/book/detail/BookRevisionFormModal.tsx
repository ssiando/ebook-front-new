import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Modal } from '@/components/common/ui/Modal'
import { Button } from '@/components/common/ui/Button'
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import {
  useCreateBookRevisionMutation,
  useUpdateBookRevisionMutation,
} from '@/query/book-revision-query'
import { showFormErrors } from '@/utils/formUtils'
import {
  ENCRYPT_STATUSES,
  PUBLISH_STATUSES,
  type BookRevision,
  type EncryptStatus,
  type PublishStatus,
} from '@/types/bookRevision'

const PUBLISH_STATUS_LABELS: Record<PublishStatus, string> = {
  DRAFT: '작성중',
  REVIEWING: '검토중',
  PUBLISHED: '출판됨',
  REJECTED: '반려',
}

const ENCRYPT_STATUS_LABELS: Record<EncryptStatus, string> = {
  0: '미진행',
  1: '암호화요청',
  2: '암호화완료',
}

// revisionNo는 등록 후 변경 불가(book_id+revision_no 유니크 제약)라 defineFormRules 표준 규칙과
// 별개로 등록/수정 스키마를 분리해야 한다 — 패턴 B(z.object 직접 작성) 사용.
const revisionFormSchema = z.object({
  revisionNo: z.string().min(1, '버전 번호를 입력해 주세요'),
  publishedYn: z.boolean(),
  publishStatusCd: z.enum(PUBLISH_STATUSES),
  fileName: z.string().min(1, '파일명을 입력해 주세요').max(255, '파일명은 최대 255자까지 입력 가능합니다'),
  filePath: z.string().min(1, '파일 경로를 입력해 주세요').max(1000, '파일 경로가 너무 깁니다'),
  encryptStatusCd: z.enum(['0', '1', '2']),
})

type RevisionFormValues = z.infer<typeof revisionFormSchema>

const revisionFormLabels = {
  revisionNo: { type: 'string' as const, label: '버전 번호' },
  fileName: { type: 'string' as const, label: '파일명' },
  filePath: { type: 'string' as const, label: '파일 경로' },
}

function defaultValues(nextRevisionNo: number): RevisionFormValues {
  return {
    revisionNo: String(nextRevisionNo),
    publishedYn: false,
    publishStatusCd: 'DRAFT',
    fileName: '',
    filePath: '',
    encryptStatusCd: '0',
  }
}

interface BookRevisionFormModalProps {
  open: boolean
  bookId: string
  /** null이면 신규 등록, 값이 있으면 해당 버전을 수정합니다. */
  revision: BookRevision | null
  /** 등록 모달을 열 때 기본으로 제안할 다음 버전 번호. */
  nextRevisionNo: number
  onClose: () => void
}

export function BookRevisionFormModal({
  open,
  bookId,
  revision,
  nextRevisionNo,
  onClose,
}: BookRevisionFormModalProps) {
  const isEdit = revision !== null
  const createRevision = useCreateBookRevisionMutation(bookId)
  const updateRevision = useUpdateBookRevisionMutation(bookId)
  const submitting = createRevision.isPending || updateRevision.isPending

  const { control, handleSubmit, reset, watch, setValue } = useForm<RevisionFormValues>({
    resolver: zodResolver(revisionFormSchema),
    defaultValues: defaultValues(nextRevisionNo),
  })

  useEffect(() => {
    if (!open) return
    reset(
      revision
        ? {
            revisionNo: String(revision.revisionNo),
            publishedYn: revision.publishedYn,
            publishStatusCd: revision.publishStatusCd,
            fileName: revision.fileName,
            filePath: revision.filePath,
            encryptStatusCd: String(revision.encryptStatusCd) as '0' | '1' | '2',
          }
        : defaultValues(nextRevisionNo),
    )
  }, [open, revision, nextRevisionNo, reset])

  const onSubmit = handleSubmit(
    async (values) => {
      const shared = {
        publishedYn: values.publishedYn,
        publishStatusCd: values.publishStatusCd,
        fileName: values.fileName,
        filePath: values.filePath,
        encryptStatusCd: Number(values.encryptStatusCd) as EncryptStatus,
      }

      if (isEdit && revision) {
        await updateRevision.mutateAsync({ id: revision.id, bookId, ...shared })
      } else {
        await createRevision.mutateAsync({ revisionNo: Number(values.revisionNo), ...shared })
      }
      onClose()
    },
    (errors) => showFormErrors(errors, revisionFormLabels),
  )

  return (
    <Modal open={open} title={isEdit ? '도서 버전 수정' : '도서 버전 등록'} onClose={onClose}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
        <FormInput
          name="revisionNo"
          control={control}
          label={revisionFormLabels.revisionNo.label}
          type="number"
          min={1}
          disabled={isEdit}
          required
        />
        <FormInput name="fileName" control={control} label={revisionFormLabels.fileName.label} required />
        <FormInput name="filePath" control={control} label={revisionFormLabels.filePath.label} required />
        <FormSelect
          name="publishStatusCd"
          control={control}
          label="출판 상태"
          options={PUBLISH_STATUSES.map((status) => ({
            label: PUBLISH_STATUS_LABELS[status],
            value: status,
          }))}
        />
        <FormSelect
          name="encryptStatusCd"
          control={control}
          label="암호화 상태"
          options={ENCRYPT_STATUSES.map((status) => ({
            label: ENCRYPT_STATUS_LABELS[status],
            value: String(status),
          }))}
        />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={watch('publishedYn')}
            onChange={(e) => setValue('publishedYn', e.target.checked)}
          />
          게시함
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
