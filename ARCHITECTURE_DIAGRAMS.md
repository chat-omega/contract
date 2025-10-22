# Architecture Diagrams & Data Flow

## 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 19)                       │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  App.tsx (Main Container)                                  │ │
│  │  - ThemeProvider (Dark/Light Mode)                         │ │
│  │  - Route: /chat → Chat Component                           │ │
│  │  - Route: /corp-dev → CorpDevAgent Component               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌──────────────────────────┐  ┌──────────────────────────┐    │
│  │    Chat Module           │  │  Corp Dev Module         │    │
│  │  (Existing Feature)      │  │  (New Feature)           │    │
│  │                          │  │                          │    │
│  │ ┌──────────────────────┐ │  │ ┌──────────────────────┐ │    │
│  │ │  ChatProvider        │ │  │ │  CorpDevProvider     │ │    │
│  │ │  (Context + State)   │ │  │ │  (Context + State)   │ │    │
│  │ └──────────────────────┘ │  │ └──────────────────────┘ │    │
│  │          |                │  │          |               │    │
│  │  ┌──────┴────────────┐   │  │  ┌──────┴────────┐      │    │
│  │  |                   |   │  │  |                |      │    │
│  │  v                   v   │  │  v                v      │    │
│  │ ChatInput         ChatOutput │ Stepper      StepComponents  │
│  │ (Form)            (Display)  │ (Wizard UI)  (Forms)         │
│  │                          │  │                          │    │
│  └──────────────────────────┘  │  └──────────────────────┘    │
│                                │                               │
│                                └───────────────────────────────┘
│                                                                   │
│              Server-Sent Events (SSE) Streaming                 │
│              fetchEventSource → Backend /run/                   │
└─────────────────────────────────────────────────────────────────┘
                              ↕ (HTTP/SSE)
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                  BACKEND (FastAPI + Python 3.12)                 │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  FastAPI App (main.py)                                     │ │
│  │  - GET /                                                   │ │
│  │  - POST /run/  [Streaming Response]                        │ │
│  │  - CORS Middleware                                         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                          ↓                                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  AgentManager (agent_manager.py)                           │ │
│  │  - Initialize LLMs (OpenAI, Google, Anthropic, Mistral)   │ │
│  │  - Manage model instances                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                          ↓                                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  LangGraph Agent (agent.py)                                │ │
│  │  - State: MessagesState                                    │ │
│  │  - Nodes: "assistant", "tools"                             │ │
│  │  - Edges: START → assistant → conditional → tools/END     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                          ↓                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Tools (Available to Agent)                              │   │
│  │  ┌────────────────────────┐   ┌────────────────────────┐ │   │
│  │  │  ContractSearchTool    │   │  CorpDevTool           │ │   │
│  │  │  (Existing)            │   │  (New)                 │ │   │
│  │  │                        │   │                        │ │   │
│  │  │ - Searches Neo4j       │   │ - Analyzes companies   │ │   │
│  │  │ - Vector search        │   │ - Financial analysis   │ │   │
│  │  │ - Returns contracts    │   │ - Risk assessment      │ │   │
│  │  └────────────────────────┘   └────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
│         ↓                                      ↓                │
│      Neo4j                                Your Database         │
│      (Contracts)                          (Corp Dev Data)       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Component Hierarchy

```
App
├── ThemeProvider
│   └── [Current Page Component]
│       ├── Chat (existing)
│       │   ├── ChatProvider
│       │   ├── ChatOutput
│       │   │   └── ChatMessage (repeated)
│       │   └── ChatInput
│       │
│       └── CorpDevAgent (new)
│           ├── CorpDevProvider
│           ├── StepIndicator
│           └── [Current Step Component]
│               ├── CompanyInfoStep
│               ├── FinancialDataStep
│               ├── RiskAssessmentStep
│               ├── TargetProfileStep
│               └── ReviewStep
```

---

## 3. Chat Data Flow (Existing - Reference)

