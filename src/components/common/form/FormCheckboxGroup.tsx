import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { clsx } from '@/utils/clsx'

interface Option {
  label: string
  value: string
}

interface FormCheckboxGroupProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>
  control: Control<TFieldValues>
  label?: string
  required?: boolean
  options: Option[]
  className?: string
}

export function FormCheckboxGroup<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  required,
  options,
  className,
}: FormCheckboxGroupProps<TFieldValues>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control })

  const values: string[] = field.value ?? []

  const toggle = (value: string) => {
    const next = values.includes(value)
      ? values.filter((v) => v !== value)
      : [...values, value]
    field.onChange(next)
  }

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-gray-600">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <div className={clsx('flex flex-wrap gap-x-4 gap-y-2 rounded border border-gray-300 p-2', className)}>
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-1.5 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={values.includes(option.value)}
              onChange={() => toggle(option.value)}
              onBlur={field.onBlur}
              className="h-3.5 w-3.5 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
            />
            {option.label}
          </label>
        ))}
      </div>
      {error && <span className="text-xs text-red-500">{error.message}</span>}
    </div>
  )
}
