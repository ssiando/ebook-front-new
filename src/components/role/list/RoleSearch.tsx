import type { Control } from 'react-hook-form'
import { FormInput } from '@/components/common/form/FormInput'
import { roleSearchRules } from './roleSearchSchema'

interface RoleSearchProps {
  control: Control<any, any, any>
}

export function RoleSearch({ control }: RoleSearchProps) {
  return (
    <FormInput
      name="keyword"
      control={control}
      label={roleSearchRules.keyword.label}
      placeholder="역할명을 입력해 주세요"
      className="w-64"
    />
  )
}
