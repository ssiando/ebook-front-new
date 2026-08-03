import type { Control } from 'react-hook-form'
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { SYSTEMS } from '@/types/role'
import type { RoleSearchFormValues } from './roleSearchSchema'

interface RoleSearchProps {
  control: Control<RoleSearchFormValues>
}

export function RoleSearch({ control }: RoleSearchProps) {
  return (
    <>
      <FormSelect
        name="system"
        control={control}
        label="시스템"
        className="w-32"
        options={[
          { label: '전체', value: 'ALL' },
          ...SYSTEMS.map((system) => ({ label: system, value: system })),
        ]}
      />
      <FormInput
        name="keyword"
        control={control}
        label="역할명·설명"
        placeholder="역할명 또는 설명을 입력해 주세요"
        className="w-64"
      />
    </>
  )
}
