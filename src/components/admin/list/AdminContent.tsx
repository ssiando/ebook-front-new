import { useTranslation } from 'react-i18next'
import { Pagination } from '@/components/common/Pagination'
import { AdminListGrid } from './AdminListGrid'
import type { AdminListResponse } from '@/types/admin'
import type { Role } from '@/types/role'

const PAGE_SIZE_OPTIONS = [15, 30, 50, 100]

interface AdminContentProps {
  data: AdminListResponse | undefined
  roles: Role[]
  isLoading: boolean
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function AdminContent({
  data,
  roles,
  isLoading,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: AdminContentProps) {
  const { t } = useTranslation('admin')

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm text-gray-500">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          {t('totalCount', { count: data?.totalCount ?? 0 })}
        </span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="h-8 rounded border border-gray-300 px-2 text-sm"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <AdminListGrid
        rows={data?.items ?? []}
        roles={roles}
        loading={isLoading}
        page={page}
        pageSize={pageSize}
      />

      <Pagination
        page={page}
        pageSize={pageSize}
        totalCount={data?.totalCount ?? 0}
        onPageChange={onPageChange}
      />
    </div>
  )
}
