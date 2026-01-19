import { z } from 'zod'

export const SearchIntentSchema = z.enum(['informational', 'navigational', 'transactional', 'commercial'])
export type SearchIntent = z.infer<typeof SearchIntentSchema>

export const DifficultySchema = z.enum(['low', 'medium', 'high'])
export type Difficulty = z.infer<typeof DifficultySchema>

export const KeywordDataSchema = z.object({
  text: z.string(),
  size: z.number().min(10).max(1000),
  relevanceScore: z.number().min(1).max(100),
  searchIntent: SearchIntentSchema,
  difficulty: DifficultySchema,
  variations: z.array(z.string())
})

export type KeywordData = z.infer<typeof KeywordDataSchema>

export const KeywordDataArraySchema = z.array(KeywordDataSchema)
