import { useTranslation } from 'react-i18next'
import { clsx } from '@/utils/clsx'

interface StatCardProps {
  label: string
  value: number
  tone?: 'default' | 'green' | 'blue' | 'red'
}

const VALUE_TONE_CLASSES: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'text-gray-800',
  green: 'text-emerald-600',
  blue: 'text-sky-600',
  red: 'text-red-600',
}

function StatCard({ label, value, tone = 'default' }: StatCardProps) {
  return (
    <div className="flex-1 rounded border border-gray-200 bg-white p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={clsx('mt-1 text-2xl font-semibold', VALUE_TONE_CLASSES[tone])}>{value}</p>
    </div>
  )
}

interface AdminStatCardsProps {
  total: number
  active: number
  inactiveCount: number
}

export function AdminStatCards({ total, active, inactiveCount }: AdminStatCardsProps) {
  const { t } = useTranslation('admin')

  return (
    <div className="flex gap-4">
      <StatCard label={t('detail.statTotal')} value={total} />
      <StatCard label={t('detail.statActive')} value={active} tone="green" />
      <StatCard label={t('detail.statInactive')} value={inactiveCount} tone="red" />
    </div>
  )
}
