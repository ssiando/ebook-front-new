import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/common/ui/Badge'
import { Button } from '@/components/common/ui/Button'
import { clsx } from '@/utils/clsx'
import type { Admin } from '@/types/admin'
import type { Role, SystemName } from '@/types/role'

interface AdminRoleAssignSectionProps {
  admin: Admin
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

export function AdminRoleAssignSection({
  admin,
  roles,
  checkedRoleIds,
  saving,
  onToggleRole,
  onSave,
}: AdminRoleAssignSectionProps) {
  const { t } = useTranslation('admin')
  const grouped = useMemo(() => groupBySystem(roles), [roles])
  const [expandedSystems, setExpandedSystems] = useState<Set<SystemName>>(() => new Set())

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

  const heldRoles = roles.filter((role) => admin.roleIds.includes(role.id))

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">{t('detail.roleAssignment')}</h2>
        <Button type="button" variant="primary" onClick={onSave} disabled={saving}>
          {t('modal.submit')}
        </Button>
      </div>

      <div className="flex flex-wrap gap-1">
        {heldRoles.length === 0 ? (
          <span className="text-xs text-gray-400">{t('detail.noRolesAssigned')}</span>
        ) : (
          heldRoles.map((role) => (
            <Badge key={role.id} tone="blue">
              {role.system} / {role.roleName}
            </Badge>
          ))
        )}
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
                  {t('detail.roleCount', { count: systemRoles.length })}
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
              </button>
              {isExpanded && (
                <table className="w-full border-t border-gray-200 text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500">
                      <th className="px-3 py-2 text-left font-medium">{t('modal.roles')}</th>
                      <th className="px-3 py-2 text-left font-medium">{t('detail.memberCount')}</th>
                      <th className="px-3 py-2 text-center font-medium">{t('detail.grant')}</th>
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
    </section>
  )
}
