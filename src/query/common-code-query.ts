import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchCodeGroups,
  fetchCodeItems,
  saveCodeGroups,
  saveCodeItems,
} from '@/api/common-code-api'
import type { CodeGroup, CodeItem, CommonCodeSearchParams } from '@/types/commonCode'

export const commonCodeKeys = {
  groups: (params: CommonCodeSearchParams) => ['codeGroups', params] as const,
  items: (groupId: string) => ['codeItems', groupId] as const,
}

export function useCodeGroupsQuery(params: CommonCodeSearchParams) {
  return useQuery({
    queryKey: commonCodeKeys.groups(params),
    queryFn: () => fetchCodeGroups(params),
    placeholderData: (prev) => prev,
  })
}

export function useSaveCodeGroupsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (groups: CodeGroup[]) => saveCodeGroups(groups),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codeGroups'] })
    },
  })
}

export function useCodeItemsQuery(groupId: string | null) {
  return useQuery({
    queryKey: commonCodeKeys.items(groupId ?? ''),
    queryFn: () => fetchCodeItems(groupId ?? ''),
    enabled: !!groupId,
    // 그룹을 바꾸면 이전 그룹의 항목이 잠깐이라도 보이면 안 되므로 placeholderData를 쓰지 않는다.
  })
}

export function useSaveCodeItemsMutation(groupId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (items: CodeItem[]) => saveCodeItems(groupId ?? '', items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commonCodeKeys.items(groupId ?? '') })
    },
  })
}
