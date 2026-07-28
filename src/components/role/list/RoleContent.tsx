import { RoleListGrid } from './RoleListGrid'
import type { Role, RoleListResponse } from '@/types/role'

interface RoleContentProps {
  data: RoleListResponse | undefined
  isLoading: boolean
  onConfigureMenus: (role: Role) => void
}

export function RoleContent({ data, isLoading, onConfigureMenus }: RoleContentProps) {
  return (
    <div className="flex flex-col gap-4">
      <span className="flex items-center gap-1.5 text-sm text-gray-500">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
        목록 총 {data?.totalCount ?? 0}건
      </span>

      <RoleListGrid rows={data?.items ?? []} loading={isLoading} onConfigureMenus={onConfigureMenus} />
    </div>
  )
}
