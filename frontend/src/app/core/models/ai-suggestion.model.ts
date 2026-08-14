// ============================================================
// Global Models — AI Assistant Domain
// ============================================================

export type AiSuggestionType =
  | 'upsell'
  | 'allergy_warning'
  | 'missing_info'
  | 'delivery_risk'
  | 'kitchen_overload'
  | 'loyalty_reward'
  | 'substitution';

export type AiStreamingState =
  | 'idle'
  | 'loading'
  | 'streaming'
  | 'complete'
  | 'error'
  | 'retrying';

export type AiSeverity = 'info' | 'warning' | 'critical' | 'success';

export interface AiSuggestion {
  id: string;
  orderId: string;
  type: AiSuggestionType;
  severity: AiSeverity;
  title: string;
  message: string;
  streamedMessage: string;   // partial during streaming
  actionLabel?: string;
  actionPayload?: Record<string, unknown>;
  generatedAt: Date;
  confidence: number;        // 0–1
}

export interface AiAssistantState {
  orderId: string;
  suggestions: AiSuggestion[];
  streamingState: AiStreamingState;
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
  lastFetchedAt?: Date;
}

export const AI_SUGGESTION_ICONS: Record<AiSuggestionType, string> = {
  upsell:           '🎯',
  allergy_warning:  '⚠️',
  missing_info:     '📋',
  delivery_risk:    '🚚',
  kitchen_overload: '🔥',
  loyalty_reward:   '⭐',
  substitution:     '🔄',
};

export const AI_SEVERITY_COLORS: Record<AiSeverity, string> = {
  info:     '#60a5fa',
  warning:  '#fbbf24',
  critical: '#f87171',
  success:  '#34d399',
};
