export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  EDITOR = 'EDITOR',
  CURATOR = 'CURATOR',
  REVIEWER = 'REVIEWER',
  VIEWER = 'VIEWER',
}

export enum ProjectDayStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  CURATION = 'CURATION',
  EDITING = 'EDITING',
  PUBLISHED = 'PUBLISHED',
}

export enum SocialPostStatus {
  PROGRAMADO = 'programado',
  ABIERTO = 'abierto',
  CERRADO = 'cerrado',
  PROCESADO = 'procesado',
  ARCHIVADO = 'archivado',
}

export enum Platform {
  TIKTOK = 'TIKTOK',
  INSTAGRAM = 'INSTAGRAM',
  FACEBOOK = 'FACEBOOK',
  WEB = 'WEB',
  OTHER = 'OTHER',
}

export enum DetailedContributionStatus {
  CAPTURED = 'captured',
  PENDING_VALIDATION = 'pending_validation',
  INVALID = 'invalid',
  VALID = 'valid',
  AI_REVIEWED = 'ai_reviewed',
  CURATOR_REVIEWED = 'curator_reviewed',
  SHORTLISTED = 'shortlisted',
  SELECTED = 'selected',
  REJECTED = 'rejected',
  ARCHIVED = 'archived',
}

export enum ContributionStatus {
  RECEIVED = 'RECEIVED',
  VALIDATING = 'VALIDATING',
  VALID = 'VALID',
  INVALID = 'INVALID',
  SELECTED = 'SELECTED',
  REPLACEMENT_CANDIDATE = 'REPLACEMENT_CANDIDATE',
  EDITORIAL_REVIEW = 'EDITORIAL_REVIEW',
  APPROVED = 'APPROVED',
  INCORPORATED = 'INCORPORATED',
  REJECTED = 'REJECTED',
}

export enum CharacterStatus {
  ALIVE = 'ALIVE',
  DEAD = 'DEAD',
  MISSING = 'MISSING',
  UNKNOWN = 'UNKNOWN',
}

export enum MysteryStatus {
  OPEN = 'OPEN',
  PARTIALLY_RESOLVED = 'PARTIALLY_RESOLVED',
  RESOLVED = 'RESOLVED',
  ABANDONED = 'ABANDONED',
}

export enum NarrativeSeedStatus {
  OPEN = 'OPEN',
  DEVELOPING = 'DEVELOPING',
  CONNECTED = 'CONNECTED',
  RESOLVED = 'RESOLVED',
  DISCARDED = 'DISCARDED',
}

export enum ContinuityIssueSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}
