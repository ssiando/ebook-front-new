import { useTranslation } from 'react-i18next'
import { FormInput } from '@/components/common/form/FormInput'

export function UserSearch() {
  const { t } = useTranslation('user')

  return (
    <>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">{t('updatedAt')}</label>
        <div className="flex items-center gap-2">
          <FormInput name="updatedFrom" type="date" />
          <span className="text-gray-400">~</span>
          <FormInput name="updatedTo" type="date" />
        </div>
      </div>
      <FormInput
        name="keyword"
        label={t('keyword')}
        placeholder={t('keywordPlaceholder')}
        className="w-64"
      />
    </>
  )
}
