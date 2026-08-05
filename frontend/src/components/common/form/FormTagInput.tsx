import { useState } from 'react'
import { X } from 'lucide-react'
import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { clsx } from '@/utils/clsx'

interface FormTagInputProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>
  control: Control<TFieldValues>
  label?: string
  placeholder?: string
  helperText?: string
  className?: string
}

export function FormTagInput<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  helperText,
  className,
}: FormTagInputProps<TFieldValues>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control })
  const [draft, setDraft] = useState('')

  const tags: string[] = field.value ?? []

  const addTag = () => {
    const value = draft.trim()
    if (value && !tags.includes(value)) {
      field.onChange([...tags, value])
    }
    setDraft('')
  }

  const removeTag = (tag: string) => {
    field.onChange(tags.filter((t) => t !== tag))
  }

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-gray-600">{label}</label>}
      <div
        className={clsx(
          'flex flex-wrap items-center gap-1.5 rounded border border-gray-300 p-2',
          error && 'border-red-500',
          className,
        )}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`${tag} 제거`}
              className="text-sky-500 hover:text-sky-700"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addTag()
            }
          }}
          onBlur={() => {
            addTag()
            field.onBlur()
          }}
          placeholder={placeholder}
          className="h-6 min-w-24 flex-1 border-none text-sm outline-none"
        />
      </div>
      {helperText && !error && <span className="text-xs text-gray-400">{helperText}</span>}
      {error && <span className="text-xs text-red-500">{error.message}</span>}
    </div>
  )
}
