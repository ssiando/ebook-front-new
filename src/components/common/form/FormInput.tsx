import type { InputHTMLAttributes } from 'react'
import { useController, type Control } from 'react-hook-form'
import { clsx } from '@/utils/clsx'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string
  // 여러 폼에서 재사용하는 공용 컴포넌트라 특정 폼의 필드 타입에 묶이지 않도록 Control<any, any, any>를 사용합니다.
  control: Control<any, any, any>
  label?: string
}

export function FormInput({ name, control, label, className, ...props }: FormInputProps) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control })

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={name} className="text-xs font-medium text-gray-600">
          {label}
          {props.required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <input
        id={name}
        ref={field.ref}
        name={field.name}
        value={field.value ?? ''}
        onChange={field.onChange}
        onBlur={field.onBlur}
        className={clsx(
          'h-8 rounded border border-gray-300 px-2 text-sm focus:border-rose-500 focus:outline-none',
          error && 'border-red-500',
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error.message}</span>}
    </div>
  )
}
