# Plant Scanner App

A cross-platform plant identification and garden management application built with Taro 3 + React + TypeScript.

## Features

- 🌿 **Plant Identification**: Scan or upload photos to identify plants using AI
- 📚 **Care Guides**: Detailed care instructions for each plant species
- 🏡 **Garden Management**: Track your plants and their care schedules
- ⏰ **Smart Reminders**: Never forget to water, fertilize, or prune your plants
- 📱 **Cross-Platform**: Works on H5, WeChat Mini Program, Alipay, and more

## Tech Stack

- **Framework**: Taro 3 (React)
- **Language**: TypeScript
- **State Management**: Zustand + TanStack Query
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **API**: Vercel Serverless Functions
- **Plant Recognition**: PlantNet API
- **UI**: NutUI + Custom Tailwind-like styles

## Project Structure

```
plant-scanner/
├── apps/
│   ├── h5/           # H5 web application
│   ├── miniapp/      # Mini programs (WeChat, Alipay, etc.)
│   └── native/       # React Native apps (future)
├── packages/
│   ├── core/         # Shared types, services, stores
│   └── ui/           # Shared UI components
├── api/              # Vercel Serverless API routes
├── supabase/         # Database schema and migrations
├── scripts/
│   └── data-sync/    # Data synchronization scripts
└── docs/             # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+ or pnpm
- Supabase account

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd plant-scanner

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase and API credentials

# Initialize the database
# Run the SQL schema in supabase/schema.sql in Supabase SQL Editor

# Start development server
npm run dev:h5       # H5
npm run dev:weapp    # WeChat Mini Program
```

### Environment Variables

Create a `.env` file with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# PlantNet API
PLANTNET_API_KEY=your-plantnet-api-key

# Vercel (for production)
VERCEL_TOKEN=your-vercel-token
```

## Development

### Available Scripts

```bash
# Development
npm run dev:h5        # Start H5 dev server
npm run dev:weapp     # Start WeChat Mini Program dev server

# Build
npm run build:h5      # Build H5
npm run build:weapp   # Build WeChat Mini Program
npm run build:alipay  # Build Alipay Mini Program

# Code Quality
npm run lint          # Run ESLint
npm run format        # Format code with Prettier
npm run type-check    # Type check all packages

# Database Sync
npm run data-sync     # Sync plant data from external sources
```

## Deployment

### H5 (Vercel)

1. Connect repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main

### WeChat Mini Program

1. Build with `npm run build:weapp`
2. Upload to WeChat DevTools
3. Submit for review

## Data Sources

- **GBIF**: Taxonomy and scientific names
- **Wikidata**: Chinese names and aliases
- **iNaturalist**: CC-licensed images
- **OpenFarm**: Care profiles

See `scripts/data-sync/` for synchronization details.

## License

MIT
