# Corp Dev Agent - Implementation Checklist & Code References

## Frontend Implementation Checklist

### 1. Create Stepper/Wizard Component
- [ ] Create `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/corp-dev/stepper.tsx`
- [ ] Create `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/corp-dev/step-indicator.tsx`
- [ ] Use Card components from: `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/ui/card.tsx`
- [ ] Use Button variants from: `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/ui/button.tsx`

### 2. Create Step Components
- [ ] Create `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/corp-dev/steps/company-info-step.tsx`
- [ ] Create `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/corp-dev/steps/financial-data-step.tsx`
- [ ] Create `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/corp-dev/steps/risk-assessment-step.tsx`
- [ ] Create `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/corp-dev/steps/target-profile-step.tsx`
- [ ] Create `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/corp-dev/steps/review-step.tsx`

### 3. Form Inputs - Reference Existing Patterns
- [ ] Text inputs: Use pattern from `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/ui/textarea.tsx`
- [ ] Dropdowns: Use pattern from `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/ui/select.tsx`
- [ ] Color scheme: Reference `/home/ubuntu/contract1/legal-tech-chat/frontend/src/index.css` (OKLCH colors)

### 4. Create Main CorpDevAgent Page
- [ ] Create `/home/ubuntu/contract1/legal-tech-chat/frontend/src/pages/corp-dev-agent.tsx`
- [ ] Implement state using Context API pattern from: `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/chat/provider.tsx`
- [ ] Handle navigation between steps

### 5. Update App Component
- [ ] Modify: `/home/ubuntu/contract1/legal-tech-chat/frontend/src/App.tsx`
- [ ] Add page state (chat | corp-dev)
- [ ] Add navigation component to switch pages
- [ ] Example import: `import { CorpDevAgent } from "./pages/corp-dev-agent"`

### 6. Create Provider for CorpDev State
- [ ] Create `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/corp-dev/provider.tsx`
- [ ] Mirror pattern from: `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/chat/provider.tsx`
- [ ] Define types for each step's form data

## Backend Implementation Checklist

### 1. Create CorpDev Tool
- [ ] Create `/home/ubuntu/contract1/legal-tech-chat/backend/tools/corp_dev_tool.py`
- [ ] Reference pattern from: `/home/ubuntu/contract1/legal-tech-chat/backend/tools/contract_search_tool.py`
- [ ] Define Pydantic models for input schema
- [ ] Implement `_run()` method

### 2. Update Agent Configuration
- [ ] Modify: `/home/ubuntu/contract1/legal-tech-chat/backend/agent.py`
- [ ] Import new tool: `from backend.tools.corp_dev_tool import CorpDevTool`
- [ ] Add to tools list: `tools = [ContractSearchTool(), CorpDevTool()]`
- [ ] Update system message if needed

### 3. Update Agent Manager (if needed)
- [ ] Verify: `/home/ubuntu/contract1/legal-tech-chat/backend/agent_manager.py`
- [ ] No changes typically needed - existing agents already have tools

### 4. API Routes (if additional endpoints needed)
- [ ] Modify: `/home/ubuntu/contract1/legal-tech-chat/backend/main.py`
- [ ] New route example:
```python
@app.post("/corp-dev/analyze/")
async def analyze_target(payload: CorpDevPayload):
    return StreamingResponse(
        corp_dev_runner(...),
        media_type="text/event-stream",
    )
```

### 5. Database Setup (if needed)
- [ ] Review Neo4j schema in `/home/ubuntu/contract1/legal-tech-chat/backend/tools/contract_search_tool.py`
- [ ] Add new node types for corp dev data if required
- [ ] Add corresponding relationships

## Testing Checklist

### Frontend Tests
- [ ] Component renders without errors
- [ ] Form validation works correctly
- [ ] Theme switching works (light/dark mode)
- [ ] Navigation between steps functions properly
- [ ] Data persists during step navigation
- [ ] Responsive design on different screen sizes

### Backend Tests
- [ ] New tool integrates with LangGraph without errors
- [ ] Tool schema is properly validated
- [ ] Streaming responses work correctly
- [ ] Error handling for invalid inputs

