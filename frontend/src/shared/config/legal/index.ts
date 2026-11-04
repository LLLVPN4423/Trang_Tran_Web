import { businessInfo } from './businessInfo'
import { privacyConfig } from './privacyConfig'
import { transactionPolicy } from './transactionPolicy'
import { isPageReadyForFinalPublication } from './legalPages'
import type { LegalField, LegalPageMeta, OwnerInputGap, PagePublicationStatus } from './types'

export * from './types'
export { businessInfo } from './businessInfo'
export { privacyConfig } from './privacyConfig'
export { transactionPolicy } from './transactionPolicy'
export {
  legalPages,
  getLegalPageByPath,
  isPageReadyForFinalPublication,
  LEGAL_POLICY_VERSION,
  LEGAL_LAST_UPDATED,
} from './legalPages'

type AnyFieldMap = Record<string, LegalField<unknown>>

const FIELD_GROUPS: { group: string; configPathPrefix: string; fields: AnyFieldMap }[] = [
  { group: 'businessInfo', configPathPrefix: 'frontend/src/shared/config/legal/businessInfo.ts', fields: businessInfo as unknown as AnyFieldMap },
  { group: 'privacyConfig', configPathPrefix: 'frontend/src/shared/config/legal/privacyConfig.ts', fields: privacyConfig as unknown as AnyFieldMap },
  { group: 'transactionPolicy', configPathPrefix: 'frontend/src/shared/config/legal/transactionPolicy.ts', fields: transactionPolicy as unknown as AnyFieldMap },
]

/** Show labeled placeholders / status chips (never in production customer UI). */
export function showLegalDraftDiagnostics(): boolean {
  return Boolean(import.meta.env.DEV) || import.meta.env.VITE_LEGAL_DRAFT_UI === 'true'
}

export function collectOwnerInputGaps(): OwnerInputGap[] {
  const gaps: OwnerInputGap[] = []
  for (const { group, configPathPrefix, fields } of FIELD_GROUPS) {
    for (const [key, field] of Object.entries(fields)) {
      if (
        field.status === 'OWNER_INPUT_REQUIRED' ||
        field.status === 'LEGAL_REVIEW_REQUIRED' ||
        (field.value === null && field.status !== 'NOT_APPLICABLE' && field.status !== 'VERIFIED_FROM_CODE')
      ) {
        gaps.push({
          key: `${group}.${key}`,
          purpose: field.purpose,
          usedBy: [...field.usedBy],
          status: field.status,
          configPath: configPathPrefix,
        })
      }
    }
  }
  return gaps
}

export function collectLegalReviewItems(): OwnerInputGap[] {
  return collectOwnerInputGaps().filter((g) => g.status === 'LEGAL_REVIEW_REQUIRED')
}

export function resolveFieldDisplay(
  field: LegalField<string>,
): { kind: 'value'; text: string } | { kind: 'missing'; text: string } {
  if (field.value !== null && field.value !== undefined && String(field.value).trim() !== '') {
    return { kind: 'value', text: String(field.value) }
  }
  return {
    kind: 'missing',
    text: showLegalDraftDiagnostics()
      ? '【Chưa có — chờ chủ sở hữu cung cấp】'
      : 'Thông tin đang được cập nhật.',
  }
}

export function customerFacingPublicationLabel(status: PagePublicationStatus): string {
  switch (status) {
    case 'READY_FOR_OWNER_APPROVAL':
      return 'Bản nháp kỹ thuật đã đủ trường bắt buộc — chờ chủ sở hữu phê duyệt công bố.'
    case 'PENDING_LEGAL_REVIEW':
      return 'Nội dung đang chờ rà soát pháp lý bổ sung. Đây chưa phải bản công bố cuối cùng.'
    case 'PENDING_OWNER_INPUT':
      return 'Một số thông tin doanh nghiệp / chính sách đang được hoàn thiện. Đây chưa phải bản công bố pháp lý cuối cùng.'
    case 'DRAFT':
    default:
      return 'Tài liệu đang soạn thảo. Đây chưa phải bản công bố pháp lý cuối cùng.'
  }
}

export function pageHasBlockingGaps(page: LegalPageMeta): boolean {
  if (isPageReadyForFinalPublication(page)) return false
  const gaps = new Set(collectOwnerInputGaps().map((g) => g.key))
  return page.mandatoryFieldKeys.some((k) => gaps.has(k))
}

/** Single source for registration disclosure + privacy page version label. */
export function getPrivacyNoticeVersion(): string {
  return privacyConfig.noticeVersion.value ?? 'unversioned'
}

export function getPrivacyMaterialChangeId(): string {
  return privacyConfig.materialChangeId.value ?? getPrivacyNoticeVersion()
}
