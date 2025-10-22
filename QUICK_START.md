# Quick Start Guide - Corp Dev Agent Feature

## At a Glance

**Frontend Tech Stack:**
- React 19 + TypeScript + Tailwind CSS 4
- Context API for state management (no Redux)
- Radix UI primitives + Lucide icons
- SSE streaming via fetch-event-source

**Backend Tech Stack:**
- FastAPI with Python 3.12
- LangChain + LangGraph for agent orchestration
- Neo4j for contract database
- Multi-LLM support (OpenAI, Google, Anthropic, Mistral)

**Key Architecture:**
```
Frontend (React) --> FastAPI Backend (SSE streaming)
   |                         |
   └--SSE/MessagePart   LangGraph Agent
                         |
                    ┌────┴────┐
                    |          |
              ContractSearchTool  YourNewTool
                    |          |
                  Neo4j    Your Database
```

---

## Frontend: 5 Essential Files

### 1. **Main App** - `/home/ubuntu/contract1/legal-tech-chat/frontend/src/App.tsx`
```typescript
function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <Chat />  // Replace or add CorpDevAgent component
    </ThemeProvider>
  )
}
```
**Action:** Add routing logic to switch between Chat and CorpDevAgent

### 2. **State Management** - `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/chat/provider.tsx`
```typescript
type Message = {
  id: string
  type: "user" | "ai"
  parts: MessagePart[]
  generating: boolean
}

export const useChat = () => { ... }
export function ChatProvider({ children }) { ... }
```
**Action:** Create similar provider for corp dev agent: `corp-dev/provider.tsx`

### 3. **Component Pattern (Button)** - `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/ui/button.tsx`
```typescript
const buttonVariants = cva("base-classes", {
  variants: {
    variant: { default, destructive, outline, secondary, ghost, link },
    size: { default, sm, lg, icon }
  }
})

<Button variant="outline" size="sm">Click Me</Button>
```
**Action:** Follow this CVA pattern for all new components

### 4. **Form Inputs** - `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/ui/`
- `textarea.tsx` - Text input pattern
- `select.tsx` - Dropdown pattern
- Both use `cn()` utility + Tailwind + dark mode support

**Action:** Reuse these patterns for wizard form fields

### 5. **Theme System** - `/home/ubuntu/contract1/legal-tech-chat/frontend/src/index.css`
```css
:root {
  --primary: oklch(0.21 0.006 285.885);
  --background: oklch(1 0 0);
  /* ...40 CSS variables in OKLCH color space */
}

.dark {
  --primary: oklch(0.92 0.004 286.32);
  --background: oklch(0.141 0.005 285.823);
}
```
**Action:** Use existing CSS variables; all components automatically support dark mode

---

## Backend: 5 Essential Files

### 1. **FastAPI Routes** - `/home/ubuntu/contract1/legal-tech-chat/backend/main.py`
```python
@app.post("/run/")
async def run(payload: RunPayload):
    return StreamingResponse(
        runner(model=payload.model, prompt=payload.prompt, history=payload.history),
        media_type="text/event-stream",
    )
```
**Action:** No changes needed unless you add new endpoints; reuse /run/ for your agent

### 2. **Agent Setup** - `/home/ubuntu/contract1/legal-tech-chat/backend/agent.py`
```python
def get_agent(llm):
    tools = [ContractSearchTool()]  # Add your tool here
    llm_with_tools = llm.bind_tools(tools)
    
    # LangGraph setup - builds state machine
    builder = StateGraph(MessagesState)
    builder.add_node("assistant", assistant)
    builder.add_node("tools", ToolNode(tools))
    # Routing between nodes...
    return builder.compile()
```
**Action:** Add `from backend.tools.corp_dev_tool import CorpDevTool` and add to tools list

### 3. **Tool Pattern** - `/home/ubuntu/contract1/legal-tech-chat/backend/tools/contract_search_tool.py`
```python
class ContractInput(BaseModel):
    field1: Optional[str] = Field(None, description="...")
    field2: Optional[str] = Field(None, description="...")

class ContractSearchTool(BaseTool):
    name: str = "ContractSearch"
    description: str = "Tool description for LLM"
    args_schema: Type[BaseModel] = ContractInput
    
    def _run(self, field1: Optional[str] = None) -> str:
        # Query database, process data
        return json.dumps(results)
```
**Action:** Create `corp_dev_tool.py` following this exact pattern

