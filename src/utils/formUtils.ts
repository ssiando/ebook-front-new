import { z } from 'zod'
import type { FieldErrors } from 'react-hook-form'
import { useToastStore } from '@/store/useToastStore'

// 실제 사내 프로젝트에서는 @vanta/common 의 defineFormRules/validateForm/showFormErrors를 사용합니다.
// 이 저장소에는 해당 패키지가 없어 동일한 역할을 하는 로컬 구현을 둡니다.
// 실제 환경에서는 label/messages에 i18n 키를 넣고 t()로 번역해서 쓰지만,
// 이 프로젝트는 데모 목적상 한글 문자열을 바로 사용합니다.
//
// 표준 필드(문자열/숫자/불리언 required·길이·범위 검증)는 defineFormRules + validateForm(패턴 A)을 쓰고,
// enum select처럼 이 규칙 모양을 벗어나는 필드가 있으면 z.object를 직접 쓰는 패턴 B를 사용하세요
// (예: UserCreateModal의 role 필드).

type FieldMessageKey = 'required' | 'email' | 'maxLength' | 'minLength' | 'min' | 'max' | 'mustBeTrue'

export interface FormFieldConfig {
  type: 'string' | 'number' | 'boolean'
  required?: boolean
  email?: boolean
  maxLength?: number
  minLength?: number
  min?: number
  max?: number
  mustBeTrue?: boolean
  label?: string
  messages?: Partial<Record<FieldMessageKey, string>>
}

export type FormRules = Record<string, FormFieldConfig>

type FieldSchema<F extends FormFieldConfig> = F['type'] extends 'number'
  ? z.ZodNumber
  : F['type'] extends 'boolean'
    ? z.ZodBoolean
    : z.ZodString

/** 필드 규칙 객체를 그대로 반환합니다 (타입 추론 + UI 속성 재사용 목적). */
export function defineFormRules<T extends FormRules>(rules: T): T {
  return rules
}

const DEFAULT_MESSAGES: Record<FieldMessageKey, (label: string, arg?: number) => string> = {
  required: (label) => `${label}을(를) 입력해 주세요`,
  email: (label) => `${label} 형식이 올바르지 않습니다`,
  maxLength: (label, n) => `${label}은(는) 최대 ${n}자까지 입력 가능합니다`,
  minLength: (label, n) => `${label}은(는) 최소 ${n}자 이상 입력해야 합니다`,
  min: (label, n) => `${label}은(는) ${n} 이상이어야 합니다`,
  max: (label, n) => `${label}은(는) ${n} 이하이어야 합니다`,
  mustBeTrue: (label) => `${label}에 동의해 주세요`,
}

function message(config: FormFieldConfig, key: FieldMessageKey, arg?: number): string {
  return config.messages?.[key] ?? DEFAULT_MESSAGES[key](config.label ?? '값', arg)
}

function buildFieldSchema(config: FormFieldConfig): z.ZodTypeAny {
  if (config.type === 'number') {
    let schema = z.coerce.number()
    if (config.min !== undefined) schema = schema.min(config.min, message(config, 'min', config.min))
    if (config.max !== undefined) schema = schema.max(config.max, message(config, 'max', config.max))
    return schema
  }

  if (config.type === 'boolean') {
    const schema = z.boolean()
    if (config.mustBeTrue) {
      return schema.refine((value) => value === true, { message: message(config, 'mustBeTrue') })
    }
    return schema
  }

  let schema = z.string()
  if (config.email) schema = schema.email(message(config, 'email'))
  if (config.maxLength !== undefined) {
    schema = schema.max(config.maxLength, message(config, 'maxLength', config.maxLength))
  }
  if (config.required) {
    const min = config.minLength ?? 1
    schema = schema.min(min, message(config, config.minLength ? 'minLength' : 'required', min))
  } else if (config.minLength !== undefined) {
    schema = schema.min(config.minLength, message(config, 'minLength', config.minLength))
  }
  return schema
}

/** 필드 규칙 객체로부터 Zod 스키마를 생성합니다. */
export function validateForm<T extends FormRules>(rules: T) {
  const shape = {} as { [K in keyof T]: FieldSchema<T[K]> }
  for (const key of Object.keys(rules) as (keyof T)[]) {
    shape[key] = buildFieldSchema(rules[key]) as FieldSchema<T[typeof key]>
  }
  return z.object(shape)
}

/** 검증 실패 시 필드 라벨을 붙여 토스트로 보여줍니다 (필드 하단 인라인 에러와 별개). */
export function showFormErrors(errors: FieldErrors, rules: FormRules): void {
  const lines = Object.entries(errors)
    .map(([field, error]) => {
      const msg = typeof error?.message === 'string' ? error.message : undefined
      if (!msg) return null
      const label = rules[field]?.label
      return label ? `${label}: ${msg}` : msg
    })
    .filter((line): line is string => line !== null)

  if (lines.length > 0) {
    useToastStore.getState().push(lines.join('\n'))
  }
}
