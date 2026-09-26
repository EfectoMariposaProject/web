import {
  UserRole,
  ProjectDayStatus,
  SocialPostStatus,
  Platform,
  ContributionStatus,
  DetailedContributionStatus,
  CharacterStatus,
  MysteryStatus,
  NarrativeSeedStatus,
  ContinuityIssueSeverity,
} from './enums';

export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  start_date: string;
  end_date?: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
  daily_word_limit: number;
  daily_selected_contributions: number;
  max_selected_per_user: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectDay {
  id: string;
  project_id: string;
  day_number: number;
  date: string;
  week_number: number;
  status: ProjectDayStatus;
  narrative_line?: string; // Guía temática del día
  opening_text?: string;
  closing_text?: string;
  editorial_notes?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SocialPost {
  id: string;
  project_day_id: string;
  challenge_day: number;
  platform: Platform;
  platform_post_id?: string;
  post_url?: string;
  caption?: string;
  narrative_line?: string;
  opens_at: string;
  closes_at?: string;
  comments_locked_at?: string;
  last_checked_at?: string;
  status: SocialPostStatus;
  created_at: string;
}

export interface Participant {
  id: string;
  platform: Platform;
  platform_user_id: string;
  username: string;
  display_name?: string;
  profile_url?: string;
  avatar_url?: string;
  selected_count: number;
  is_blocked: boolean;
  declared_18_plus: boolean; // Hard Rule 1
  terms_accepted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Contribution {
  id: string;
  project_id: string;
  project_day_id: string;
  social_post_id?: string;
  
  // Hard Rule 2: Dual Consecutive IDs
  global_comment_code: string; // EMP-COM-000001
  daily_comment_code: string;  // D01-C0001
  internal_id: string;         // Alias for backward compatibility

  participant_id: string;
  author_handle?: string;
  author_name?: string;
  author_avatar_url?: string;
  author_profile_url?: string;
  likes?: number | string;
  replies?: number | string;
  language?: string;
  platform_comment_id?: string;
  platform_comment_url?: string;
  original_text: string;
  original_hash: string;       // SHA-256
  normalized_text: string;
  word_count: number;
  capture_sequence: number;
  global_sequence?: number;
  received_at: string;

  // Hard Rule 1 & 4 Status Flags
  age_declaration_status: 'declared_18_plus' | 'invalid_age_detected';
  terms_accepted: boolean;
  late_comment: boolean;       // Recibido fuera de la ventana activa del día

  status: ContributionStatus | DetailedContributionStatus | string;
  validation_status: 'PENDING' | 'VALID' | 'INVALID';
  validation_reasons?: string[];
  selected_by_rule: boolean;
  replacement_for_contribution_id?: string;
  editorial_version?: string;
  final_version?: string;
  essence_preserved?: boolean;
  editorial_notes?: string;
  ai_analysis_json?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DailySelectionRule {
  id: string;
  project_day_id: string;
  slot_number: number;
  target_sequence: number;
  selected_contribution_id?: string;
  replacement_applied: boolean;
  replacement_reason?: string;
  created_at: string;
}

export interface SelectionAuditLog {
  id: string;
  project_day_id: string;
  selection_slot: number;
  initial_target: number;
  candidate_sequence: number;
  contribution_id?: string;
  valid: boolean;
  reason: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity: string;
  entity_id: string;
  previous_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  reason?: string;
  timestamp: string;
}

export interface ValidationRuleResult {
  ruleNumber: number;
  ruleName: string;
  passed: boolean;
  reason?: string;
}

export interface ValidationResult {
  valid: boolean;
  wordCount: number;
  expectedWordCount: number;
  authorEligible: boolean;
  declared18Plus: boolean;
  withinActiveWindow: boolean;
  ruleResults: ValidationRuleResult[];
  reasons: string[];
}
