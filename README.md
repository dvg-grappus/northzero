# Brand Positioning Platform

A comprehensive platform for brand positioning and strategy development, built with React, TypeScript, and Supabase.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── config/        # Configuration files and constants
├── constants/     # Application-wide constants
├── contexts/      # React context providers
├── hooks/         # Custom React hooks
├── lib/           # Core libraries and utilities
├── pages/         # Page components
├── providers/     # Context providers
├── services/      # API and external service integrations
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

## Database Structure

### Core Tables

1. **projects**
   - Primary table for all projects
   - Contains project metadata and status

2. **positioning_documents**
   - Stores raw OpenAI responses
   - Acts as seed data for positioning items
   - One document per project version
   - Never modified after creation

3. **positioning_items**
   - Generated from positioning_documents
   - Represents individual positioning elements
   - States: selected, draft, archived
   - Types: WHAT, HOW, WHY, OPPORTUNITY, CHALLENGE, MILESTONE, VALUE, WHILE_OTHERS, WE_ARE_THE_ONLY

4. **positioning_statements**
   - Stores final positioning statements
   - Links to positioning items
   - Types: internal, external

5. **insights**
   - Context-aware insights
   - Types: tip, opinion, warning, contradiction, praise
   - Auto-generated based on positioning state

## Key Features

### 1. Positioning Module
- Step-by-step positioning development
- Real-time validation and suggestions
- Context-aware insights
- Generate more options workflow

### 2. Timeline Management
- Three states: selected, draft, archived
- Automatic state transitions
- Drag-and-drop reordering
- Context-aware suggestions

### 3. OpenAI Integration
- Structured prompts for consistent outputs
- Context-aware insights generation
- Generate more options workflow
- Statement refinement

### 4. State Management
- React Context for global state
- Step-based progression
- Real-time validation
- Automatic state transitions

## Development

### Prerequisites
- Node.js 18+
- Supabase account
- OpenAI API key

### Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run migrations: `npm run migrate`
5. Start development server: `npm run dev`

### Environment Variables
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details
