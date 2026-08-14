import type { Control } from 'react-hook-form'
import { FormInput } from '@/components/common/form/FormInput'
import type { DbBackupSearchFormValues } from './dbBackupSearchSchema'

interface DbBackupSearchProps {
  control: Control<DbBackupSearchFormValues>
}

export function DbBackupSearch({ control }: DbBackupSearchProps) {
  return (
    <FormInput
      name="keyword"
      control={control}
      label="백업명"
      placeholder="백업명 검색"
      className="w-64"
    />
  )
}
