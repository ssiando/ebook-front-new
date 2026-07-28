import type { SelectHTMLAttributes } from 'react'
import { useController, type Control } from 'react-hook-form'
import { clsx } from '@/utils/clsx'

interface Option {
  label: string
  value: string
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  name: string
  // 여러 폼에서 재사용하는 공용 컴포넌트라 특정 폼의 필드 타입에 묶이지 않도록 Control<any, any, any>를 사용합니다.
  control: Control<any, any, any>
  label?: string
  options: Option[]
}

export function FormSelect({
  name,
  control,
  label,
  options,
  className,
  ...props
}: FormSelectProps) {
  const { field } = useController({ name, control })

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={name} className="text-xs font-medium text-gray-600">
          {label}
          {props.required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <select
        id={name}
        ref={field.ref}
        name={field.name}
        value={field.value ?? ''}
        onChange={field.onChange}
        onBlur={field.onBlur}
        className={clsx(
          'h-8 rounded border border-gray-300 px-2 text-sm focus:border-rose-500 focus:outline-none',
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
