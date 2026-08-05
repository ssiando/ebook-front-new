import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/common/ui/Badge'
import { Button } from '@/components/common/ui/Button'
import type { Admin } from '@/types/admin'
import type { Role } from '@/types/role'

interface AdminRoleAssignSectionProps {
  admin: Admin
  roles: Role[]
  checkedRoleIds: Set<string>
  saving: boolean
  onToggleRole: (roleId: string, checked: boolean) => void
  onSave: () => void
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
  const heldRoles = (roles ?? [])?.filter((role) => admin.roleIds.includes(role.id))

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
              {role.roleName}
            </Badge>
          ))
        )}
      </div>

      <table className="w-full rounded border border-gray-200 text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
            <th className="px-3 py-2 text-left font-medium">{t('modal.roles')}</th>
            <th className="px-3 py-2 text-left font-medium">{t('detail.memberCount')}</th>
            <th className="px-3 py-2 text-center font-medium">{t('detail.grant')}</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
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
    </section>
  )
}
