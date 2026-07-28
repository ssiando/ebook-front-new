import { Info, Star } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Button } from '@/components/common/ui/Button'
import menuData from '@/data/menu.json'
import type { MenuItem } from '@/types/menu'

// 실제 사내 프로젝트에서는 @vanta/common 의 PageTitle을 사용합니다.
// 이 저장소에는 해당 패키지가 없어 동일한 역할을 하는 로컬 구현을 둡니다.
function findBreadcrumb(items: MenuItem[], path: string, parentLabel?: string): string | undefined {
  for (const item of items) {
    if (item.path === path) return parentLabel ?? item.label
    if (item.children) {
      const found = findBreadcrumb(item.children, path, item.label)
      if (found) return found
    }
  }
  return undefined
}

interface PageTitleActionButtonsProps {
  onSearch?: () => void
  searchLabel?: string
  onRegister?: () => void
  registerLabel?: string
}

interface PageTitleProps {
  title: string
  breadcrumb?: string
  actionButtonsProps?: PageTitleActionButtonsProps
}

export function PageTitle({ title, breadcrumb, actionButtonsProps }: PageTitleProps) {
  const location = useLocation()
  const resolvedBreadcrumb = breadcrumb ?? findBreadcrumb(menuData as MenuItem[], location.pathname)

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
        <Star size={16} className="text-gray-300" />
        <Info size={16} className="text-gray-300" />
        {resolvedBreadcrumb && (
          <span className="ml-2 text-sm text-gray-400">{resolvedBreadcrumb}</span>
        )}
      </div>
      {actionButtonsProps && (
        <div className="flex gap-2">
          {actionButtonsProps.onSearch && (
            <Button type="button" variant="secondary" onClick={actionButtonsProps.onSearch}>
              {actionButtonsProps.searchLabel ?? '조회'}
            </Button>
          )}
          {actionButtonsProps.onRegister && (
            <Button type="button" variant="primary" onClick={actionButtonsProps.onRegister}>
              {actionButtonsProps.registerLabel ?? '등록'}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
