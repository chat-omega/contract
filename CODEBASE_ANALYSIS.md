# Codebase Structure Analysis - Legal Tech Chat

## Project Overview
This is a full-stack application built with:
- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Python FastAPI + LangChain + LangGraph
- **Database**: Neo4j (for contract data)
- **LLM Support**: OpenAI, Google Gemini, Anthropic, Mistral
- **Architecture**: Event-streaming responses via Server-Sent Events (SSE)

---

## 1. FRONTEND STRUCTURE

### Directory Layout
```
legal-tech-chat/frontend/
├── src/
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # React entry point
│   ├── index.css            # Tailwind + theme configuration
│   ├── App.css              # Container styles
│   ├── vite-env.d.ts        # Vite type definitions
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── select.tsx
│   │   │   └── loader.tsx
│   │   ├── chat/            # Chat-specific components
│   │   │   ├── index.tsx    # Main chat container
│   │   │   ├── provider.tsx # Chat context/state management
│   │   │   ├── input.tsx    # Chat input form
│   │   │   ├── output.tsx   # Chat messages display
│   │   │   └── message.tsx  # Individual message component
│   │   └── theme-provider.tsx # Dark/light mode theme
│   ├── lib/
│   │   └── utils.ts         # Utility functions (cn)
│   ├── pages/
│   │   └── index.tsx        # Page components (currently minimal)
│   └── assets/
├── Dockerfile
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts (Tailwind 4 + Vite)
└── components.json          # Component metadata

```

### Key Files with Absolute Paths

**App Component:**
- `/home/ubuntu/contract1/legal-tech-chat/frontend/src/App.tsx`

**Theme Provider (Context API):**
- `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/theme-provider.tsx`

**Chat Provider (State Management):**
- `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/chat/provider.tsx`

**Chat Components:**
- `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/chat/index.tsx`
- `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/chat/input.tsx`
- `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/chat/output.tsx`
- `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/chat/message.tsx`

**UI Components:**
- `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/ui/button.tsx`
- `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/ui/card.tsx`
- `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/ui/textarea.tsx`
- `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/ui/select.tsx`
- `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/ui/loader.tsx`

**Styling & Theme:**
- `/home/ubuntu/contract1/legal-tech-chat/frontend/src/index.css`
- `/home/ubuntu/contract1/legal-tech-chat/frontend/src/App.css`
- `/home/ubuntu/contract1/legal-tech-chat/frontend/vite.config.ts`

### Design System Details

**UI Framework:** Custom components built on:
- Radix UI primitives (@radix-ui/react-select, @radix-ui/react-slot)
- Tailwind CSS 4 (latest version with Vite plugin)
- Lucide React icons

**Color Scheme (OKLCH Color Space):**

Light Mode:
- Background: `oklch(1 0 0)` (white)
- Foreground: `oklch(0.141 0.005 285.823)` (dark text)
- Primary: `oklch(0.21 0.006 285.885)` (dark blue/purple)
- Primary Foreground: `oklch(0.985 0 0)` (white text on primary)
- Secondary: `oklch(0.967 0.001 286.375)` (light)
- Accent: `oklch(0.967 0.001 286.375)` (light)
- Muted: `oklch(0.967 0.001 286.375)`
- Destructive: `oklch(0.577 0.245 27.325)` (red/orange)

Dark Mode:
- Background: `oklch(0.141 0.005 285.823)` (dark)
- Foreground: `oklch(0.985 0 0)` (white text)
- Primary: `oklch(0.92 0.004 286.32)` (light)
- Primary Foreground: `oklch(0.21 0.006 285.885)` (dark text on primary)
- Card: `oklch(0.21 0.006 285.885)` (dark card)
- Destructive: `oklch(0.704 0.191 22.216)` (lighter red)

**Styling Utilities:**
- `cn()` function: Combines clsx + tailwind-merge for conditional Tailwind classes
- Located at: `/home/ubuntu/contract1/legal-tech-chat/frontend/src/lib/utils.ts`

