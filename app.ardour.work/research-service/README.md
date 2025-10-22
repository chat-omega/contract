# AI Research Service

Deep research service powered by LangGraph and advanced AI models. Integrates with the Ardour dashboard to provide comprehensive research capabilities.

## Features

- 🤖 **Multi-Model Support**: GPT-4, GPT-4o, Claude 3.5 Sonnet, Claude 3 Opus
- 🔍 **Web Search Integration**: Powered by Tavily for comprehensive web research
- 📊 **Streaming Results**: Real-time report generation with Server-Sent Events
- 📝 **Markdown Reports**: Beautiful, formatted reports with syntax highlighting
- 🎯 **Deep Research**: Multi-step research process with query generation, search, synthesis, and reporting

## Architecture

The service uses:
- **FastAPI** for the REST API and SSE streaming
- **LangGraph** for orchestrating the research workflow
- **LangChain** for LLM integrations
- **Tavily** for web search

## Setup

### 1. Get API Keys

You need the following API keys:

**Required:**
- **OpenAI API Key** - Get from https://platform.openai.com/api-keys
- **Tavily API Key** - Get from https://tavily.com (free tier available)

**Optional:**
- **Anthropic API Key** - For Claude models (https://console.anthropic.com)
- **LangSmith API Key** - For monitoring (https://smith.langchain.com)

### 2. Configure Environment

Create a `.env` file in the root directory:

```bash
# Copy the template
cp .env.template .env
```

Edit `.env` and add your API keys:

```env
OPENAI_API_KEY=sk-...
TAVILY_API_KEY=tvly-...
ANTHROPIC_API_KEY=sk-ant-...  # Optional
LANGSMITH_API_KEY=lsv2_...     # Optional
```

### 3. Run with Docker Compose

```bash
# Build and start services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

The research service will be available at `http://localhost:8000`

### 4. Run Locally (without Docker)

```bash
# Install dependencies
pip install -r requirements.txt

# Run the service
python main.py
```

## API Endpoints

### Start Research
```http
POST /api/research/start
Content-Type: application/json

{
  "query": "What are the latest trends in AI?",
  "model": "gpt-4-turbo-preview",
  "searchProvider": "tavily"
}
```

### Stream Research Results
```http
GET /api/research/stream/{session_id}
Accept: text/event-stream
```

### Get Research Session
```http
GET /api/research/{session_id}
```

### Get Research History
```http
GET /api/research/history?limit=50
```

## Research Process

1. **Query Generation**: Generate multiple targeted search queries from the research question
2. **Web Search**: Execute searches using Tavily to gather comprehensive information
3. **Synthesis**: Analyze and synthesize findings from all search results
4. **Report Generation**: Create a detailed markdown report with executive summary, analysis, and key takeaways

## Model Configuration

Available models:
- `gpt-4-turbo-preview` - Best for comprehensive research
- `gpt-4o` - Faster, good for quick research
- `claude-3-5-sonnet-20241022` - Excellent for nuanced analysis
- `claude-3-opus-20240229` - Most capable Claude model

Set default model in `.env`:
```env
DEFAULT_MODEL=gpt-4-turbo-preview
```

## Troubleshooting

### API Key Errors
- Ensure API keys are properly set in `.env` file
- Verify keys are valid and have sufficient credits
- Check that environment variables are loaded correctly

### Connection Errors
- Verify the service is running on port 8000
- Check CORS settings match your frontend URL
- Ensure no firewall is blocking the connection

### Research Fails
- Check API key validity and rate limits
- Verify Tavily API key is active
- Review logs for specific error messages

## Development

### Project Structure
```
research-service/
├── main.py              # FastAPI application
├── research_agent.py    # LangGraph research logic
├── requirements.txt     # Python dependencies
├── Dockerfile          # Container configuration
├── .env.example        # Environment template
└── README.md           # This file
```

### Adding New Models

Edit `research_agent.py` to add support for new LLM providers:

```python
def _get_llm(self, model: str):
    if model.startswith("your-provider"):
        return YourProviderChat(
            model=model,
            api_key=os.getenv("YOUR_PROVIDER_KEY")
        )
```

## License

MIT
