/** Field / page publication statuses for legal content (Phase 1A). */

export type FieldInputStatus =
  | 'CONFIRMED'
  | 'OWNER_INPUT_REQUIRED'
  | 'LEGAL_REVIEW_REQUIRED'
  | 'NOT_APPLICABLE'
  | 'VERIFIED_FROM_CODE'

export type PagePublicationStatus =
  | 'DRAFT'
  | 'PENDING_OWNER_INPUT'
  | 'PENDING_LEGAL_REVIEW'
  | 'READY_FOR_OWNER_APPROVAL'

export type LegalField<T> = {
  /** Display value when status allows; null when missing. Never invent. */
  value: T | null
  status: FieldInputStatus
  /** Why this field exists (for owner report). */
  purpose: string
  /** Routes / workflows that consume this field. */
  usedBy: string[]
  /** True = may appear in customer-facing production UI when value is set. */
  customerFacing: boolean
}

export type LegalPageMeta = {
  id: string
  path: string
  title: string
  shortTitle: string
  description: string
  version: string
  lastUpdated: string
  publicationStatus: PagePublicationStatus
  /** Fields that must be filled before READY_FOR_OWNER_APPROVAL. */
  mandatoryFieldKeys: string[]
}

export type OwnerInputGap = {
  key: string
  purpose: string
  usedBy: string[]
  status: FieldInputStatus
  configPath: string
}
