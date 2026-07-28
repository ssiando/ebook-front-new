import { apiClient } from '@/lib/axios'
import { delay } from '@/utils/delay'
import menuData from '@/data/menu.json'
import type { MenuItem } from '@/types/menu'
import type {
  CreateMenuPayload,
  MenuAdminItem,
  MenuAdminListResponse,
  MenuSearchParams,
} from '@/types/menuAdmin'

// NOTE: 백엔드 연동 전까지 sidebar 데이터(data/menu.json)를 평탄화한 목데이터를 사용합니다.
// 실제 연동 시 아래 목데이터/지연 로직을 제거하고 apiClient 호출만 남기면 됩니다.
function flattenMenu(items: MenuItem[], parentLabel = '-'): MenuAdminItem[] {
  return items.flatMap((item, index) => [
    {
      id: item.id,
      label: item.label,
      parentLabel,
      path: item.path ?? '-',
      sortOrder: index + 1,
      useYn: true,
      updatedAt: '2026-07-28',
    },
    ...(item.children ? flattenMenu(item.children, item.label) : []),
  ])
}

const MOCK_MENUS: MenuAdminItem[] = flattenMenu(menuData as MenuItem[])

export async function fetchMenus(params: MenuSearchParams): Promise<MenuAdminListResponse> {
  if (import.meta.env.DEV) {
    const filtered = params.keyword
      ? MOCK_MENUS.filter((menu) => menu.label.includes(params.keyword))
      : MOCK_MENUS
    return delay({ items: [...filtered], totalCount: filtered.length })
  }

  const { data } = await apiClient.get<MenuAdminListResponse>('/menus', { params })
  return data
}

export async function createMenu(payload: CreateMenuPayload): Promise<MenuAdminItem> {
  if (import.meta.env.DEV) {
    const created: MenuAdminItem = {
      id: `menu-${Date.now()}`,
      label: payload.label,
      parentLabel: payload.parentLabel || '-',
      path: payload.path || '-',
      sortOrder: MOCK_MENUS.length + 1,
      useYn: true,
      updatedAt: new Date().toISOString().slice(0, 10),
    }
    MOCK_MENUS.unshift(created)
    return delay(created)
  }

  const { data } = await apiClient.post<MenuAdminItem>('/menus', payload)
  return data
}
