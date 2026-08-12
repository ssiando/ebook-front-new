import { useMemo, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, SelectionChangedEvent } from 'ag-grid-community'
import { themeQuartz } from 'ag-grid-community'
import { ChevronDown, ChevronRight, Folder } from 'lucide-react'
import type { ProgramAdminItem } from '@/types/programAdmin'
import { clsx } from '@/utils/clsx'

const gridTheme = themeQuartz.withParams({
  headerBackgroundColor: '#f9fafb',
  headerTextColor: '#374151',
  rowHoverColor: '#fef2f2',
  borderColor: '#e5e7eb',
  fontSize: 13,
})

interface TreeRow extends ProgramAdminItem {
  depth: number
  hasChildren: boolean
}

// ag-grid-community에는 treeData(Enterprise 전용)가 없어, parentProgramId로 트리 순서를
// 직접 계산해 평탄화한 배열을 rowData로 넘긴다. 접힌 부모의 하위 행은 이 단계에서 제외된다.
function buildTreeRows(items: ProgramAdminItem[], collapsedIds: Set<number>): TreeRow[] {
  const childrenByParentId = new Map<number | null, ProgramAdminItem[]>()
  for (const item of items) {
    const key = item.parentProgramId
    const list = childrenByParentId.get(key)
    if (list) list.push(item)
    else childrenByParentId.set(key, [item])
  }
  for (const list of childrenByParentId.values()) {
    list.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
  }

  const result: TreeRow[] = []
  const visited = new Set<number>()

  function walk(parentId: number | null, depth: number) {
    for (const item of childrenByParentId.get(parentId) ?? []) {
      visited.add(item.id)
      const hasChildren = (childrenByParentId.get(item.id)?.length ?? 0) > 0
      result.push({ ...item, depth, hasChildren })
      if (hasChildren && !collapsedIds.has(item.id)) {
        walk(item.id, depth + 1)
      }
    }
  }
  walk(null, 0)

  // parentProgramId가 화면에 없는 행(고아 행)을 놓치지 않도록 최상위로 보정해 추가한다.
  for (const item of items) {
    if (!visited.has(item.id)) {
      result.push({ ...item, depth: 0, hasChildren: false })
    }
  }
  return result
}

function TreeIdCell({
  row,
  collapsed,
  onToggle,
}: {
  row: TreeRow
  collapsed: boolean
  onToggle: (id: number) => void
}) {
  return (
    <div className="flex h-full items-center gap-1" style={{ paddingLeft: row.depth * 18 }}>
      {row.hasChildren ? (
        <button
          type="button"
          onClick={() => onToggle(row.id)}
          className="flex items-center gap-0.5 text-gray-500 hover:text-gray-700"
          aria-label={collapsed ? '펼치기' : '접기'}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
          <Folder size={13} className="text-amber-500" />
        </button>
      ) : (
        <span className={clsx('h-1.5 w-1.5 rounded-full', row.depth === 0 ? 'bg-rose-500' : 'bg-gray-300')} />
      )}
      <span>{row.id}</span>
    </div>
  )
}

interface ProgramListGridProps {
  rows: ProgramAdminItem[]
  loading: boolean
  onCellChange: (
    id: number,
    field: keyof ProgramAdminItem,
    value: string | number | boolean | null,
  ) => void
  onSelectionChange: (ids: number[]) => void
}

function CheckboxCell({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
}

export function ProgramListGrid({
  rows,
  loading,
  onCellChange,
  onSelectionChange,
}: ProgramListGridProps) {
  const [collapsedIds, setCollapsedIds] = useState<Set<number>>(new Set())

  const handleToggle = (id: number) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const treeRows = useMemo(() => buildTreeRows(rows, collapsedIds), [rows, collapsedIds])

  const columnDefs = useMemo<ColDef<TreeRow>[]>(
    () => [
      { headerCheckboxSelection: true, checkboxSelection: true, width: 44, pinned: 'left' },
      {
        field: 'id',
        headerName: 'ID',
        width: 130,
        cellRenderer: (p: { data: TreeRow }) => (
          <TreeIdCell row={p.data} collapsed={collapsedIds.has(p.data.id)} onToggle={handleToggle} />
        ),
      },
      {
        field: 'parentProgramId',
        headerName: '상위 프로그램 ID',
        width: 130,
        editable: true,
        valueFormatter: (p) => (p.value == null ? '' : String(p.value)),
      },
      { field: 'code', headerName: '코드 *', width: 170, editable: true },
      { field: 'name', headerName: '이름 *', width: 170, editable: true },
      {
        field: 'type',
        headerName: '타입 *',
        width: 90,
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: { values: ['API', 'PAGE'] },
      },
      {
        field: 'httpMethod',
        headerName: 'HTTP Method',
        width: 120,
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: { values: ['', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
      },
      { field: 'url', headerName: 'URL *', flex: 1, minWidth: 220, editable: true },
      { field: 'sortOrder', headerName: '정렬', width: 80, editable: true },
      {
        field: 'displayYn',
        headerName: '표시',
        width: 70,
        cellRenderer: (p: { data: ProgramAdminItem; value: boolean }) => (
          <CheckboxCell
            checked={p.value}
            onChange={(v) => onCellChange(p.data.id, 'displayYn', v)}
          />
        ),
      },
      {
        field: 'useYn',
        headerName: '사용여부',
        width: 80,
        cellRenderer: (p: { data: ProgramAdminItem; value: boolean }) => (
          <CheckboxCell checked={p.value} onChange={(v) => onCellChange(p.data.id, 'useYn', v)} />
        ),
      },
      {
        field: 'i18nKeyId',
        headerName: 'i18n 키 ID',
        width: 110,
        editable: true,
        valueFormatter: (p) => (p.value == null ? '' : String(p.value)),
      },
      { field: 'description', headerName: '설명', flex: 1, minWidth: 160, editable: true },
      { field: 'createdAt', headerName: '등록일시', width: 150 },
      { field: 'updatedAt', headerName: '수정일시', width: 150 },
    ],
    [onCellChange, collapsedIds],
  )

  return (
    <div style={{ height: 480 }}>
      <AgGridReact<TreeRow>
        theme={gridTheme}
        rowData={treeRows}
        columnDefs={columnDefs}
        defaultColDef={{ sortable: false }}
        loading={loading}
        rowHeight={38}
        headerHeight={38}
        rowSelection="multiple"
        suppressRowClickSelection
        getRowId={(p) => String(p.data.id)}
        onSelectionChanged={(e: SelectionChangedEvent<TreeRow>) =>
          onSelectionChange(e.api.getSelectedRows().map((row) => row.id))
        }
        onCellValueChanged={(e) => {
          if (!e.data || !e.colDef.field) return
          const field = e.colDef.field as keyof ProgramAdminItem
          const value =
            field === 'sortOrder' || field === 'parentProgramId' || field === 'i18nKeyId'
              ? e.newValue === '' || e.newValue == null
                ? null
                : Number(e.newValue)
              : e.newValue
          onCellChange(e.data.id, field, value)
        }}
      />
    </div>
  )
}
