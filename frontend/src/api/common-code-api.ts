import { apiClient } from '@/lib/axios'
import type {
  CodeGroup,
  CodeItem,
  CommonCodeSearchParams,
  CreateCodeGroupPayload,
  CreateCodeItemPayload,
  UpdateCodeGroupPayload,
  UpdateCodeItemPayload,
} from '@/types/commonCode'

export async function fetchCodeGroups(params: CommonCodeSearchParams): Promise<CodeGroup[]> {
  const { data } = await apiClient.get<CodeGroup[]>('/common-codes/groups', {
    params: { keyword: params.keyword, useYn: params.useYn === 'ALL' ? undefined : params.useYn },
  })
  return data
}

export async function createCodeGroup(payload: CreateCodeGroupPayload): Promise<CodeGroup> {
  const { data } = await apiClient.post<CodeGroup>('/common-codes/groups', payload)
  return data
}

export async function updateCodeGroup(payload: UpdateCodeGroupPayload): Promise<CodeGroup> {
  const { id, ...body } = payload
  const { data } = await apiClient.put<CodeGroup>(`/common-codes/groups/${id}`, body)
  return data
}

export async function deleteCodeGroup(id: string): Promise<void> {
  await apiClient.delete(`/common-codes/groups/${id}`)
}

export async function fetchCodeItems(groupId: string): Promise<CodeItem[]> {
  const { data } = await apiClient.get<CodeItem[]>(`/common-codes/groups/${groupId}/items`)
  return data
}

/** 그룹코드로 사용 중인 코드 항목만 조회합니다 (다른 화면의 select 옵션 등에서 사용). */
export async function fetchCodeItemsByGroupCode(groupCode: string): Promise<CodeItem[]> {
  const { data } = await apiClient.get<CodeItem[]>(`/common-codes/groups/by-code/${groupCode}/items`)
  return data
}

export async function createCodeItem(payload: CreateCodeItemPayload): Promise<CodeItem> {
  const { groupId, ...body } = payload
  const { data } = await apiClient.post<CodeItem>(`/common-codes/groups/${groupId}/items`, body)
  return data
}

export async function updateCodeItem(payload: UpdateCodeItemPayload): Promise<CodeItem> {
  const { id, groupId, ...body } = payload
  const { data } = await apiClient.put<CodeItem>(`/common-codes/groups/${groupId}/items/${id}`, body)
  return data
}

export async function deleteCodeItem(groupId: string, id: string): Promise<void> {
  await apiClient.delete(`/common-codes/groups/${groupId}/items/${id}`)
}
