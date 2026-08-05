import { useTranslation } from 'react-i18next'
import type { Control } from 'react-hook-form'
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { useCodeItemsByGroupCodeQuery } from '@/query/common-code-query'
import { ADMIN_DEPARTMENTS, ADMIN_STATUS_GROUP_CODE, type AdminSearchParams } from '@/types/admin'

interface AdminSearchProps {
  control: Control<AdminSearchParams>
}

export function AdminSearch({ control }: AdminSearchProps) {
  const { t } = useTranslation('admin')
  const statusCodesQuery = useCodeItemsByGroupCodeQuery(ADMIN_STATUS_GROUP_CODE)
  const statusCodes = statusCodesQuery.data ?? []

  return (
    <>
      <FormInput
        name="keyword"
        control={control}
        label={t('keyword')}
        placeholder={t('keywordPlaceholder')}
        className="w-64"
      />
      <FormSelect
        name="department"
        control={control}
        label={t('department')}
        className="w-36"
        options={[
          { label: '전체', value: 'ALL' },
          ...ADMIN_DEPARTMENTS.map((department) => ({ label: department, value: department })),
        ]}
      />
      <FormSelect
        name="status"
        control={control}
        label={t('columns.status')}
        className="w-28"
        options={[
          { label: '전체', value: 'ALL' },
          ...statusCodes.map((code) => ({ label: code.codeName, value: code.code })),
        ]}
      />
    </>
  )
}
