import { useTranslation } from 'react-i18next'
import { Pagination } from '@/components/common/Pagination'
import { UserListGrid } from './UserListGrid'
import type { UserListResponse } from '@/types/user'

const PAGE_SIZE_OPTIONS = [15, 30, 50, 100]

interface UserContentProps {
  data: UserListResponse | undefined
  isLoading: boolean
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function UserContent({
  data,
  isLoading,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: UserContentProps) {
  const { t } = useTranslation('user')

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

      <UserListGrid rows={data?.items ?? []} loading={isLoading} page={page} pageSize={pageSize} />

      <Pagination
        page={page}
        pageSize={pageSize}
        totalCount={data?.totalCount ?? 0}
        onPageChange={onPageChange}
      />
    </div>
  )
}