### Integration Tests
- [ ] Frontend can call backend /run/ endpoint
- [ ] Data flows correctly through the wizard
- [ ] SSE streaming displays properly
- [ ] State management works end-to-end

## Docker Deployment

### Build & Run
```bash
# From /home/ubuntu/contract1/legal-tech-chat directory

# Build both services
docker-compose build

# Run services
docker-compose up

# Frontend: http://localhost:5173
# Backend: http://localhost:8000
```

### Watch for Hot Reload
- Backend changes: `/home/ubuntu/contract1/legal-tech-chat/backend/**`
- Frontend changes: `/home/ubuntu/contract1/legal-tech-chat/frontend/**`

## Code Style Guidelines

### Frontend (TypeScript/React)

**Imports:**
```typescript
import * as React from "react"  // or destructured React imports
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
```

**Component Pattern:**
```typescript
export function MyComponent() {
  return (
    <div className="flex flex-col gap-2">
      {/* content */}
    </div>
  )
}
```

**Tailwind Classes:**
- Use utility classes from Tailwind 4
- Reference color scheme from `index.css`
- Use responsive prefixes: `md:`, `lg:`, `dark:`
- Dark mode support via `.dark` class selector

**Types:**
```typescript
interface Props {
  name: string
  onchange?: (value: string) => void
}

type StepType = "step1" | "step2" | "step3"
```

### Backend (Python/FastAPI)

**Imports:**
```python
from typing import Optional, List, Type
from pydantic import BaseModel, Field
from langchain_core.tools import BaseTool
```

**Pydantic Model Pattern:**
```python
class MyInput(BaseModel):
    field1: str = Field(..., description="Field description")
    field2: Optional[str] = Field(None, description="Optional field")
```

**Tool Pattern:**
```python
class MyTool(BaseTool):
    name: str = "ToolName"
    description: str = "Tool description"
    args_schema: Type[BaseModel] = MyInput
    
    def _run(self, field1: str, field2: Optional[str] = None) -> str:
        # Implementation
        return result
```

## Environment Variables

### Frontend (.env)
```
VITE_BACKEND_URL=http://localhost:8000
```

### Backend (.env)
```
NEO4J_URI=neo4j+s://demo.neo4jlabs.com:7687
NEO4J_USERNAME=legalcontracts
NEO4J_PASSWORD=legalcontracts
NEO4J_DATABASE=legalcontracts
GOOGLE_API_KEY=your-key
OPENAI_API_KEY=your-key
ANTHROPIC_API_KEY=your-key
MISTRAL_API_KEY=your-key
```

## References

### Frontend Architecture
- Main App: `/home/ubuntu/contract1/legal-tech-chat/frontend/src/App.tsx`
- Chat Reference: `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/chat/`
- UI Components: `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/ui/`
- Theme: `/home/ubuntu/contract1/legal-tech-chat/frontend/src/components/theme-provider.tsx`

### Backend Architecture
- FastAPI Routes: `/home/ubuntu/contract1/legal-tech-chat/backend/main.py`
- LangGraph Setup: `/home/ubuntu/contract1/legal-tech-chat/backend/agent.py`
- Tool Pattern: `/home/ubuntu/contract1/legal-tech-chat/backend/tools/contract_search_tool.py`

### Styling
- Theme CSS: `/home/ubuntu/contract1/legal-tech-chat/frontend/src/index.css`
- Utilities: `/home/ubuntu/contract1/legal-tech-chat/frontend/src/lib/utils.ts`
- Vite Config: `/home/ubuntu/contract1/legal-tech-chat/frontend/vite.config.ts`

## Troubleshooting

### Docker Container Rebuild
```bash
# Full rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Port Conflicts
- Frontend (default 5173): Change in vite.config.ts
- Backend (default 8000): Change docker-compose.yml

### Environment Variables Not Loading
- Ensure `.env` file exists in backend directory
- Restart containers after changing `.env`
- Use `docker-compose up --build` for clean rebuild

### TypeScript Errors
- Run `npm run lint` in frontend directory
- Check that `tsconfig.json` is properly configured

