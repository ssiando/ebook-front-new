import type { ReactNode } from 'react'
import { clsx } from '@/utils/clsx'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  size?: 'sm' | 'lg'
}

const SIZE_CLASSES: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'w-[420px]',
  lg: 'w-[520px]',
}

export function Modal({ open, title, onClose, children, size = 'sm' }: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className={clsx('rounded-lg bg-white shadow-xl', SIZE_CLASSES[size])}>
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}
