import { useEffect, type ChangeEvent } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Modal } from '@/components/common/ui/Modal'
import { Button } from '@/components/common/ui/Button'
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import {
  useCreateBookMutation,
  useUpdateBookMutation,
  useUploadBookFileMutation,
} from '@/query/book-query'
import { showFormErrors } from '@/utils/formUtils'
import { useToastStore } from '@/store/useToastStore'
import { BOOK_TYPES, type Book, type BookType } from '@/types/book'

// bookType이 enum select이고, 등록/수정 payload 변환(빈 문자열 -> undefined, 문자열 -> 숫자)이 필요해
// defineFormRules 표준 규칙 모양을 벗어난다 — 패턴 B(z.object 직접 작성) 사용.
const bookFormSchema = z.object({
  title: z.string().min(1, '제목을 입력해 주세요').max(300, '제목은 최대 300자까지 입력 가능합니다'),
  subtitle: z.string().max(500, '부제는 최대 500자까지 입력 가능합니다'),
  bookType: z.enum(BOOK_TYPES),
  pageCount: z.string(),
  copyrightOwner: z.string().max(200, '판권소유자는 최대 200자까지 입력 가능합니다'),
  firstPublishDt: z.string(),
  publisher: z.string().max(200, '발행자는 최대 200자까지 입력 가능합니다'),
  isbn: z.string().max(20, 'ISBN은 최대 20자까지 입력 가능합니다'),
  freeYn: z.boolean(),
  coverImageUrl: z.string().max(1000, '커버 이미지 URL이 너무 깁니다'),
  thumbnailUrl: z.string().max(1000, '썸네일 URL이 너무 깁니다'),
  activeYn: z.boolean(),
})

type BookFormValues = z.infer<typeof bookFormSchema>

// showFormErrors 토스트에 라벨을 붙이기 위한 최소 규칙 (검증 자체는 위 zod 스키마가 담당).
const bookFormLabels = {
  title: { type: 'string' as const, label: '제목' },
  subtitle: { type: 'string' as const, label: '부제' },
  bookType: { type: 'string' as const, label: '구분' },
  pageCount: { type: 'string' as const, label: '페이지수' },
  copyrightOwner: { type: 'string' as const, label: '판권소유자' },
  firstPublishDt: { type: 'string' as const, label: '초판발행일' },
  publisher: { type: 'string' as const, label: '발행자' },
  isbn: { type: 'string' as const, label: 'ISBN' },
  coverImageUrl: { type: 'string' as const, label: '커버 이미지' },
  thumbnailUrl: { type: 'string' as const, label: '썸네일' },
}

const EMPTY_VALUES: BookFormValues = {
  title: '',
  subtitle: '',
  bookType: 'EBOOK',
  pageCount: '',
  copyrightOwner: '',
  firstPublishDt: '',
  publisher: '',
  isbn: '',
  freeYn: false,
  coverImageUrl: '',
  thumbnailUrl: '',
  activeYn: true,
}

const BOOK_TYPE_LABELS: Record<BookType, string> = {
  EBOOK: '전자책',
  PAPER: '종이책',
  BOTH: '전자책+종이책',
}

interface BookFormModalProps {
  open: boolean
  /** null이면 신규 등록, 값이 있으면 해당 도서를 수정합니다. */
  book: Book | null
  onClose: () => void
}

