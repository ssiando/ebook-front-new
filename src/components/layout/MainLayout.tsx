import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import menuData from '@/data/menu.json'
import type { MenuItem } from '@/types/menu'
import { useUiStore } from '@/store/useUiStore'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { TabBar } from './TabBar'

function findMenuByPath(items: MenuItem[], path: string): MenuItem | undefined {
  for (const item of items) {
    if (item.path === path) return item
    if (item.children) {
      const found = findMenuByPath(item.children, path)
      if (found) return found
    }
  }
  return undefined
}

export function MainLayout() {
  const location = useLocation()
  const openTab = useUiStore((s) => s.openTab)

  useEffect(() => {
    const menuItem = findMenuByPath(menuData as MenuItem[], location.pathname)
    if (menuItem?.path) {
      openTab({ path: menuItem.path, label: menuItem.label })
    }
  }, [location.pathname, openTab])

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-gray-50 text-gray-800">
      <Header />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TabBar />
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