### 4. **LLM Manager** - `/home/ubuntu/contract1/legal-tech-chat/backend/agent_manager.py`
```python
class AgentManager:
    agents = {}
    
    def init_agents(self):
        if os.getenv("OPENAI_API_KEY"):
            self.agents["gpt-4o"] = get_agent(ChatOpenAI(...))
        # More model setups...
    
    def get_model_by_name(self, name: str):
        return self.agents[name]
```
**Action:** No changes needed - automatically adds new tools to all models

### 5. **SSE Streaming Response** - `/home/ubuntu/contract1/legal-tech-chat/backend/main.py`
```python
async def runner(model: str, prompt: str, history: str):
    # Streaming logic
    async for message in messages:
        if message[0] == "messages":
            chunk = message[1]
            if isinstance(chunk[0], AIMessageChunk):
                yield f"data: {json.dumps({'content': chunk[0].content, 'type': 'ai_message'})}\n\n"
```
**Action:** This handles streaming automatically; no changes needed

---

## Frontend File Structure (What to Create)

```
frontend/src/
├── pages/
│   └── corp-dev-agent.tsx              [NEW] Main wizard page
├── components/
│   └── corp-dev/                        [NEW] Folder
│       ├── provider.tsx                 [NEW] State management
│       ├── stepper.tsx                  [NEW] Step indicator component
│       ├── step-navigator.tsx           [NEW] Next/Previous buttons
│       └── steps/                       [NEW] Folder
│           ├── company-info-step.tsx    [NEW]
│           ├── financial-data-step.tsx  [NEW]
│           ├── risk-assessment-step.tsx [NEW]
│           ├── target-profile-step.tsx  [NEW]
│           └── review-step.tsx          [NEW]
```

---

## Backend File Structure (What to Create)

```
backend/tools/
├── corp_dev_tool.py                    [NEW] Core tool logic
├── __init__.py                         [MODIFY] Add import

backend/
└── agent.py                            [MODIFY] Add tool to agent
```

---

## Implementation Steps (In Order)

### Phase 1: Backend Tool Creation (30 min)
1. Create `/home/ubuntu/contract1/legal-tech-chat/backend/tools/corp_dev_tool.py`
2. Define Pydantic model for inputs
3. Implement CorpDevTool class with _run() method
4. Test tool independently

### Phase 2: Backend Integration (15 min)
1. Modify `/home/ubuntu/contract1/legal-tech-chat/backend/agent.py`
2. Import CorpDevTool
3. Add to tools list
4. Verify no syntax errors

### Phase 3: Frontend Wizard Structure (45 min)
1. Create corp-dev provider at `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/corp-dev/provider.tsx`
2. Create stepper component
3. Create step components (5 files)
4. Create main page component

### Phase 4: App Navigation (15 min)
1. Modify `/home/ubuntu/contract1/legal-tech-chat/frontend/src/App.tsx`
2. Add page state
3. Add navigation component
4. Route to CorpDevAgent page

### Phase 5: Testing & Deployment (30 min)
1. Test frontend locally: `npm run dev`
2. Test backend locally
3. Build Docker: `docker-compose build`
4. Run: `docker-compose up`
5. Test through UI at http://localhost:5173

---

## Code Copy-Paste Templates

### Frontend: Basic Step Component
```typescript
// File: /home/ubuntu/contract1/legal-tech-chat/frontend/src/components/corp-dev/steps/company-info-step.tsx

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface CompanyInfoStepProps {
  onNext: (data: CompanyInfoData) => void
}

export type CompanyInfoData = {
  companyName: string
  industry: string
  description: string
}

export function CompanyInfoStep({ onNext }: CompanyInfoStepProps) {
  const [data, setData] = useState<CompanyInfoData>({
    companyName: "",
    industry: "",
    description: "",
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium">Company Name</label>
          <input
            type="text"
            value={data.companyName}
            onChange={(e) => setData({ ...data, companyName: e.target.value })}
            className="w-full border rounded-md px-3 py-2 mt-1"
            placeholder="Enter company name"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Industry</label>
          <Textarea
            value={data.industry}
            onChange={(e) => setData({ ...data, industry: e.target.value })}
            placeholder="Enter industry"
          />
        </div>

        <Button onClick={() => onNext(data)}>Next</Button>
      </CardContent>
    </Card>
  )
}
```

