import type { SelectHTMLAttributes } from 'react'
import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { clsx } from '@/utils/clsx'

interface Option {
  label: string
  value: string
}

interface FormSelectProps<TFieldValues extends FieldValues> extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'name' | 'value' | 'onChange' | 'onBlur'
> {
  name: FieldPath<TFieldValues>
  control: Control<TFieldValues>
  label?: string
  options: Option[]
}

export function FormSelect<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  options,
  className,
  ...props
}: FormSelectProps<TFieldValues>) {
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
