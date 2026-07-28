import { FormInput } from '@/components/common/form/FormInput'
import { roleSearchRules } from './roleSearchSchema'

export function RoleSearch() {
  return (
    <FormInput
      name="keyword"
      label={roleSearchRules.keyword.label}
      placeholder="역할명을 입력해 주세요"
      className="w-64"
    />
  )
}