### Dependencies
```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "tailwindcss": "^4.0.14",
  "@tailwindcss/vite": "^4.0.14",
  "@radix-ui/react-select": "^2.1.6",
  "@radix-ui/react-slot": "^1.1.2",
  "lucide-react": "^0.482.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.0.2",
  "tailwindcss-animate": "^1.0.7",
  "@microsoft/fetch-event-source": "^2.0.1"
}
```

### State Management Pattern

**Theme (Context API):**
```typescript
// Hook pattern
const { theme, setTheme } = useTheme()
// Values: "dark" | "light" | "system"
```

**Chat (Context API):**
```typescript
// Hook pattern
const { messages, addMessage, addMessagePart, updateMessageGenerating, reset } = useChat()

// Types
type Message = {
  id: string
  type: "user" | "ai"
  parts: MessagePart[]
  generating: boolean
}

type MessagePart = {
  type: MessagePartType  // "user_message" | "ai_message" | "tool_call" | "tool_message" | "history" | "end"
  content: string
}
```

### API Integration Pattern

Uses Server-Sent Events (SSE) via `@microsoft/fetch-event-source`:

```typescript
// Example from input.tsx
await fetchEventSource(BACKEND_URL + '/run/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ model, prompt, history: JSON.stringify(history.current) }),
  onmessage(event) {
    const data: MessagePart = JSON.parse(event.data)
    // Handle streaming data
  }
})
```

---

## 2. BACKEND STRUCTURE

### Directory Layout
```
legal-tech-chat/backend/
├── main.py                  # FastAPI app + routes
├── agent_manager.py         # LLM initialization & management
├── agent.py                 # LangGraph agent setup
├── tools/
│   ├── __init__.py
│   ├── contract_search_tool.py  # Contract search tool
│   └── utils.py            # Utility functions
├── Dockerfile
├── pyproject.toml          # Python dependencies
├── uv.lock                 # Locked dependencies
├── .env.example
└── __init__.py

```

### Key Files with Absolute Paths

**Main FastAPI App:**
- `/home/ubuntu/contract1/legal-tech-chat/backend/main.py`

**Agent Manager (LLM initialization):**
- `/home/ubuntu/contract1/legal-tech-chat/backend/agent_manager.py`

**Agent (LangGraph setup):**
- `/home/ubuntu/contract1/legal-tech-chat/backend/agent.py`

**Contract Search Tool:**
- `/home/ubuntu/contract1/legal-tech-chat/backend/tools/contract_search_tool.py`

**Utilities:**
- `/home/ubuntu/contract1/legal-tech-chat/backend/tools/utils.py`

### Dependencies
```
fastapi[standard]>=0.115.11
langchain-anthropic>=0.3.10
langchain-community>=0.3.20
langchain-google-genai>=2.1.1
langchain-mistralai>=0.2.9
langchain-neo4j>=0.4.0
langchain-openai>=0.3.10
langgraph>=0.3.18
pydantic>=2.10.6
python-dotenv>=1.0.1
```

### API Routes

