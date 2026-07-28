import { useEffect, useState } from 'react'
import { Bell, ChevronDown, Star } from 'lucide-react'

function formatTime(date: Date): string {
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function Header() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000 * 30)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold tracking-tight text-gray-900">4DPLEX</span>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded border border-gray-200 px-2 py-1 text-sm text-gray-700 hover:bg-gray-50"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded bg-rose-600 text-xs font-bold text-white">
            V
          </span>
          <span>VFX</span>
          <ChevronDown size={14} className="text-gray-400" />
        </button>
      </div>

      <div className="flex items-center gap-4 text-gray-500">
        <span className="text-sm tabular-nums">{formatTime(now)}</span>
        <button type="button" className="hover:text-gray-700" aria-label="즐겨찾기">
          <Star size={18} />
        </button>
        <button type="button" className="relative hover:text-gray-700" aria-label="알림">
          <Bell size={18} />
          <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-semibold text-white">
            99+
          </span>
        </button>
        <button
          type="button"
          className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900"
        >
          <span>vfx</span>
          <ChevronDown size={14} className="text-gray-400" />
        </button>
      </div>
    </header>
  )
}
