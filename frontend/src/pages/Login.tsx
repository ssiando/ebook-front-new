import type { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { FormInput } from '@/components/common/form/FormInput'
import { Button } from '@/components/common/ui/Button'
import { useLoginMutation } from '@/query/auth-query'
import { defineFormRules, showFormErrors, validateForm } from '@/utils/formUtils'
import { useToastStore } from '@/store/useToastStore'

const loginRules = defineFormRules({
  account: { type: 'string', required: true, label: '아이디' },
  password: { type: 'string', required: true, label: '비밀번호' },
})
const loginSchema = validateForm(loginRules)
type LoginFormValues = z.infer<typeof loginSchema>

export default function Login() {
  const navigate = useNavigate()
  const login = useLoginMutation()
  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { account: '', password: '' },
  })

  const onSubmit = handleSubmit(
    (values) => {
      login.mutate(values, {
        onSuccess: () => navigate('/', { replace: true }),
        onError: (error) => {
          useToastStore.getState().push(error instanceof Error ? error.message : '로그인에 실패했습니다.')
        },
      })
    },
    (errors) => showFormErrors(errors, loginRules),
  )

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex w-80 flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="text-center">
          <h1 className="text-lg font-semibold text-gray-800">4DPLEX 관리자 로그인</h1>
          <p className="mt-1 text-xs text-gray-400">관리자 계정으로 로그인해 주세요.</p>
        </div>
        <FormInput name="account" control={control} label="아이디·이메일" required autoFocus />
        <FormInput name="password" control={control} type="password" label="비밀번호" required />
        <Button type="submit" variant="primary" disabled={login.isPending} className="mt-2 w-full">
          로그인
        </Button>
        <p className="text-center text-[11px] leading-relaxed text-gray-400">
          데모 계정: admin001(SUPER_ADMIN) · admin004(ADMIN) · admin006(MEMBER)
          <br />
          비밀번호는 아무 값이나 입력하세요.
        </p>
      </form>
    </div>
  )
}
