import type { ReactNode } from 'react'
import type { Control, FieldValues, UseFormReset } from 'react-hook-form'
import { RotateCcw } from 'lucide-react'
import { SearchButton } from '@/components/common/ui/SearchButton'
import { useTranslation } from 'react-i18next'

// 실제 사내 프로젝트에서는 @vanta/common 의 PageSearch를 사용합니다.
// 이 저장소에는 해당 패키지가 없어 동일한 역할을 하는 로컬 구현을 둡니다.
interface PageSearchProps<TFieldValues extends FieldValues = FieldValues> {
  children: ReactNode
  /** useForm().control. 넘기면 초기화 버튼 클릭 시 control이 들고 있는 reset/기본값으로 기본 리셋 동작이 적용됩니다. */
  control?: Control<TFieldValues>
  /** control 대신(또는 함께) 직접 지정하고 싶을 때 사용합니다. 지정 시 control에서 얻은 값보다 우선합니다. */
  reset?: UseFormReset<TFieldValues>
  /** control 대신(또는 함께) 직접 지정하고 싶을 때 사용합니다. 지정 시 control에서 얻은 값보다 우선합니다. */
  defaultValues?: TFieldValues | (() => TFieldValues)
  /**
   * 초기화 버튼 클릭 시 호출됩니다. 생략하면 control(또는 reset/defaultValues)과 onApply로 구성된 기본 동작이 실행됩니다.
   * 기본 동작에 추가 로직이 필요하면 직접 정의하되, 인자로 전달되는 defaultReset을 호출해 기본 동작을 그대로 재사용할 수 있습니다.
   */
  onReset?: (defaultReset: () => void) => void
  /** 조회 버튼을 초기화 버튼 옆에 함께 표시하고 싶을 때 전달합니다 (생략 시 조회 버튼 미표시). */
  onSearch?: () => void
  searchLabel?: string
}

export function PageSearch<TFieldValues extends FieldValues = FieldValues>({
  children,
  control,
  reset,
  defaultValues,
  onReset,
  onSearch,
  searchLabel,
}: PageSearchProps<TFieldValues>) {
  const { t } = useTranslation('common')

  const handleDefaultReset = () => {
    const resolvedReset = reset ?? control?._reset
    const resolvedDefaultValues =
      defaultValues ?? (control?._defaultValues as TFieldValues | undefined)
    if (!resolvedReset || !resolvedDefaultValues) return

    const defaults =
      typeof resolvedDefaultValues === 'function'
        ? (resolvedDefaultValues as () => TFieldValues)()
        : resolvedDefaultValues
    resolvedReset(defaults)
  }

  const handleReset = () => {
    if (onReset) {
      onReset(handleDefaultReset)
    } else {
      handleDefaultReset()
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-4 rounded border border-gray-200 bg-white p-4">
      {children}
      <div className="mb-0.5 ml-auto flex shrink-0 items-center gap-2">
        {onSearch && (
          <SearchButton onClick={onSearch}>{searchLabel ?? t('button.search')}</SearchButton>
        )}
        <button
          type="button"
          onClick={handleReset}
          aria-label="초기화"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-gray-300 text-gray-500 hover:bg-gray-50"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  )
}
