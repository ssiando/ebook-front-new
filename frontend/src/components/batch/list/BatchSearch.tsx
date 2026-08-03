import type { Control } from 'react-hook-form'
import { FormInput } from '@/components/common/form/FormInput'
import type { BatchSearchFormValues } from './batchSearchSchema'

interface BatchSearchProps {
  control: Control<BatchSearchFormValues>
}

export function BatchSearch({ control }: BatchSearchProps) {
  return (
    <FormInput
      name="keyword"
      control={control}
      label="배치명"
      placeholder="배치명 검색"
      className="w-64"
    />
  )
}
