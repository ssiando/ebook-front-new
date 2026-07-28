import type { InputHTMLAttributes } from 'react'
import { useFormContext } from 'react-hook-form'
import { clsx } from '@/utils/clsx'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string
  label?: string
}

export function FormInput({ name, label, className, ...props }: FormInputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext()
  const error = errors[name]?.message as string | undefined

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
        {...register(name)}
        className={clsx(
          'h-8 rounded border border-gray-300 px-2 text-sm focus:border-rose-500 focus:outline-none',
          error && 'border-red-500',
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