**Endpoint: GET /**
```python
@app.get("/")
async def root():
    return {"status": "OK"}
```

**Endpoint: POST /run/**
```python
@app.post("/run/")
async def run(payload: RunPayload):
    return StreamingResponse(
        runner(model=payload.model, prompt=payload.prompt, history=payload.history),
        media_type="text/event-stream",
    )
```

**Payload Model:**
```python
class RunPayload(BaseModel):
    model: str          # e.g., "gemini-2.0-flash", "gpt-4o"
    prompt: str         # User query
    history: str        # JSON stringified message history
```

### Streaming Response Format

The backend streams data as Server-Sent Events (SSE):

```
data: {"content": "...", "type": "user_message"}\n\n
data: {"content": "...", "type": "ai_message"}\n\n
data: {"content": {...}, "type": "tool_call"}\n\n
data: {"content": "...", "type": "tool_message"}\n\n
data: {"content": [...], "type": "history"}\n\n
data: {"content": "", "type": "end"}\n\n
```

### LLM Support

Managed in `AgentManager` class:

```python
# Supported models
{
  "gpt-4o": ChatOpenAI(model="gpt-4o", temperature=0),
  "gemini-1.5-pro": ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0),
  "gemini-2.0-flash": ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0),
  "sonnet-3.5": ChatAnthropic(model="claude-3-5-sonnet-latest", temperature=0),
  "mistral-large": ChatMistralAI(model="mistral-large-latest")
}
```

Each model is initialized with API keys from environment variables:
- `OPENAI_API_KEY`
- `GOOGLE_API_KEY`
- `ANTHROPIC_API_KEY`
- `MISTRAL_API_KEY`

### Agent Architecture (LangGraph)

**Graph Structure:**
```
START → assistant (invoke LLM) → conditional edge
                                 ├→ has tool_calls → tools node → assistant (loop)
                                 └→ no tool_calls → END
```

**System Message:**
```
"You are a helpful assistant tasked with finding and explaining relevant information 
about internal contracts. Always explain results you get from the tools in a concise 
manner to not overwhelm the user but also don't be too technical. Answer questions as 
if you are answering to non-technical management level. Important: Be confident and 
accurate in your tool choice! Avoid asking follow-up questions if possible."
```

### Tool: ContractSearch

**Tool Location:** `/home/ubuntu/contract1/legal-tech-chat/backend/tools/contract_search_tool.py`

**Input Schema:**
```python
class ContractInput(BaseModel):
    min_effective_date: Optional[str]      # YYYY-MM-DD
    max_effective_date: Optional[str]      # YYYY-MM-DD
    min_end_date: Optional[str]            # YYYY-MM-DD
    max_end_date: Optional[str]            # YYYY-MM-DD
    contract_type: Optional[str]           # Enum of contract types
    parties: Optional[List[str]]           # List of party names
    summary_search: Optional[str]          # Vector search
    active: Optional[bool]                 # Currently active?
    governing_law: Optional[Location]      # Country/state
    monetary_value: Optional[MonetaryValue] # Amount with operator
    cypher_aggregation: Optional[str]      # Custom Cypher for analytics
```

**Database Connection:**
- Neo4j Graph database with node types: `Contract`, `Party`, `Country`
- Relationships: `PARTY_TO`, `HAS_GOVERNING_LAW`, `LOCATED_IN`
- Vector embeddings using Google Generative AI Embeddings

**Contract Types Supported:**
```python
[
    "Affiliate Agreement", "Development", "Distributor", "Endorsement",
    "Franchise", "Hosting", "IP", "Joint Venture", "License Agreement",
    "Maintenance", "Manufacturing", "Marketing", "Non Compete/Solicit",
    "Outsourcing", "Promotion", "Reseller", "Service", "Sponsorship",
    "Strategic Alliance", "Supply", "Transportation"
]
```

### Environment Variables

**Backend (.env):**
```
NEO4J_URI=neo4j+s://demo.neo4jlabs.com:7687
NEO4J_USERNAME=legalcontracts
NEO4J_PASSWORD=legalcontracts
NEO4J_DATABASE=legalcontracts
GOOGLE_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
MISTRAL_API_KEY=
```

**Frontend (.env):**
```
VITE_BACKEND_URL=http://localhost:8000
```

### CORS Configuration

```python
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],      # All origins allowed
    allow_methods=["*"],      # All HTTP methods
    allow_headers=["*"],      # All headers
)
```

---

## 3. DOCKER CONFIGURATION

**Docker Compose File:** `/home/ubuntu/contract1/legal-tech-chat/docker-compose.yml`

**Services:**

1. **Backend Service**
   - Build: `./backend`
   - Ports: 8000:8000
   - Language: Python 3.12
   - Runtime: FastAPI dev server

2. **UI (Frontend) Service**
   - Build: `./frontend`
   - Ports: 5173:5173
   - Runtime: Vite dev server

**Hot Reload Watches:**
- Backend watches: `./backend` directory
- Frontend watches: `./frontend` directory

**Network:** Internal Docker network `net` for service communication

---

## 4. COMPONENT PATTERNS & BEST PRACTICES

### Button Component Pattern
```typescript
// Located: /home/ubuntu/contract1/legal-tech-chat/frontend/src/components/ui/button.tsx

import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva("base-classes", {
  variants: {
    variant: {
      default: "...",
      destructive: "...",
      outline: "...",
      secondary: "...",
      ghost: "...",
      link: "..."
    },
    size: {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md",
      lg: "h-10 rounded-md px-6",
      icon: "size-9"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
})

// Usage:
<Button variant="outline" size="sm">Text</Button>
```

### Card Component Pattern
```typescript
// Located: /home/ubuntu/contract1/legal-tech-chat/frontend/src/components/ui/card.tsx

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content here</CardContent>
  <CardFooter>Footer here</CardFooter>
</Card>
```

### Form Input Pattern
```typescript
// Textarea and Select components use consistent patterns:
// - data-slot attribute for styling hooks
// - cn() for conditional Tailwind classes
// - Accessibility attributes (aria-invalid, focus-visible)
// - Dark mode support via CSS variables
```

### Chat State Management Pattern
```typescript
// Location: /home/ubuntu/contract1/legal-tech-chat/frontend/src/components/chat/provider.tsx

// 1. Define types
type Message = { id: string; type: "user" | "ai"; parts: MessagePart[] }

// 2. Create Context
const ChatProviderContext = createContext<ChatProviderState>(initialState)

// 3. Provide via Provider component
export function ChatProvider({ children }) { ... }

// 4. Use via hook
export const useChat = () => { ... }
```

---

## 5. IMPLEMENTATION GUIDE FOR "CORP DEV AGENT" FEATURE

### Frontend: Add Wizard/Stepper Page

**Create:** `/home/ubuntu/contract1/legal-tech-chat/frontend/src/pages/corp-dev-agent.tsx`

Use patterns from:
- Card components for steps
- Button variants (default, outline, secondary)
- Form inputs (Textarea, Select patterns)
- Theme provider for dark/light mode

Example structure:
```typescript
type Step = "company-info" | "financial-data" | "risk-assessment" | "target-profile" | "review"

function CorpDevAgent() {
  const [currentStep, setCurrentStep] = useState<Step>("company-info")
  const { theme } = useTheme()
  
  return (
    <div className="flex flex-col gap-4 h-full">
      <StepIndicator currentStep={currentStep} />
      <div className="flex-1">
        {currentStep === "company-info" && <CompanyInfoStep />}
        {/* other steps */}
      </div>
      <NavigationButtons />
    </div>
  )
}
```

### Backend: Add New Agent Tool

**Create:** `/home/ubuntu/contract1/legal-tech-chat/backend/tools/corp_dev_tool.py`

Pattern from `ContractSearchTool`:

```python
from langchain_core.tools import BaseTool
from pydantic import BaseModel, Field
from typing import Optional, Type

