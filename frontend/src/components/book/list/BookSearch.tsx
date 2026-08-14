import type { Control } from 'react-hook-form'
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { BOOK_CATEGORIES, BOOK_STATUSES } from '@/types/book'
import type { BookSearchFormValues } from './bookSearchSchema'

const STATUS_LABELS: Record<(typeof BOOK_STATUSES)[number], string> = {
  ON_SALE: '판매중',
  OUT_OF_STOCK: '품절',
  DISCONTINUED: '절판',
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
        placeholder="도서명 또는 저자 검색"
        className="w-64"
      />
      <FormSelect
        name="category"
        control={control}
        label="카테고리"
        className="w-36"
        options={[
          { label: '전체', value: 'ALL' },
          ...BOOK_CATEGORIES.map((category) => ({ label: category, value: category })),
        ]}
      />
      <FormSelect
        name="status"
        control={control}
        label="상태"
        className="w-32"
        options={[
          { label: '전체', value: 'ALL' },
          ...BOOK_STATUSES.map((status) => ({ label: STATUS_LABELS[status], value: status })),
        ]}
      />
    </>
  )
}
