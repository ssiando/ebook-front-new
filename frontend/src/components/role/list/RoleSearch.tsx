import type { Control } from 'react-hook-form'
import { FormInput } from '@/components/common/form/FormInput'
import type { RoleSearchParams } from '@/types/role'

interface RoleSearchProps {
  control: Control<RoleSearchParams>
}

export function RoleSearch({ control }: RoleSearchProps) {
  return (
    <FormInput
      name="keyword"
      control={control}
      label="역할명·설명"
      placeholder="역할명 또는 설명을 입력해 주세요"
      className="w-64"
    />
  )
}