class CorpDevInput(BaseModel):
    company_name: str = Field(..., description="Target company name")
    industry: str = Field(..., description="Industry sector")
    financial_data: dict = Field(..., description="Financial metrics")

class CorpDevTool(BaseTool):
    name: str = "CorpDevAnalysis"
    description: str = "Analyze targets for corporate development opportunities"
    args_schema: Type[BaseModel] = CorpDevInput
    
    def _run(self, company_name: str, industry: str, financial_data: dict) -> str:
        # Implementation here
        pass
```

### Backend: Integrate New Tool

**Modify:** `/home/ubuntu/contract1/legal-tech-chat/backend/agent.py`

```python
from backend.tools.corp_dev_tool import CorpDevTool

def get_agent(llm):
    tools = [ContractSearchTool(), CorpDevTool()]  # Add new tool
    llm_with_tools = llm.bind_tools(tools)
    # ... rest of agent setup
```

### Frontend: Navigation Setup

**Modify:** `/home/ubuntu/contract1/legal-tech-chat/frontend/src/App.tsx`

```typescript
function App() {
  const [currentPage, setCurrentPage] = useState<"chat" | "corp-dev">("chat")
  
  return (
    <ThemeProvider>
      <div className="mx-auto h-full max-w-4xl p-4 flex flex-col">
        <Navigation onPageChange={setCurrentPage} />
        <div className="flex-1">
          {currentPage === "chat" && <Chat />}
          {currentPage === "corp-dev" && <CorpDevAgent />}
        </div>
      </div>
    </ThemeProvider>
  )
}
```

---

## 6. KEY FILE SUMMARY TABLE

| Component | File Path | Purpose |
|-----------|-----------|---------|
| Main App | `/home/ubuntu/contract1/legal-tech-chat/frontend/src/App.tsx` | App root, routing |
| Theme Provider | `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/theme-provider.tsx` | Dark/light mode via Context |
| Chat Provider | `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/chat/provider.tsx` | Chat state via Context |
| Chat Container | `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/chat/index.tsx` | Wraps input/output |
| Chat Input | `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/chat/input.tsx` | Form + SSE communication |
| Chat Output | `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/chat/output.tsx` | Message display |
| Theme CSS | `/home/ubuntu/contract1/legal-tech-chat/frontend/src/index.css` | OKLCH colors, Tailwind config |
| Button | `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/ui/button.tsx` | CVA-based button variants |
| Card | `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/ui/card.tsx` | Composable card layout |
| Textarea | `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/ui/textarea.tsx` | Form input |
| Select | `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/ui/select.tsx` | Dropdown (Radix-based) |
| FastAPI App | `/home/ubuntu/contract1/legal-tech-chat/backend/main.py` | API endpoints, SSE streaming |
| Agent Manager | `/home/ubuntu/contract1/legal-tech-chat/backend/agent_manager.py` | LLM initialization |
| Agent Graph | `/home/ubuntu/contract1/legal-tech-chat/backend/agent.py` | LangGraph workflow |
| Contract Tool | `/home/ubuntu/contract1/legal-tech-chat/backend/tools/contract_search_tool.py` | Database search tool |

---

## 7. TECHNOLOGY STACK SUMMARY

| Layer | Technology | Version/Details |
|-------|-----------|-----------------|
| Frontend UI Framework | React | 19.0.0 |
| Frontend Styling | Tailwind CSS | 4.0.14 + OKLCH colors |
| Frontend UI Components | Radix UI | select, slot |
| Frontend Icons | Lucide React | 0.482.0 |
| Frontend HTTP | fetch-event-source | SSE support |
| Frontend State | Context API | Theme, Chat |
| Backend Framework | FastAPI | 0.115.11+ |
| Backend LLM Framework | LangChain | Multiple modules |
| Backend Workflow | LangGraph | 0.3.18+ |
| Backend DB | Neo4j | Graph database |
| Backend DB ORM | langchain-neo4j | 0.4.0+ |
| Embeddings | Google Generative AI | text-embedding-004 |
| LLM Providers | OpenAI, Google, Anthropic, Mistral | Multiple |
| Runtime | Python | 3.12 |
| Build Tool | Vite | 6.2.0 |
| Package Manager (Backend) | uv | Latest |
| Containerization | Docker + Compose | - |
| Type Safety (Frontend) | TypeScript | 5.7.2 |
| Type Safety (Backend) | Pydantic | 2.10.6+ |

