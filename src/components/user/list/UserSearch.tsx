import { useTranslation } from 'react-i18next'
import type { Control } from 'react-hook-form'
import { FormInput } from '@/components/common/form/FormInput'

interface UserSearchProps {
  control: Control<any, any, any>
}

export function UserSearch({ control }: UserSearchProps) {
  const { t } = useTranslation('user')

  return (
    <>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">{t('updatedAt')}</label>
        <div className="flex items-center gap-2">
          <FormInput name="updatedFrom" control={control} type="date" />
          <span className="text-gray-400">~</span>
          <FormInput name="updatedTo" control={control} type="date" />
        </div>
      </div>
      <FormInput
        name="keyword"
        control={control}
        label={t('keyword')}
        placeholder={t('keywordPlaceholder')}
        className="w-64"
      />
    </>
  )
}
