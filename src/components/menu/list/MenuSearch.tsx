import { FormInput } from '@/components/common/form/FormInput'
import { menuSearchRules } from './menuSearchSchema'

export function MenuSearch() {
  return (
    <FormInput
      name="keyword"
      label={menuSearchRules.keyword.label}
      placeholder="메뉴명을 입력해 주세요"
      className="w-64"
    />
  )
}
