import type { Control } from 'react-hook-form'
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { SYSTEMS } from '@/types/role'
import type { ProgramSearchFormValues } from './programSearchSchema'

interface ProgramSearchProps {
  control: Control<ProgramSearchFormValues>
}

export function ProgramSearch({ control }: ProgramSearchProps) {
  return (
    <>
      <FormSelect
        name="system"
        control={control}
        label="시스템"
        required
        className="w-32"
        options={SYSTEMS.map((system) => ({ label: system, value: system }))}
      />
      <FormInput
        name="keyword"
        control={control}
        label="프로그램명"
        placeholder="프로그램명 (부분 일치)"
        className="w-56"
      />
      <FormSelect
        name="type"
        control={control}
        label="타입"
        className="w-28"
        options={[
          { label: '전체', value: 'ALL' },
          { label: 'API', value: 'API' },
          { label: 'PAGE', value: 'PAGE' },
        ]}
      />
      <FormSelect
        name="useYn"
        control={control}
        label="사용여부"
        className="w-28"
        options={[
          { label: '전체', value: 'ALL' },
          { label: 'Y', value: 'Y' },
          { label: 'N', value: 'N' },
        ]}
      />
    </>
  )
}
