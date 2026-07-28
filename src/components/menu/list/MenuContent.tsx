import { MenuListGrid } from './MenuListGrid'
import type { MenuAdminListResponse } from '@/types/menuAdmin'

interface MenuContentProps {
  data: MenuAdminListResponse | undefined
  isLoading: boolean
}

export function MenuContent({ data, isLoading }: MenuContentProps) {
  return (
    <div className="flex flex-col gap-4">
      <span className="flex items-center gap-1.5 text-sm text-gray-500">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
        목록 총 {data?.totalCount ?? 0}건
      </span>

      <MenuListGrid rows={data?.items ?? []} loading={isLoading} />
    </div>
  )
}
