import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronsRight, PanelLeftClose, Search } from 'lucide-react'
import menuData from '@/data/menu.json'
import type { MenuItem } from '@/types/menu'
import { useUiStore } from '@/store/useUiStore'
import { clsx } from '@/utils/clsx'
import { menuIcons } from './menuIcons'

const menu = menuData as MenuItem[]

function filterMenu(items: MenuItem[], keyword: string): MenuItem[] {
  if (!keyword) return items
  const result: MenuItem[] = []
  for (const item of items) {
    const children = item.children ? filterMenu(item.children, keyword) : undefined
    const matches = item.label.includes(keyword)
    if (matches || (children && children.length > 0)) {
      result.push({ ...item, children: children ?? item.children })
    }
  }
  return result
}

function MenuNode({ item, depth }: { item: MenuItem; depth: number }) {
  const location = useLocation()
  const navigate = useNavigate()
  const openTab = useUiStore((s) => s.openTab)
  const [expanded, setExpanded] = useState(true)
  const hasChildren = !!item.children?.length
  const isActive = item.path === location.pathname
  const Icon = depth === 0 ? menuIcons[item.id] : undefined

  const handleClick = () => {
    if (hasChildren) {
      setExpanded((prev) => !prev)
      return
    }
    if (item.path) {
      openTab({ path: item.path, label: item.label })
      navigate(item.path)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        className={clsx(
          'flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-gray-100',
          isActive && 'bg-rose-50 font-semibold text-rose-600',
          depth === 0 ? 'font-medium text-gray-700' : 'text-gray-600',
        )}
        style={{ paddingLeft: 8 + depth * 14 }}
      >
        <span className="flex items-center gap-2">
          {Icon && <Icon size={16} className={isActive ? 'text-rose-600' : 'text-gray-400'} />}
          {depth > 0 && isActive && <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />}
          {item.label}
        </span>
        {hasChildren && <span className="text-xs text-gray-400">{expanded ? '−' : '+'}</span>}
      </button>
      {hasChildren && expanded && (
        <div>
          {item.children!.map((child) => (
            <MenuNode key={child.id} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const [keyword, setKeyword] = useState('')
  const visibleMenu = useMemo(() => filterMenu(menu, keyword.trim()), [keyword])

  if (collapsed) {
    return (
      <aside className="flex w-10 flex-col items-center border-r border-gray-200 bg-white py-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="rounded p-1 text-gray-500 hover:bg-gray-100"
          aria-label="사이드바 펼치기"
        >
          <ChevronsRight size={16} />
        </button>
      </aside>
    )
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center gap-2 border-b border-gray-200 px-3 py-2">
        <div className="relative flex-1">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="메뉴를 검색해 주세요"
            className="h-8 w-full rounded border border-gray-200 pr-8 pl-2 text-sm focus:border-rose-500 focus:outline-none"
          />
          <Search
            size={14}
            className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-rose-500"
          />
        </div>
        <button
          type="button"
          onClick={toggleSidebar}
          className="rounded p-1 text-gray-500 hover:bg-gray-100"
          aria-label="사이드바 접기"
        >
          <PanelLeftClose size={16} />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {visibleMenu.map((item) => (
          <MenuNode key={item.id} item={item} depth={0} />
        ))}
      </nav>
    </aside>
  )
}
