import type { InputHTMLAttributes } from 'react'
import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { clsx } from '@/utils/clsx'

interface FormInputProps<TFieldValues extends FieldValues> extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'name' | 'value' | 'onChange' | 'onBlur'
> {
  name: FieldPath<TFieldValues>
  control: Control<TFieldValues>
  label?: string
}

export function FormInput<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  className,
  ...props
}: FormInputProps<TFieldValues>) {
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
