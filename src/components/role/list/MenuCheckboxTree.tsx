import type { MenuItem } from '@/types/menu'

function collectIds(item: MenuItem): string[] {
  return [item.id, ...(item.children?.flatMap(collectIds) ?? [])]
}

interface MenuCheckboxTreeProps {
  items: MenuItem[]
  checkedIds: Set<string>
  onToggleGroup: (ids: string[], checked: boolean) => void
  depth?: number
}

export function MenuCheckboxTree({
  items,
  checkedIds,
  onToggleGroup,
  depth = 0,
}: MenuCheckboxTreeProps) {
  return (
    <div>
      {items.map((item) => {
        const allIds = collectIds(item)
        const checkedCount = allIds.filter((id) => checkedIds.has(id)).length
        const checked = checkedCount === allIds.length
        const indeterminate = checkedCount > 0 && checkedCount < allIds.length

        return (
          <div key={item.id}>
            <label
              className="flex items-center gap-2 py-1 text-sm"
              style={{ paddingLeft: depth * 16 }}
            >
              <input
                type="checkbox"
                checked={checked}
                ref={(el) => {
                  if (el) el.indeterminate = indeterminate
                }}
                onChange={(e) => onToggleGroup(allIds, e.target.checked)}
              />
              <span className={depth === 0 ? 'font-medium text-gray-700' : 'text-gray-600'}>
                {item.label}
              </span>
            </label>
            {item.children && (
              <MenuCheckboxTree
                items={item.children}
                checkedIds={checkedIds}
                onToggleGroup={onToggleGroup}
                depth={depth + 1}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
