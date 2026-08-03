import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-react'
import { clsx } from '@/utils/clsx'
import type { ProgramItem } from '@/types/program'

interface ProgramTreeNode extends ProgramItem {
  children: ProgramTreeNode[]
}

interface MenuGrantTreeProps {
  rows: ProgramItem[]
  loading: boolean
  checkedIds: Set<string>
  disabled: boolean
  onToggle: (id: string, checked: boolean) => void
}

const COLUMNS = 'grid grid-cols-[1fr_1fr_90px_90px] items-center'

function buildTree(rows: ProgramItem[]): ProgramTreeNode[] {
  const nodeMap = new Map<string, ProgramTreeNode>(rows.map((row) => [row.id, { ...row, children: [] }]))
  const roots: ProgramTreeNode[] = []
  for (const row of rows) {
    const node = nodeMap.get(row.id)!
    const parent = row.parentId ? nodeMap.get(row.parentId) : undefined
    if (parent) parent.children.push(node)
    else roots.push(node)
  }
  return roots
}

// 역할을 바꿔 선택했을 때 이미 체크된 하위 항목이 접힌 폴더 속에 숨지 않도록 조상 노드를 자동으로 펼친다.
function collectAncestorIds(rows: ProgramItem[], targetIds: Set<string>): Set<string> {
  const byId = new Map(rows.map((row) => [row.id, row]))
  const ancestors = new Set<string>()
  for (const id of targetIds) {
    let current = byId.get(id)
    while (current?.parentId) {
      ancestors.add(current.parentId)
      current = byId.get(current.parentId)
    }
  }
  return ancestors
}

export function MenuGrantTree({ rows, loading, checkedIds, disabled, onToggle }: MenuGrantTreeProps) {
  const tree = useMemo(() => buildTree(rows), [rows])
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    const ancestors = collectAncestorIds(rows, checkedIds)
    setExpandedIds((prev) => {
      if ([...ancestors].every((id) => prev.has(id))) return prev
      return new Set([...prev, ...ancestors])
    })
  }, [rows, checkedIds])

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const renderNode = (node: ProgramTreeNode, depth: number): ReactNode => {
    const hasChildren = node.children.length > 0
    const isExpanded = expandedIds.has(node.id)

    return (
      <div key={node.id}>
        <div className={clsx(COLUMNS, 'border-b border-gray-100 py-1.5 text-sm hover:bg-rose-50')}>
          <div
            className="flex items-center gap-1 overflow-hidden pr-2"
            style={{ paddingLeft: depth * 20 }}
          >
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleExpand(node.id)}
                className="flex h-5 w-5 shrink-0 items-center justify-center text-gray-400 hover:text-gray-600"
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : (
              <span className="h-5 w-5 shrink-0" />
            )}
            {hasChildren ? (
              isExpanded ? (
                <FolderOpen size={14} className="shrink-0 text-amber-500" />
              ) : (
                <Folder size={14} className="shrink-0 text-amber-500" />
              )
            ) : (
              <span className="flex h-5 w-3.5 shrink-0 items-center justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
              </span>
            )}
            <span className="truncate" title={node.label}>
              {node.label}
            </span>
          </div>
          <span className="truncate pr-2 text-gray-500" title={node.code}>
            {node.code}
          </span>
          <span className="flex justify-center">
            <span
              className={clsx(
                'rounded px-1.5 py-0.5 text-xs',
                node.type === 'API' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600',
              )}
            >
              {node.type}
            </span>
          </span>
          <span className="flex justify-center">
            <input
              type="checkbox"
              disabled={disabled}
              checked={checkedIds.has(node.id)}
              onChange={(e) => onToggle(node.id, e.target.checked)}
            />
          </span>
        </div>
        {hasChildren && isExpanded && node.children.map((child) => renderNode(child, depth + 1))}
      </div>
    )
  }

  return (
    <div className="flex flex-col rounded border border-gray-200">
      <div className={clsx(COLUMNS, 'border-b border-gray-200 bg-gray-50 py-2 text-xs font-medium text-gray-600')}>
        <span className="pl-2">프로그램명</span>
        <span>코드</span>
        <span className="text-center">타입</span>
        <span className="text-center">프로그램 부여</span>
      </div>
      <div style={{ height: 420 }} className="overflow-y-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">불러오는 중...</div>
        ) : tree.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            표시할 메뉴가 없습니다.
          </div>
        ) : (
          tree.map((node) => renderNode(node, 0))
        )}
      </div>
    </div>
  )
}
