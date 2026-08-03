import type { Control } from 'react-hook-form'
import { FormInput } from '@/components/common/form/FormInput'
import type { AdminRoleSearchFormValues } from './adminRoleSearchSchema'

interface AdminRoleSearchProps {
  control: Control<AdminRoleSearchFormValues>
}

export function AdminRoleSearch({ control }: AdminRoleSearchProps) {
  return (
    <FormInput
      name="keyword"
      control={control}
      label="이름·이메일"
      placeholder="이름 또는 이메일을 입력해주세요"
      className="w-64"
    />
  )
}
