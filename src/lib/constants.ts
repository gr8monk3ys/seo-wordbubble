import type { SearchIntent, Difficulty } from '@/types/keywords'

export const INTENT_COLORS: Record<SearchIntent, string> = {
  informational: '#6d5dfc',
  navigational: '#00b4d8',
  transactional: '#2ecc71',
  commercial: '#f39c12'
}

export const INTENT_LABELS: Record<SearchIntent, string> = {
  informational: 'Informational',
  navigational: 'Navigational',
  transactional: 'Transactional',
  commercial: 'Commercial'
}

export const DIFFICULTY_OPACITY: Record<Difficulty, number> = {
  low: 1,
  medium: 0.8,
  high: 0.6
}
