import type { Control } from 'react-hook-form'
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import type { CommonCodeSearchParams } from '@/types/commonCode'

interface CommonCodeSearchProps {
  control: Control<CommonCodeSearchParams>
}

export function CommonCodeSearch({ control }: CommonCodeSearchProps) {
  return (
    <>
      <FormInput
        name="keyword"
        control={control}
        label="그룹 코드·명"
        placeholder="그룹 코드 또는 그룹명을 입력해 주세요"
        className="w-64"
      />
      <FormSelect
        name="useYn"
        control={control}
        label="사용 여부"
        options={[
          { label: '전체', value: 'ALL' },
          { label: '사용', value: 'Y' },
          { label: '미사용', value: 'N' },
        ]}
        className="w-32"
      />
    </>
  )
}
