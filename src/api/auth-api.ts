import { apiClient } from '@/lib/axios'
import { delay } from '@/utils/delay'
import { findAdminByAccount } from './admin-api'
import type { Admin } from '@/types/admin'
import type { LoginPayload } from '@/types/auth'

// NOTE: 백엔드 연동 전까지 화면 확인용 목데이터를 사용합니다.
// 실제 연동 시 아래 목데이터/지연 로직을 제거하고 apiClient 호출만 남기면 됩니다.
export async function login(payload: LoginPayload): Promise<Admin> {
  if (import.meta.env.DEV) {
    if (!payload.password) throw new Error('비밀번호를 입력해 주세요.')
    const admin = await findAdminByAccount(payload.account)
    if (!admin) throw new Error('존재하지 않는 계정입니다.')
    if (admin.status === 'INACTIVE') throw new Error('비활성화된 계정입니다. 관리자에게 문의해 주세요.')
    return delay(admin)
  }

  const { data } = await apiClient.post<Admin>('/auth/login', payload)
  return data
}