### Backend: Basic Tool
```python
# File: /home/ubuntu/contract1/legal-tech-chat/backend/tools/corp_dev_tool.py

from typing import Optional, Type, Any
from pydantic import BaseModel, Field
from langchain_core.tools import BaseTool
import json

class CorpDevInput(BaseModel):
    company_name: str = Field(..., description="Target company name")
    industry: str = Field(..., description="Industry sector")
    financial_metrics: Optional[dict] = Field(None, description="Financial data")

class CorpDevTool(BaseTool):
    name: str = "CorpDevAnalysis"
    description: str = (
        "Analyze target companies for corporate development opportunities. "
        "Provides insights on acquisition viability, synergies, and risks."
    )
    args_schema: Type[BaseModel] = CorpDevInput
    
    def _run(
        self,
        company_name: str,
        industry: str,
        financial_metrics: Optional[dict] = None,
    ) -> str:
        """Execute the corp dev analysis tool."""
        
        # Your analysis logic here
        results = {
            "company": company_name,
            "industry": industry,
            "viability_score": 8.5,
            "synergies": ["Cost synergies", "Revenue synergies"],
            "risks": ["Integration risk", "Market risk"],
            "recommendation": "PROCEED_WITH_CAUTION"
        }
        
        return json.dumps(results, indent=2)
    
    async def _arun(self, *args, **kwargs) -> str:
        """Async version of _run"""
        return self._run(*args, **kwargs)
```

---

## Key Concepts to Remember

### State Management
- **Frontend:** Use Context API hooks (not Redux)
- **Backend:** LangGraph handles state through Messages

### Streaming
- **Frontend:** `fetchEventSource` listens for SSE messages
- **Backend:** Yields SSE-formatted JSON: `data: {...}\n\n`

### Theme Support
- **All components automatically support light/dark mode**
- **Use CSS variables from `index.css`**
- **Tailwind respects `.dark` class on root element**

### Type Safety
- **Frontend:** TypeScript with strict mode
- **Backend:** Pydantic BaseModel for validation

### Component Reusability
- **Copy patterns from existing components**
- **Don't create new UI components from scratch**
- **Button, Card, Textarea, Select are your base components**

---

## Docker Hot Reload

Changes auto-trigger rebuilds:
- Modify backend code → auto-restart FastAPI
- Modify frontend code → Vite auto-refresh

```bash
cd /home/ubuntu/contract1/legal-tech-chat
docker-compose up
# Leave running, make changes, refresh browser
```

---

## Testing the Integration

### Test Backend Tool Independently
```python
# In Python REPL or test file
from backend.tools.corp_dev_tool import CorpDevTool

tool = CorpDevTool()
result = tool._run(
    company_name="TechCorp",
    industry="Software",
    financial_metrics={"revenue": 1000000}
)
print(result)
```

### Test Frontend Component
```bash
cd /home/ubuntu/contract1/legal-tech-chat/frontend
npm run dev
# Visit http://localhost:5173
```

### Test Full Integration
```bash
cd /home/ubuntu/contract1/legal-tech-chat
docker-compose up
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
```

---

## Common Pitfalls to Avoid

1. **Forgetting to add tool to agent.py** - Tool won't be available to LLM
2. **Missing `_arun()` in tool** - FastAPI requires async support
3. **Not following the Pydantic model pattern** - Tool won't have proper schema
4. **Incorrect SSE format** - Frontend won't parse streaming responses
5. **State not in Context** - Data lost during component remounts
6. **Not using `cn()` utility** - Tailwind classes may not merge properly
7. **Missing dark mode classes** - Component looks broken in dark theme

---

## Debug Commands

```bash
# Check backend logs
docker logs legal-tech-chat-backend-1

# Check frontend logs
docker logs legal-tech-chat-ui-1

# Restart services
docker-compose restart

# Full rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up

# Test API endpoint
curl http://localhost:8000/

# SSH into backend container
docker exec -it legal-tech-chat-backend-1 /bin/bash
```

---

## Next Steps After Completion

1. Add more wizard steps as needed
2. Integrate with Neo4j for corp dev data storage
3. Add export/save functionality for analysis results
4. Implement user authentication if required
5. Add analytics tracking
6. Performance optimization for large data sets