```
User Input
    ↓
[ChatInput Component]
    ├─ Collects: prompt, model, history
    ├─ Creates UserMessage & AIMessage
    ├─ addMessage() → ChatProvider (Context Update)
    └─ fetchEventSource("/run/", {...})
                ↓
[Backend /run/ endpoint]
    ├─ Receives: {model, prompt, history}
    ├─ Rebuilds message history
    ├─ Invokes LangGraph Agent
    ├─ Agent processes with tools
    └─ Yields SSE: data: {type, content}\n\n
                ↓
[Frontend onmessage callback]
    ├─ Parses each SSE message
    ├─ Extracts type & content
    ├─ Updates state:
    │  ├─ addMessagePart() for text/tool_call/tool_message
    │  ├─ updateMessageGenerating() to stop spinner
    │  └─ context history for context
    └─ ChatOutput component re-renders
                ↓
[ChatOutput Component]
    ├─ Reads messages from ChatProvider
    ├─ Maps each message
    ├─ Renders ChatMessage components
    └─ Displays to user
```

---

## 4. Corp Dev Agent Data Flow (New)

```
User Enters Data
    ↓
[Step Components]
    ├─ CompanyInfoStep:  {companyName, industry, description}
    ├─ FinancialDataStep: {revenue, margin, growth, ...}
    ├─ RiskAssessmentStep: {risks[], mitigations[]}
    ├─ TargetProfileStep: {criteriaWeights[], thresholds[]}
    └─ ReviewStep: Review all accumulated data
                ↓
[CorpDevProvider (Context)]
    ├─ Accumulates wizard data
    ├─ Maintains currentStep state
    ├─ Provides: data, goToStep(), nextStep(), prevStep()
    └─ Persists data during navigation
                ↓
[User Clicks "Analyze"]
    ├─ Collects all wizard form data
    ├─ Creates message for backend
    ├─ fetchEventSource("/run/", {
    │    model: "...",
    │    prompt: "Analyze target with: {...data}",
    │    history: [...] 
    │  })
    └─ Similar to chat flow...
                ↓
[Backend /run/ endpoint]
    ├─ LangGraph Agent receives prompt
    ├─ Agent determines: use CorpDevTool
    ├─ Calls CorpDevTool._run({company_name, ...})
    ├─ Tool analyzes data
    ├─ Tool returns JSON analysis
    └─ Backend streams response back
                ↓
[Frontend Displays Results]
    ├─ SSE messages populate
    ├─ Results component shows:
    │  ├─ Viability score
    │  ├─ Synergies identified
    │  ├─ Risks flagged
    │  └─ Recommendation
    └─ User can export or restart
```

---

## 5. Backend Tool Architecture

```
┌─────────────────────────────────────────────────────┐
│  LangChain BaseTool Abstract Class                   │
│  (Abstract Base for all tools)                       │
└─────────────────────────────────────────────────────┘
                          ↑
          ┌───────────────┴───────────────┐
          │                               │
┌─────────────────────────┐   ┌──────────────────────────────┐
│ ContractSearchTool      │   │ CorpDevTool (New)            │
│                         │   │                              │
│ Required:               │   │ Required:                    │
│ - name: str             │   │ - name: str                  │
│ - description: str      │   │ - description: str           │
│ - args_schema: Pydantic │   │ - args_schema: Pydantic      │
│ - _run(...)             │   │ - _run(...)                  │
│ - _arun(...)            │   │ - _arun(...)                 │
│                         │   │                              │
│ Input Schema:           │   │ Input Schema:                │
│ ContractInput           │   │ CorpDevInput                 │
│  - dates, types,        │   │  - company_name              │
│    parties, etc.        │   │  - industry                  │
│                         │   │  - financial_metrics         │
│ Output:                 │   │                              │
│ JSON string             │   │ Output:                      │
│ {contracts: [...]}      │   │ JSON string                  │
│                         │   │ {viability, synergies, ...}  │
└─────────────────────────┘   └──────────────────────────────┘
          ↓                                    ↓
    Neo4j Query                        Your Implementation
    (Cypher)                           (Python Logic)
          ↓                                    ↓
    Graph Database                    Analysis Engine
```

---

## 6. State Management Patterns

### Frontend: Context API Layers

