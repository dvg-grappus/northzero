# Positioning Module

The positioning module is a core component of the brand positioning platform, handling the creation, management, and refinement of brand positioning elements.

## Architecture

### State Management

The module uses a combination of React Context and local state to manage:

1. **Step Progression**
   - `activeStep`: Current step in the positioning process
   - `completedSteps`: Array of completed steps
   - `openSteps`: Array of steps currently open for editing

2. **Positioning Elements**
   - Golden Circle (WHAT, HOW, WHY)
   - Opportunities and Challenges
   - Roadmap Milestones
   - Values
   - Differentiators

3. **Statements**
   - Internal (Onliness Statement)
   - External (Value Proposition)

### Database Flow

1. **Positioning Documents**
   ```mermaid
   graph LR
   A[Brief] --> B[OpenAI API]
   B --> C[positioning_documents]
   C --> D[positioning_items]
   D --> E[positioning_statements]
   ```

2. **Item States**
   - `selected`: Currently active items
   - `draft`: Alternative options
   - `archived`: Previously used items

### Timeline Management

1. **States**
   - `selected`: Items currently in the timeline
   - `draft`: Alternative options
   - `archived`: Previously used items

2. **Transitions**
   - Automatic state updates on selection
   - Drag-and-drop reordering
   - Context-aware suggestions

### Context-Aware Insights

1. **Trigger Points**
   - Step completion
   - Item selection
   - Statement updates
   - Timeline changes

2. **Insight Types**
   - `contradiction`: Flags conflicts between elements
   - `cliché-alert`: Identifies generic or overused language
   - `hot-tip`: Suggests improvements
   - `praise`: Notes strong combinations

3. **Generation Process**
   ```mermaid
   graph LR
   A[Current State] --> B[Context Builder]
   B --> C[OpenAI API]
   C --> D[Insight Widget]
   ```

### Generate More Workflow

1. **Context Building**
   - Current selections
   - Project brief
   - Existing options
   - User preferences

2. **API Integration**
   - Structured prompts
   - Context injection
   - Response parsing

3. **State Updates**
   - New options added as drafts
   - Automatic state management
   - UI updates

## Components

### Core Components

1. **PositioningProvider**
   - Manages global positioning state
   - Handles step progression
   - Coordinates state updates

2. **StepManager**
   - Controls step flow
   - Validates completions
   - Manages transitions

3. **InsightsWidget**
   - Displays context-aware insights
   - Handles insight generation
   - Manages insight states

### UI Components

1. **TimelineCard**
   - Displays positioning items
   - Handles drag-and-drop
   - Manages item states

2. **StatementBuilder**
   - Constructs positioning statements
   - Validates inputs
   - Manages alternatives

3. **GenerateMoreButton**
   - Triggers option generation
   - Manages loading states
   - Updates UI

## API Integration

### OpenAI Integration

1. **Prompts**
   - Structured templates
   - Context injection
   - Response parsing

2. **Endpoints**
   - `/api/positioning/generate`
   - `/api/positioning/insights`
   - `/api/positioning/statements`

### Supabase Integration

1. **Tables**
   - `positioning_documents`
   - `positioning_items`
   - `positioning_statements`
   - `insights`

2. **Operations**
   - Create/Read/Update/Delete
   - Real-time subscriptions
   - State synchronization

## Development Guidelines

### Adding New Features

1. **State Management**
   - Add to PositioningContext
   - Update types
   - Modify provider

2. **UI Components**
   - Follow component structure
   - Use shared styles
   - Implement error handling

3. **API Integration**
   - Add to services
   - Update types
   - Handle errors

### Testing

1. **Unit Tests**
   - Component rendering
   - State management
   - API integration

2. **Integration Tests**
   - User flows
   - State transitions
   - API responses

### Error Handling

1. **API Errors**
   - Retry logic
   - User feedback
   - State recovery

2. **Validation**
   - Input validation
   - State validation
   - Error messages

## Future Improvements

1. **Performance**
   - Optimize state updates
   - Reduce API calls
   - Improve caching

2. **Features**
   - Enhanced insights
   - More generation options
   - Better validation

3. **UX**
   - Improved feedback
   - Better error handling
   - Enhanced animations

## Module Development Patterns

### 1. Module Structure Template
```
src/modules/[module_name]/
├── components/           # Module-specific components
├── hooks/               # Module-specific hooks
├── services/           # Module-specific API calls
├── types/              # Module-specific types
├── utils/              # Module-specific utilities
├── constants.ts        # Module constants
├── context.tsx         # Module context
├── provider.tsx        # Module provider
└── README.md           # Module documentation
```

