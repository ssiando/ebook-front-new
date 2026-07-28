import { useEffect, useState } from 'react'
import { Modal } from '@/components/common/ui/Modal'
import { Button } from '@/components/common/ui/Button'
import menuData from '@/data/menu.json'
import type { MenuItem } from '@/types/menu'
import type { Role } from '@/types/role'
import { useUpdateRoleMenusMutation } from '@/query/role-query'
import { MenuCheckboxTree } from './MenuCheckboxTree'

interface RoleMenuModalProps {
  role: Role | null
  onClose: () => void
}

export function RoleMenuModal({ role, onClose }: RoleMenuModalProps) {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const updateMenus = useUpdateRoleMenusMutation()

  useEffect(() => {
    if (role) setCheckedIds(new Set(role.menuIds))
  }, [role])

  const handleToggleGroup = (ids: string[], checked: boolean) => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => (checked ? next.add(id) : next.delete(id)))
      return next
    })
  }

  const handleSave = async () => {
    if (!role) return
    await updateMenus.mutateAsync({ id: role.id, menuIds: Array.from(checkedIds) })
    onClose()
  }

  return (
    <Modal open={!!role} title={role ? `${role.roleName} — 메뉴 설정` : ''} onClose={onClose} size="lg">
      <div className="max-h-96 overflow-y-auto pr-1">
        <MenuCheckboxTree
          items={menuData as MenuItem[]}
          checkedIds={checkedIds}
          onToggleGroup={handleToggleGroup}
        />
      </div>
      <div className="mt-3 flex justify-end gap-2 border-t border-gray-200 pt-3">
        <Button type="button" variant="secondary" onClick={onClose}>
          취소
        </Button>
        <Button type="button" variant="primary" onClick={handleSave} disabled={updateMenus.isPending}>
          저장
        </Button>
      </div>
    </Modal>
  )
}