```
┌────────────────────────────────────────────────────┐
│  ThemeProviderContext                              │
│  ├─ theme: "light" | "dark" | "system"            │
│  └─ setTheme: (theme) => void                      │
│                                                     │
│  Usage: const { theme, setTheme } = useTheme()     │
└────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────┐
│  ChatProviderContext (Existing)                    │
│  ├─ messages: Message[]                           │
│  ├─ addMessage: (m) => void                        │
│  ├─ addMessagePart: (id, part) => void             │
│  ├─ updateMessageGenerating: (id, bool) => void   │
│  ├─ reset: () => void                              │
│  │                                                  │
│  │  Message Type:                                  │
│  │  {                                               │
│  │    id: string                                   │
│  │    type: "user" | "ai"                         │
│  │    parts: MessagePart[]                         │
│  │    generating: boolean                          │
│  │  }                                               │
│  │                                                  │
│  │  MessagePart Type:                              │
│  │  {                                               │
│  │    type: "user_message" | "ai_message" |       │
│  │          "tool_call" | "tool_message" |        │
│  │          "history" | "end"                      │
│  │    content: string                              │
│  │  }                                               │
│  │                                                  │
│  Usage: const { messages, ... } = useChat()        │
└────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────┐
│  CorpDevProviderContext (New)                      │
│  ├─ currentStep: StepType                          │
│  ├─ stepData: StepDataMap                          │
│  ├─ goToStep: (step) => void                       │
│  ├─ nextStep: () => void                           │
│  ├─ prevStep: () => void                           │
│  ├─ setStepData: (step, data) => void              │
│  │                                                  │
│  │  StepDataMap Type:                              │
│  │  {                                               │
│  │    "company-info": CompanyInfoData              │
│  │    "financial-data": FinancialData              │
│  │    "risk-assessment": RiskData                  │
│  │    "target-profile": ProfileData                │
│  │    "review": AllData                            │
│  │  }                                               │
│  │                                                  │
│  Usage: const { ... } = useCorpDev()               │
└────────────────────────────────────────────────────┘
```

---

## 7. Message Streaming Lifecycle

```
Frontend                          Network (SSE)                Backend
  |                                    |                          |
  |─── fetchEventSource() ────→────→────→ POST /run/ ────→────→  |
  |                                    |                          |
  |                                    |  (Process in LangGraph)  |
  |                                    |  (Call tools if needed)  |
  |                                    |                          |
  |←─ SSE: data: {...}\n\n ←─────────┼──────────────────────  |
  |  type: "user_message"             |                          |
  |  (addMessage to state)            |                          |
  |                                    |                          |
  |←─ SSE: data: {...}\n\n ←─────────┼──────────────────────  |
  |  type: "tool_call"                |                          |
  |  (addMessagePart to state)        |                          |
  |                                    |                          |
  |←─ SSE: data: {...}\n\n ←─────────┼──────────────────────  |
  |  type: "tool_message"             |                          |
  |  (addMessagePart to state)        |                          |
  |                                    |                          |
  |←─ SSE: data: {...}\n\n ←─────────┼──────────────────────  |
  |  type: "ai_message"               |                          |
  |  (addMessagePart to state)        |                          |
  |                                    |                          |
  |←─ SSE: data: {...}\n\n ←─────────┼──────────────────────  |
  |  type: "history"                  |                          |
  |  (Store for next request)         |                          |
  |                                    |                          |
  |←─ SSE: data: {...}\n\n ←─────────┼──────────────────────  |
  |  type: "end"                      |                          |
  |  (updateMessageGenerating = false)|                          |
  |  (Close connection)               |                          |
  v                                    v                          v
```

---

## 8. Tailwind CSS Theme System

