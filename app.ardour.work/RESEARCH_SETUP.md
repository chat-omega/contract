# AI Research Service Setup Guide

This guide will help you set up the AI Research feature in your Ardour dashboard.

## 🎯 What You Get

The Research page provides:
- **AI-Powered Deep Research**: Multi-step research using advanced AI models
- **Real-Time Streaming**: Watch your report generate in real-time
- **Web Search Integration**: Comprehensive web search using Tavily
- **Beautiful Reports**: Markdown-formatted reports with syntax highlighting
- **Multiple AI Models**: GPT-4, Claude 3.5, and more

## 📋 Prerequisites

### Required API Keys

1. **OpenAI API Key** (Required)
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Copy the key (starts with `sk-`)

2. **Tavily API Key** (Required)
   - Go to https://tavily.com
   - Sign up for free account
   - Get your API key from the dashboard
   - Copy the key (starts with `tvly-`)

### Optional API Keys

3. **Anthropic API Key** (Optional - for Claude models)
   - Go to https://console.anthropic.com
   - Create API key
   - Copy the key (starts with `sk-ant-`)

4. **LangSmith API Key** (Optional - for monitoring)
   - Go to https://smith.langchain.com
   - Create API key
   - Copy the key (starts with `lsv2_`)

## 🚀 Setup Steps

### Step 1: Configure API Keys

Create a `.env` file in the project root:

```bash
cd /home/ubuntu/contract1/app.ardour.work
cp .env.template .env
```

Edit the `.env` file and add your API keys:

```env
# Required
OPENAI_API_KEY=sk-your-openai-key-here
TAVILY_API_KEY=tvly-your-tavily-key-here

# Optional
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
LANGSMITH_API_KEY=lsv2-your-langsmith-key-here
```

### Step 2: Build and Start Services

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f research-service
```

### Step 3: Access the Research Page

1. Open your browser to http://localhost:3002 (or your configured port)
2. Click on "Research" in the sidebar
3. Enter a research question
4. Select an AI model
5. Click "Start Research"

## ✨ Features

### Available AI Models

- **GPT-4 Turbo** - Best for comprehensive, detailed research
- **GPT-4o** - Faster, good for quick research tasks
- **Claude 3.5 Sonnet** - Excellent for nuanced analysis
- **Claude 3 Opus** - Most capable Claude model

### Research Process

1. **Query Generation**: AI generates multiple search queries from your question
2. **Web Search**: Searches the web using Tavily for relevant information
3. **Synthesis**: Analyzes and synthesizes all findings
4. **Report Generation**: Creates a comprehensive markdown report

### Report Features

- Executive summary
- Detailed analysis by themes
- Specific data and examples
- Balanced perspectives
- Key takeaways
- Download as markdown
- Syntax highlighting for code

## 🔧 Configuration

### Environment Variables

Edit `.env` to customize:

```env
# Model defaults
DEFAULT_MODEL=gpt-4-turbo-preview
DEFAULT_SEARCH_PROVIDER=tavily

# Research settings
MAX_RESEARCH_ITERATIONS=5
MAX_SEARCH_RESULTS=10

# Monitoring (optional)
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=ardour-research
```

### Ports

- Frontend: `3002` (dashboard)
- Research Service: `8000` (API)

Change ports in `docker-compose.yml` if needed.

## 🐛 Troubleshooting

### Issue: "Failed to start research"

**Solutions:**
1. Check that API keys are correctly set in `.env`
2. Verify OpenAI and Tavily keys are valid
3. Check service logs: `docker-compose logs research-service`
4. Restart services: `docker-compose restart`

### Issue: "Connection refused"

**Solutions:**
1. Ensure research service is running: `docker-compose ps`
2. Check port 8000 is not in use: `lsof -i :8000`
3. Verify CORS settings in docker-compose.yml

### Issue: Research is slow

**Solutions:**
1. Try a faster model (GPT-4o instead of GPT-4 Turbo)
2. Reduce MAX_SEARCH_RESULTS in .env
3. Check your internet connection
4. Verify API rate limits aren't exceeded

### Issue: Models not available

**Solutions:**
1. For GPT models: Verify OpenAI API key
2. For Claude models: Add Anthropic API key to .env
3. Restart services after adding keys

## 📊 API Endpoints

The research service exposes these endpoints:

- `POST /api/research/start` - Start new research
- `GET /api/research/stream/{id}` - Stream research progress
- `GET /api/research/{id}` - Get research session
- `GET /api/research/history` - Get research history

Full API documentation: http://localhost:8000/docs (when running)

## 🔒 Security Notes

- Never commit `.env` file to git
- Keep API keys secure and private
- Use environment-specific keys (dev/prod)
- Monitor API usage and costs
- Set up rate limiting for production

## 💡 Usage Tips

### Example Research Questions

**Market Analysis:**
- "Latest trends in renewable energy technology"
- "Competitive landscape of AI startups in healthcare"
- "Market analysis of fintech companies in India"

**Investment Research:**
- "Investment opportunities in sustainable agriculture"
- "Due diligence checklist for SaaS companies"
- "Valuation trends in late-stage startups"

**Industry Reports:**
- "State of AI in 2024"
- "Enterprise software market overview"
- "Emerging technologies in manufacturing"

### Keyboard Shortcuts

- `Cmd/Ctrl + Enter` - Start research from textarea
- Click example queries to auto-fill

### Best Practices

1. **Be Specific**: More specific questions get better results
2. **Use Context**: Include industry, geography, timeframe
3. **Iterate**: Refine questions based on initial results
4. **Save Reports**: Download important reports for offline access

## 🔄 Updates

To update the research service:

```bash
# Pull latest changes
git pull

# Rebuild services
docker-compose build research-service

# Restart
docker-compose restart research-service
```

## 📚 Learn More

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Tavily Search API](https://docs.tavily.com)
- [Anthropic Claude](https://docs.anthropic.com)

## 🆘 Support

If you encounter issues:

1. Check logs: `docker-compose logs -f research-service`
2. Verify API keys are valid
3. Review this troubleshooting guide
4. Check service status: `docker-compose ps`

## 🎉 You're Ready!

The AI Research feature is now set up and ready to use. Navigate to the Research page in your dashboard and start conducting deep research powered by AI!
