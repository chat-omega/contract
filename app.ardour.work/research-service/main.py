"""
FastAPI Backend for AI Research Service
Integrates with LangGraph for deep research capabilities
"""

import os
import json
import asyncio
from datetime import datetime
from typing import Optional, Dict, List
from uuid import uuid4

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from sse_starlette.sse import EventSourceResponse

from research_agent import ResearchAgent

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="AI Research Service",
    description="Deep research powered by LangGraph and advanced AI",
    version="1.0.0"
)

# Configure CORS
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3002").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (replace with database in production)
research_sessions: Dict[str, dict] = {}

# Pydantic models
class ResearchRequest(BaseModel):
    query: str
    model: Optional[str] = None
    searchProvider: Optional[str] = None

class ResearchSession(BaseModel):
    id: str
    query: str
    status: str  # pending, running, completed, failed
    createdAt: str
    updatedAt: str
    report: Optional[str] = None
    error: Optional[str] = None
    progress: Optional[str] = None

# Initialize research agent
research_agent = ResearchAgent()

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "AI Research Service",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "AI Research Service"
    }

@app.post("/api/research/start", response_model=ResearchSession)
async def start_research(
    request: ResearchRequest,
    background_tasks: BackgroundTasks
):
    """Start a new research session"""

    # Create new session
    session_id = str(uuid4())
    timestamp = datetime.utcnow().isoformat()

    session = {
        "id": session_id,
        "query": request.query,
        "status": "pending",
        "createdAt": timestamp,
        "updatedAt": timestamp,
        "report": None,
        "error": None,
        "progress": None,
        "model": request.model or os.getenv("DEFAULT_MODEL", "gpt-4-turbo-preview"),
        "searchProvider": request.searchProvider or os.getenv("DEFAULT_SEARCH_PROVIDER", "tavily")
    }

    research_sessions[session_id] = session

    # Start research in background
    background_tasks.add_task(run_research, session_id)

    return ResearchSession(**session)

async def run_research(session_id: str):
    """Background task to run research"""
    try:
        session = research_sessions[session_id]
        session["status"] = "running"
        session["updatedAt"] = datetime.utcnow().isoformat()
        session["events"] = []  # Store events for streaming

        # Run the research agent with progress callback
        def update_progress(message: str):
            session["progress"] = message
            session["updatedAt"] = datetime.utcnow().isoformat()

        def handle_event(event: dict):
            """Handle structured events from research agent"""
            session["events"].append({
                **event,
                "timestamp": datetime.utcnow().isoformat()
            })
            session["updatedAt"] = datetime.utcnow().isoformat()

        report = await research_agent.research(
            query=session["query"],
            model=session["model"],
            search_provider=session["searchProvider"],
            progress_callback=update_progress,
            event_callback=handle_event
        )

        # Update session with results
        session["status"] = "completed"
        session["report"] = report
        session["progress"] = None  # Clear progress when complete
        session["updatedAt"] = datetime.utcnow().isoformat()

    except Exception as e:
        session["status"] = "failed"
        session["error"] = str(e)
        session["updatedAt"] = datetime.utcnow().isoformat()
        print(f"Research failed for session {session_id}: {e}")

@app.get("/api/research/stream/{session_id}")
async def stream_research(session_id: str):
    """Stream research results using Server-Sent Events"""

    if session_id not in research_sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    async def event_generator():
        """Generate SSE events for research progress"""
        session = research_sessions[session_id]
        last_status = None
        last_progress = None
        last_report_length = 0
        last_event_index = 0

        while True:
            # Check if session status changed
            if session["status"] != last_status:
                yield {
                    "event": "message",
                    "data": json.dumps({
                        "type": "status",
                        "data": session["status"]
                    })
                }
                last_status = session["status"]

            # Send progress updates
            if session.get("progress") and session["progress"] != last_progress:
                yield {
                    "event": "message",
                    "data": json.dumps({
                        "type": "progress",
                        "data": session["progress"]
                    })
                }
                last_progress = session["progress"]

            # Stream structured events (queries, sources, steps)
            if "events" in session:
                events = session["events"]
                if len(events) > last_event_index:
                    for event in events[last_event_index:]:
                        if event["type"] == "step_started":
                            yield {
                                "event": "message",
                                "data": json.dumps({
                                    "type": "step_started",
                                    "data": {
                                        "step": event["step"],
                                        "phase": event["phase"],
                                        "timestamp": event["timestamp"]
                                    }
                                })
                            }
                        elif event["type"] == "query_added":
                            yield {
                                "event": "message",
                                "data": json.dumps({
                                    "type": "query_added",
                                    "data": {
                                        "query": event["query"],
                                        "timestamp": event["timestamp"]
                                    }
                                })
                            }
                        elif event["type"] == "source_found":
                            yield {
                                "event": "message",
                                "data": json.dumps({
                                    "type": "source_found",
                                    "data": {
                                        **event["source"],
                                        "timestamp": event["timestamp"]
                                    }
                                })
                            }
                    last_event_index = len(events)

            # Stream report chunks
            if session.get("report"):
                current_length = len(session["report"])
                if current_length > last_report_length:
                    chunk = session["report"][last_report_length:current_length]
                    yield {
                        "event": "message",
                        "data": json.dumps({
                            "type": "chunk",
                            "data": chunk
                        })
                    }
                    last_report_length = current_length

            # Check if completed or failed
            if session["status"] in ["completed", "failed"]:
                if session["status"] == "completed":
                    yield {
                        "event": "message",
                        "data": json.dumps({
                            "type": "complete",
                            "data": session["report"]
                        })
                    }
                else:
                    yield {
                        "event": "message",
                        "data": json.dumps({
                            "type": "error",
                            "data": session.get("error", "Unknown error")
                        })
                    }
                yield {
                    "event": "message",
                    "data": "[DONE]"
                }
                break

            await asyncio.sleep(0.5)  # Poll every 500ms

    return EventSourceResponse(event_generator())

@app.get("/api/research/history", response_model=List[ResearchSession])
async def get_research_history(limit: int = 50):
    """Get research history"""

    sessions = list(research_sessions.values())
    # Sort by creation date, most recent first
    sessions.sort(key=lambda x: x["createdAt"], reverse=True)

    return [ResearchSession(**session) for session in sessions[:limit]]

@app.get("/api/research/{session_id}", response_model=ResearchSession)
async def get_research(session_id: str):
    """Get research session by ID"""

    if session_id not in research_sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    return ResearchSession(**research_sessions[session_id])

if __name__ == "__main__":
    import uvicorn

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))

    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )
