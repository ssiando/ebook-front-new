import { z } from 'zod'
import type { RoleSearchParams } from '@/types/role'

export const roleSearchSchema = z.object({
  keyword: z.string(),
}) satisfies z.ZodType<RoleSearchParams>
