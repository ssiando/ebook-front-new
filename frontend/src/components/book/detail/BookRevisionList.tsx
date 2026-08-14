import { Pencil, Trash2 } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/common/ui/Badge'
import type { BookRevision, EncryptStatus, PublishStatus } from '@/types/bookRevision'

const PUBLISH_STATUS_LABELS: Record<PublishStatus, string> = {
  DRAFT: '작성중',
  REVIEWING: '검토중',
  PUBLISHED: '출판됨',
  REJECTED: '반려',
}

const PUBLISH_STATUS_TONES: Record<PublishStatus, BadgeTone> = {
  DRAFT: 'gray',
  REVIEWING: 'blue',
  PUBLISHED: 'green',
  REJECTED: 'red',
}

const ENCRYPT_STATUS_LABELS: Record<EncryptStatus, string> = {
  0: '미진행',
  1: '암호화요청',
  2: '암호화완료',
}

interface BookRevisionListProps {
  revisions: BookRevision[]
  loading: boolean
  onEditClick: (revision: BookRevision) => void
  onDeleteClick: (revision: BookRevision) => void
}

export function BookRevisionList({
  revisions,
  loading,
  onEditClick,
  onDeleteClick,
}: BookRevisionListProps) {
  if (loading) {
    return <div className="py-6 text-center text-xs text-gray-400">불러오는 중...</div>
  }

  if (revisions.length === 0) {
    return (
      <div className="flex h-20 items-center justify-center rounded border border-dashed border-gray-200 text-xs text-gray-400">
        등록된 버전이 없습니다.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded border border-gray-200">
      <table className="w-full text-xs">
        <thead className="bg-gray-50 text-gray-500">
          <tr>
            <th className="px-3 py-2 text-left font-medium">버전</th>
            <th className="px-3 py-2 text-left font-medium">파일명</th>
            <th className="px-3 py-2 text-left font-medium">출판 상태</th>
            <th className="px-3 py-2 text-left font-medium">게시</th>
            <th className="px-3 py-2 text-left font-medium">암호화</th>
            <th className="px-3 py-2 text-left font-medium">수정일</th>
            <th className="px-3 py-2 text-right font-medium">관리</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {revisions.map((revision) => (
            <tr key={revision.id} className="text-gray-700">
              <td className="px-3 py-2 font-medium">v{revision.revisionNo}</td>
              <td className="max-w-[160px] truncate px-3 py-2" title={revision.fileName}>
                {revision.fileName}
              </td>
              <td className="px-3 py-2">
                <Badge tone={PUBLISH_STATUS_TONES[revision.publishStatusCd]}>
                  {PUBLISH_STATUS_LABELS[revision.publishStatusCd]}
                </Badge>
              </td>
              <td className="px-3 py-2">
                <Badge tone={revision.publishedYn ? 'green' : 'gray'}>
                  {revision.publishedYn ? '게시' : '미게시'}
                </Badge>
              </td>
              <td className="px-3 py-2 text-gray-500">{ENCRYPT_STATUS_LABELS[revision.encryptStatusCd]}</td>
              <td className="px-3 py-2 text-gray-400">{revision.updatedAt.slice(0, 10)}</td>
              <td className="px-3 py-2">
                <div className="flex justify-end gap-2 text-gray-400">
                  <button
                    type="button"
                    onClick={() => onEditClick(revision)}
                    aria-label={`v${revision.revisionNo} 수정`}
                    className="hover:text-gray-600"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteClick(revision)}
                    aria-label={`v${revision.revisionNo} 삭제`}
                    className="hover:text-red-500"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
