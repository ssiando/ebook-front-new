import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/common/ui/Badge'
import { Button } from '@/components/common/ui/Button'
import { useCodeItemsByGroupCodeQuery } from '@/query/common-code-query'
import { clsx } from '@/utils/clsx'
import { toBadgeTone } from '@/utils/badgeTone'
import { ADMIN_STATUS_GROUP_CODE, type Admin } from '@/types/admin'
import type { Role, SystemName } from '@/types/role'

interface AdminRoleAssignPanelProps {
  admin: Admin | null
  roles: Role[]
  checkedRoleIds: Set<string>
  saving: boolean
  onToggleRole: (roleId: string, checked: boolean) => void
  onSave: () => void
}

const SYSTEM_DOT_CLASSES: Record<SystemName, string> = {
  VFX: 'bg-orange-500',
  GENX: 'bg-cyan-500',
  '4DX': 'bg-emerald-500',
  ASSET: 'bg-rose-500',
  DESK: 'bg-violet-500',
}

function groupBySystem(roles: Role[]): [SystemName, Role[]][] {
  const groups = new Map<SystemName, Role[]>()
  for (const role of roles) {
    const list = groups.get(role.system) ?? []
    list.push(role)
    groups.set(role.system, list)
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))
}

export function AdminRoleAssignPanel({
  admin,
  roles,
  checkedRoleIds,
  saving,
  onToggleRole,
  onSave,
}: AdminRoleAssignPanelProps) {
  const grouped = useMemo(() => groupBySystem(roles), [roles])
  const [expandedSystems, setExpandedSystems] = useState<Set<SystemName>>(() => new Set())

  // 관리자 상태 라벨/배지색은 공통코드(그룹코드 ADMIN_STATUS)의 codeName/metadata에서 가져온다.
  const statusCodesQuery = useCodeItemsByGroupCodeQuery(ADMIN_STATUS_GROUP_CODE)

  // 관리자를 바꿔 선택했을 때 이미 부여된 역할이 접힌 그룹 속에 숨지 않도록 해당 시스템을 자동으로 펼친다.
  useEffect(() => {
    const systemsWithCheckedRoles = new Set(
      roles.filter((role) => checkedRoleIds.has(role.id)).map((role) => role.system),
    )
    setExpandedSystems((prev) => {
      if ([...systemsWithCheckedRoles].every((system) => prev.has(system))) return prev
      return new Set([...prev, ...systemsWithCheckedRoles])
    })
  }, [roles, checkedRoleIds])

  const toggleExpand = (system: SystemName) => {
    setExpandedSystems((prev) => {
      const next = new Set(prev)
      if (next.has(system)) next.delete(system)
      else next.add(system)
      return next
    })
  }

  if (!admin) {
    return (
      <div className="flex h-full items-center justify-center rounded border border-gray-200 text-sm text-gray-400">
        관리자를 선택하면 역할을 할당할 수 있습니다.
      </div>
    )
  }

  const heldRoles = roles.filter((role) => admin.roleIds.includes(role.id))
  const statusCode = (statusCodesQuery.data ?? []).find((code) => code.code === admin.status)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between rounded border border-gray-200 p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-gray-800">{admin.adminName}</span>
            <span className="text-sm text-gray-400">{admin.email}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">현재 보유 역할</span>
            <div className="flex flex-wrap gap-1">
              {heldRoles.length === 0 ? (
                <span className="text-xs text-gray-400">부여된 역할이 없습니다.</span>
              ) : (
                heldRoles.map((role) => (
                  <Badge key={role.id} tone="blue">
                    {role.system} / {role.roleName}
                  </Badge>
                ))
              )}
            </div>
          </div>
        </div>
        <Badge tone={toBadgeTone(statusCode?.metadata)}>{statusCode?.codeName ?? admin.status}</Badge>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-gray-800">역할 할당</span>
        <Button type="button" variant="primary" onClick={onSave} disabled={saving}>
          저장
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {grouped.map(([system, systemRoles]) => {
          const isExpanded = expandedSystems.has(system)
          return (
            <div key={system} className="rounded border border-gray-200">
              <button
                type="button"
                onClick={() => toggleExpand(system)}
                className="flex w-full items-center justify-between px-3 py-2"
              >
                <span className="flex items-center gap-2">
                  <span className={clsx('h-2 w-2 rounded-full', SYSTEM_DOT_CLASSES[system])} />
                  <span className="text-sm font-semibold text-gray-800">{system}</span>
                </span>
                <span className="flex items-center gap-2 text-xs text-gray-400">
                  역할 {systemRoles.length}개
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
              </button>
              {isExpanded && (
                <table className="w-full border-t border-gray-200 text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500">
                      <th className="px-3 py-2 text-left font-medium">역할명</th>
                      <th className="px-3 py-2 text-left font-medium">소속 인원</th>
                      <th className="px-3 py-2 text-center font-medium">부여</th>
                    </tr>
                  </thead>
                  <tbody>
                    {systemRoles.map((role) => (
                      <tr key={role.id} className="border-t border-gray-100">
                        <td className="px-3 py-2">{role.roleName}</td>
                        <td className="px-3 py-2 text-gray-500">{role.memberCount}</td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={checkedRoleIds.has(role.id)}
                            onChange={(e) => onToggleRole(role.id, e.target.checked)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
