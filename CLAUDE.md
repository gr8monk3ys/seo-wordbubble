# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production
npm run lint     # Run ESLint
npm run start    # Start production server
```

## Architecture

This is a Next.js 14 app (App Router) that generates SEO keyword visualizations using OpenAI and D3.js.

### Data Flow
1. User enters a topic in `TopicInput` component
2. `page.tsx` sends POST request to `/api/analyze` with the topic
3. API route calls OpenAI (gpt-3.5-turbo) to generate SEO keywords with relevance scores
4. Response is parsed into `{ text, size }[]` format
5. `WordBubble` component renders D3.js force-directed bubble visualization

### Key Files
- `src/app/api/analyze/route.ts` - OpenAI integration, keyword parsing logic
- `src/components/WordBubble.tsx` - D3.js force simulation with neumorphic styling
- `src/components/TopicInput.tsx` - Form component for topic input
- `src/components/ui/` - Reusable UI primitives (Button, Input)

### Environment
Requires `OPENAI_API_KEY` in `.env.local` (see `.env.example`)

## Code Style

- TypeScript strict mode enabled
- Path alias: `@/*` maps to `./src/*`
- 2-space indentation, single quotes, no semicolons
- Named exports for components (props interface required)
- API responses: `{ error: string }` for errors, data array for success
