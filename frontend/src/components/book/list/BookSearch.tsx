import type { Control } from 'react-hook-form'
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { BOOK_TYPES } from '@/types/book'
import type { BookSearchFormValues } from './bookSearchSchema'

const BOOK_TYPE_LABELS: Record<(typeof BOOK_TYPES)[number], string> = {
  EBOOK: '전자책',
  PAPER: '종이책',
  BOTH: '전자책+종이책',
}

interface BookSearchProps {
  control: Control<BookSearchFormValues>
}

export function BookSearch({ control }: BookSearchProps) {
  return (
    <>
      <FormInput
        name="keyword"
        control={control}
        label="검색어"
        placeholder="도서명, 발행자, 판권소유자 검색"
        className="w-64"
      />
      <FormSelect
        name="bookType"
        control={control}
        label="구분"
        className="w-40"
        options={[
          { label: '전체', value: 'ALL' },
          ...BOOK_TYPES.map((type) => ({ label: BOOK_TYPE_LABELS[type], value: type })),
        ]}
      />
      <FormSelect
        name="activeYn"
        control={control}
        label="상태"
        className="w-28"
        options={[
          { label: '전체', value: 'ALL' },
          { label: '활성', value: 'true' },
          { label: '비활성', value: 'false' },
        ]}
      />
    </>
  )
}
