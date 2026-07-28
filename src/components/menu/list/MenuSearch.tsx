import type { Control } from 'react-hook-form'
import { FormInput } from '@/components/common/form/FormInput'
import { menuSearchRules } from './menuSearchSchema'

interface MenuSearchProps {
  control: Control<any, any, any>
}

export function MenuSearch({ control }: MenuSearchProps) {
  return (
    <FormInput
      name="keyword"
      control={control}
      label={menuSearchRules.keyword.label}
      placeholder="메뉴명을 입력해 주세요"
      className="w-64"
    />
  )
}
