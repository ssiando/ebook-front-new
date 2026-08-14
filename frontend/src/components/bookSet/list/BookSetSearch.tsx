import type { Control } from 'react-hook-form'
import { FormInput } from '@/components/common/form/FormInput'
import type { BookSetSearchFormValues } from './bookSetSearchSchema'

interface BookSetSearchProps {
  control: Control<BookSetSearchFormValues>
}

export function BookSetSearch({ control }: BookSetSearchProps) {
  return (
    <FormInput
      name="keyword"
      control={control}
      label="세트명"
      placeholder="세트명 또는 설명 검색"
      className="w-64"
    />
  )
}
