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

Next.js 14 app (App Router) that generates SEO keyword visualizations using OpenAI and D3.js.

### Data Flow

1. User enters topic in `TopicInput` → `page.tsx` POSTs to `/api/analyze`
2. API calls OpenAI (gpt-3.5-turbo) with SEO expert system prompt
3. Response parsed via regex into `{ text: string, size: number }[]` (size = score × 10)
4. `WordBubble` renders D3.js force-directed bubble visualization

### Key Files

- `src/app/api/analyze/route.ts` - OpenAI integration, keyword parsing with fallback
- `src/components/WordBubble.tsx` - D3.js force simulation with neumorphic SVG filters
- `src/components/TopicInput.tsx` - Form with loading state
- `src/lib/utils.ts` - `cn()` utility (clsx + tailwind-merge)

### D3 Visualization Details

- Force simulation with charge, center, and collision forces
- Size scaling based on keyword scores (min 20px, max container/8)
- Neumorphic effect via SVG filter (blur, offset, specular lighting)
- ResizeObserver for responsive updates
- Hover animations on bubbles

### Environment

Requires `OPENAI_API_KEY` in `.env.local`

## Code Style

- TypeScript strict mode, no `any`
- Path alias: `@/*` → `./src/*`
- 2-space indent, single quotes, no semicolons
- Named exports for components with props interface
- API errors: `{ error: string }`, success: data array directly