```
┌─────────────────────────────────────────────────────────┐
│  CSS Variables (index.css)                               │
│                                                          │
│  :root (Light Mode)                                     │
│  ├─ --background: oklch(1 0 0)         [white]        │
│  ├─ --foreground: oklch(0.141...)      [dark]         │
│  ├─ --primary: oklch(0.21...)          [dark blue]    │
│  ├─ --primary-foreground: oklch(0.985..) [white]      │
│  ├─ --secondary: oklch(0.967...)       [light]        │
│  ├─ --destructive: oklch(0.577...)     [red]          │
│  ├─ --muted: oklch(0.967...)           [light]        │
│  └─ --border: oklch(0.92...)           [light gray]   │
│                                                          │
│  .dark (Dark Mode)                                      │
│  ├─ --background: oklch(0.141...)      [dark]         │
│  ├─ --foreground: oklch(0.985...)      [white]        │
│  ├─ --primary: oklch(0.92...)          [light]        │
│  ├─ --primary-foreground: oklch(0.21..) [dark]        │
│  ├─ --secondary: oklch(0.274...)       [dark]         │
│  ├─ --destructive: oklch(0.704...)     [orange]       │
│  ├─ --muted: oklch(0.274...)           [dark]         │
│  └─ --border: oklch(1 0 0 / 10%)       [white 10%]    │
│                                                          │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│  @theme inline (Tailwind Config)                        │
│                                                          │
│  --color-background, --color-foreground,               │
│  --color-primary, --color-secondary,                   │
│  --color-destructive, --color-muted, ...               │
│                                                          │
│  Available in Tailwind utilities:                       │
│  bg-background, text-foreground, bg-primary,           │
│  text-destructive, etc.                                │
│                                                          │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│  Components Use Variables                               │
│                                                          │
│  <Button>                                               │
│    className="bg-primary text-primary-foreground        │
│               dark:bg-primary dark:text-primary-fore..."│
│                                                          │
│  Automatically respects .dark class                     │
│  User can toggle: localStorage → ThemeProvider          │
│  → root.classList.add/remove("dark")                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 9. Docker Multi-Container Orchestration

```
┌────────────────────────────────────────────────────────┐
│ docker-compose.yml                                      │
│                                                         │
│ Networks: net (internal communication)                 │
│                                                         │
│ ┌─────────────────────┐  ┌─────────────────────┐      │
│ │ Backend Container   │  │ UI Container        │      │
│ │                     │  │                     │      │
│ │ Image: Python 3.12  │  │ Image: Node.js      │      │
│ │ Port: 8000:8000     │  │ Port: 5173:5173     │      │
│ │                     │  │                     │      │
│ │ FastAPI dev server  │  │ Vite dev server     │      │
│ │ - Hot reload on     │  │ - Hot reload on     │      │
│ │   ./backend changes │  │   ./frontend changes│      │
│ │                     │  │                     │      │
│ │ Env vars:           │  │ Env vars:           │      │
│ │ - NEO4J_URI         │  │ - VITE_BACKEND_URL  │      │
│ │ - GOOGLE_API_KEY    │  │                     │      │
│ │ - etc.              │  │ Connects to:        │      │
│ │                     │  │ http://localhost:8000      │
│ │ Connects to:        │  │                     │      │
│ │ neo4j+s://demo...   │  │                     │      │
│ └─────────────────────┘  └─────────────────────┘      │
│         ↕                         ↕                    │
│         │───── Internal Network ──│                    │
│         │  (http://backend:8000)  │                    │
│                                                         │
└────────────────────────────────────────────────────────┘
         ↕                         ↕
  External NEO4J                  External Browser
  (demo.neo4jlabs.com)            (http://localhost:5173)
```

---

## 10. Component Lifecycle: Adding Corp Dev Agent

```
Phase 1: Create Backend Tool
  1. Define CorpDevInput (Pydantic model)
  2. Implement CorpDevTool class
  3. Register in agent.py

Phase 2: Create Frontend Components
  1. Create CorpDevProvider (Context)
  2. Create Stepper UI
  3. Create 5 Step components
  4. Create main CorpDevAgent page

Phase 3: Connect to App
  1. Update App.tsx routing
  2. Add navigation between Chat & CorpDevAgent
  3. Wire up theme provider

Phase 4: Test & Deploy
  1. Test components in isolation
  2. Test full flow end-to-end
  3. Docker build & run
  4. Verify hot reload works

Phase 5: Extend
  1. Add more steps if needed
  2. Add database persistence
  3. Add export functionality
  4. Add advanced features
```

