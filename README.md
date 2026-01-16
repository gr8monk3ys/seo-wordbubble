# SEO WordBubble

AI-powered tool for creating word bubble visualizations that highlight top SEO keywords for any topic. Analyze and visualize keyword relevance and ranking to enhance content strategies and boost visibility.

## Features

- **AI-Powered Analysis**: Uses OpenAI GPT-3.5-turbo to generate relevant SEO keywords with relevance scores
- **Interactive Visualization**: D3.js force-directed bubble chart with neumorphic styling
- **Export Options**: Copy keywords to clipboard or export as CSV
- **Rate Limiting**: Client-side rate limiting to prevent API abuse
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 20.x (see `.nvmrc`)
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/gr8monk3ys/seo-wordbubble.git
cd seo-wordbubble

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your OPENAI_API_KEY
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

## Configuration

Create a `.env.local` file with the following variables:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

## Docker

### Production

```bash
docker-compose up app
```

### Development with Hot Reload

```bash
docker-compose --profile dev up dev
```

## Scripts

| Command                 | Description               |
| ----------------------- | ------------------------- |
| `npm run dev`           | Start development server  |
| `npm run build`         | Build for production      |
| `npm run start`         | Start production server   |
| `npm run lint`          | Run ESLint                |
| `npm run format`        | Format code with Prettier |
| `npm run test`          | Run tests                 |
| `npm run test:watch`    | Run tests in watch mode   |
| `npm run test:coverage` | Run tests with coverage   |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Visualization**: D3.js
- **AI**: OpenAI API
- **Testing**: Vitest + React Testing Library
- **Code Quality**: ESLint, Prettier, Husky

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/    # Keyword analysis endpoint
│   │   └── health/     # Health check endpoint
│   ├── globals.css
│   └── page.tsx
├── components/
│   ├── EmptyState.tsx
│   ├── ExportButtons.tsx
│   ├── KeywordList.tsx
│   ├── TopicInput.tsx
│   └── WordBubble.tsx
├── hooks/
│   └── useRateLimit.ts
├── lib/
│   ├── env.ts
│   └── utils.ts
└── test/
    └── setup.ts
```

## API Endpoints

### POST /api/analyze

Analyzes a topic and returns SEO keywords.

**Request:**

```json
{
  "topic": "digital marketing"
}
```

**Response:**

```json
[
  { "text": "SEO", "size": 900 },
  { "text": "Content Marketing", "size": 850 }
]
```

### GET /api/health

Returns service health status.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "0.1.0",
  "checks": {
    "openai": { "configured": true }
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private.
