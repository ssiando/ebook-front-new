import type { SelectHTMLAttributes } from 'react'
import { useFormContext } from 'react-hook-form'
import { clsx } from '@/utils/clsx'

interface Option {
  label: string
  value: string
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  name: string
  label?: string
  options: Option[]
}

export function FormSelect({
  name,
  label,
  options,
  className,
  ...props
}: FormSelectProps) {
  const { register } = useFormContext()

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
        {...register(name)}
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