export function BookFormModal({ open, book, onClose }: BookFormModalProps) {
  const isEdit = book !== null
  const createBook = useCreateBookMutation()
  const updateBook = useUpdateBookMutation()
  const uploadFile = useUploadBookFileMutation()
  const submitting = createBook.isPending || updateBook.isPending || uploadFile.isPending

  const { control, handleSubmit, reset, watch, setValue } = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    if (!open) return
    reset(
      book
        ? {
            title: book.title,
            subtitle: book.subtitle ?? '',
            bookType: book.bookType,
            pageCount: book.pageCount ? String(book.pageCount) : '',
            copyrightOwner: book.copyrightOwner ?? '',
            firstPublishDt: book.firstPublishDt ?? '',
            publisher: book.publisher ?? '',
            isbn: book.isbn ?? '',
            freeYn: book.freeYn,
            coverImageUrl: book.coverImageUrl ?? '',
            thumbnailUrl: book.thumbnailUrl ?? '',
            activeYn: book.activeYn,
          }
        : EMPTY_VALUES,
    )
  }, [open, book, reset])

  const handleFileChange = async (
    e: ChangeEvent<HTMLInputElement>,
    field: 'coverImageUrl' | 'thumbnailUrl',
  ) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const url = await uploadFile.mutateAsync(file)
      setValue(field, url)
    } catch (error) {
      useToastStore
        .getState()
        .push(error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.')
    }
  }

  const onSubmit = handleSubmit(
    async (values) => {
      const payload = {
        title: values.title,
        subtitle: values.subtitle || undefined,
        bookType: values.bookType,
        pageCount: values.pageCount ? Number(values.pageCount) : undefined,
        copyrightOwner: values.copyrightOwner || undefined,
        firstPublishDt: values.firstPublishDt || undefined,
        publisher: values.publisher || undefined,
        isbn: values.isbn || undefined,
        freeYn: values.freeYn,
        coverImageUrl: values.coverImageUrl || undefined,
        thumbnailUrl: values.thumbnailUrl || undefined,
      }

      if (isEdit && book) {
        await updateBook.mutateAsync({ id: book.id, ...payload, activeYn: values.activeYn })
      } else {
        await createBook.mutateAsync(payload)
      }
      onClose()
    },
    (errors) => showFormErrors(errors, bookFormLabels),
  )

  return (
    <Modal open={open} title={isEdit ? '도서 수정' : '도서 등록'} onClose={onClose} size="lg">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            name="title"
            control={control}
            label={bookFormLabels.title.label}
            className="col-span-2"
            required
          />
          <FormInput
            name="subtitle"
            control={control}
            label={bookFormLabels.subtitle.label}
            className="col-span-2"
          />
          <FormSelect
            name="bookType"
            control={control}
            label={bookFormLabels.bookType.label}
            options={BOOK_TYPES.map((type) => ({ label: BOOK_TYPE_LABELS[type], value: type }))}
            required
          />
          <FormInput
            name="pageCount"
            control={control}
            label={bookFormLabels.pageCount.label}
            type="number"
            min={1}
          />
          <FormInput name="publisher" control={control} label={bookFormLabels.publisher.label} />
          <FormInput
            name="copyrightOwner"
            control={control}
            label={bookFormLabels.copyrightOwner.label}
          />
          <FormInput
            name="firstPublishDt"
            control={control}
            label={bookFormLabels.firstPublishDt.label}
            type="date"
          />
          <FormInput name="isbn" control={control} label={bookFormLabels.isbn.label} />

          <div className="col-span-2 grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-600">
                {bookFormLabels.coverImageUrl.label}
              </span>
              <div className="flex items-center gap-3">
                {watch('coverImageUrl') ? (
                  <img
                    src={watch('coverImageUrl')}
                    alt="커버 미리보기"
                    className="h-20 w-14 rounded border border-gray-200 object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-14 items-center justify-center rounded border border-dashed border-gray-300 text-[10px] text-gray-300">
                    없음
                  </div>
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={(e) => handleFileChange(e, 'coverImageUrl')}
                  className="text-xs"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-600">
                {bookFormLabels.thumbnailUrl.label}
              </span>
              <div className="flex items-center gap-3">
                {watch('thumbnailUrl') ? (
                  <img
                    src={watch('thumbnailUrl')}
                    alt="썸네일 미리보기"
                    className="h-20 w-14 rounded border border-gray-200 object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-14 items-center justify-center rounded border border-dashed border-gray-300 text-[10px] text-gray-300">
                    없음
                  </div>
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={(e) => handleFileChange(e, 'thumbnailUrl')}
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={watch('freeYn')}
              onChange={(e) => setValue('freeYn', e.target.checked)}
            />
            무료 도서
          </label>
          {isEdit && (
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={watch('activeYn')}
                onChange={(e) => setValue('activeYn', e.target.checked)}
              />
              활성
            </label>
          )}
        </div>

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
