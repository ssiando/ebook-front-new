import { clsx } from '@/utils/clsx'

export type BadgeTone = 'green' | 'gray' | 'blue' | 'red'

interface BadgeProps {
  tone?: BadgeTone
  children: React.ReactNode
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  green: 'bg-emerald-50 text-emerald-700',
  gray: 'bg-gray-100 text-gray-500',
  blue: 'bg-sky-50 text-sky-700',
  red: 'bg-red-50 text-red-700',
}

export function Badge({ tone = 'gray', children }: BadgeProps) {
  return (
    <span
      className={clsx('inline-flex rounded px-2 py-0.5 text-xs font-medium', TONE_CLASSES[tone])}
    >
      {children}
    </span>
  )
}