### 2. State Management Pattern
```typescript
// 1. Define types
type ModuleState = {
  activeStep: string;
  completedSteps: string[];
  openSteps: string[];
  // ... other state
};

// 2. Create context
const ModuleContext = createContext<{
  state: ModuleState;
  actions: ModuleActions;
}>(null);

// 3. Create provider
export const ModuleProvider: React.FC = ({ children }) => {
  const [state, setState] = useState<ModuleState>(initialState);
  
  const actions = {
    completeStep: (step: string) => {
      // Implementation
    },
    // ... other actions
  };

  return (
    <ModuleContext.Provider value={{ state, actions }}>
      {children}
    </ModuleContext.Provider>
  );
};
```

### 3. Database Integration Pattern
```typescript
// 1. Define table structure
type ModuleDocument = {
  id: string;
  project_id: string;
  version: number;
  raw_payload: any;
  created_at: string;
};

// 2. Create items table
type ModuleItem = {
  id: string;
  document_id: string;
  project_id: string;
  item_type: string;
  content: string;
  state: 'selected' | 'draft' | 'archived';
  idx: number;
};

// 3. Implement CRUD operations
const moduleService = {
  createDocument: async (data: CreateDocumentInput) => {
    // Implementation
  },
  createItems: async (documentId: string, items: CreateItemInput[]) => {
    // Implementation
  },
  // ... other operations
};
```

### 4. OpenAI Integration Pattern
```typescript
// 1. Define prompt structure
const MODULE_PROMPT = `
SYSTEM
You are a specialized AI for [module purpose].

USER
[Task description]

OUTPUT RULES
• Return *only* valid JSON.
• Follow the schema **exactly**.
• [Other rules]

JSON SCHEMA
{
  // Schema definition
}
`;

// 2. Implement generation service
const moduleGenerationService = {
  generate: async (context: GenerationContext) => {
    const prompt = buildPrompt(context);
    const response = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4-turbo-preview",
    });
    return parseResponse(response);
  },
};
```

### 5. Component Development Pattern
```typescript
// 1. Define component props
type ModuleComponentProps = {
  data: ModuleData;
  onUpdate: (data: Partial<ModuleData>) => void;
  state: 'selected' | 'draft' | 'archived';
};

// 2. Implement component
export const ModuleComponent: React.FC<ModuleComponentProps> = ({
  data,
  onUpdate,
  state,
}) => {
  // Implementation
};

// 3. Add to module provider
<ModuleProvider>
  <ModuleComponent />
  <ModuleInsights />
  <ModuleTimeline />
</ModuleProvider>
```

### 6. Testing Pattern
```typescript
// 1. Unit tests
describe('ModuleComponent', () => {
  it('renders correctly', () => {
    // Test implementation
  });
  
  it('handles state changes', () => {
    // Test implementation
  });
});

// 2. Integration tests
describe('Module Flow', () => {
  it('completes full module cycle', () => {
    // Test implementation
  });
});
```

### 7. Error Handling Pattern
```typescript
// 1. Define error types
type ModuleError = {
  code: string;
  message: string;
  details?: any;
};

// 2. Implement error handling
const handleModuleError = (error: ModuleError) => {
  switch (error.code) {
    case 'VALIDATION_ERROR':
      // Handle validation error
      break;
    case 'API_ERROR':
      // Handle API error
      break;
    default:
      // Handle unknown error
  }
};
```

### 8. Performance Optimization Pattern
```typescript
// 1. Implement memoization
const MemoizedComponent = React.memo(ModuleComponent, (prev, next) => {
  return prev.data.id === next.data.id;
});

// 2. Implement debouncing
const debouncedUpdate = useCallback(
  debounce((value: string) => {
    updateModule(value);
  }, 300),
  []
);

// 3. Implement caching
const useModuleCache = (key: string) => {
  const cache = useRef(new Map());
  return {
    get: () => cache.current.get(key),
    set: (value: any) => cache.current.set(key, value),
  };
};
```

## Module Development Checklist

1. **Setup**
   - [ ] Create module directory structure
   - [ ] Set up types and interfaces
   - [ ] Create context and provider
   - [ ] Set up database tables
   - [ ] Configure OpenAI integration

2. **Core Features**
   - [ ] Implement state management
   - [ ] Create base components
   - [ ] Set up API integration
   - [ ] Implement error handling
   - [ ] Add loading states

3. **Advanced Features**
   - [ ] Add insights generation
   - [ ] Implement "generate more" workflow
   - [ ] Add drag-and-drop functionality
   - [ ] Implement real-time updates
   - [ ] Add export/import functionality

4. **Testing**
   - [ ] Write unit tests
   - [ ] Write integration tests
   - [ ] Test error scenarios
   - [ ] Test performance
   - [ ] Test edge cases

5. **Documentation**
   - [ ] Document module structure
   - [ ] Document API endpoints
   - [ ] Document state management
   - [ ] Add usage examples
   - [ ] Document testing procedures

6. **Optimization**
   - [ ] Implement caching
   - [ ] Add performance monitoring
   - [ ] Optimize database queries
   - [ ] Implement lazy loading
   - [ ] Add error boundaries 