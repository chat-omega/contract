# Performance Instrumentation Quick Reference

## What Was Changed

**File**: `/home/ubuntu/contract1/app.ardour.work/research-service/research_agent.py`
- **Original**: 300 lines
- **Modified**: 397 lines
- **Added**: 97 lines of performance instrumentation

## See It In Action

### 1. Run Demo Script (No API Required)
```bash
cd /home/ubuntu/contract1/app.ardour.work/research-service
python3 demo_performance_logs.py
```

### 2. View Real Logs from Docker Container
```bash
# Start the service
docker-compose up research-service

# In another terminal, watch logs
docker logs appardourwork-research-service-1 -f

# Trigger a research query via API or UI
```

### 3. Run Performance Tests
```bash
cd /home/ubuntu/contract1/app.ardour.work/research-service
python3 test_performance.py
```

## What You'll See

### During Execution:
```
🔍 Step 1: Generating search queries...
⏱️  Query Generation: 2.34s
🌐 Step 2: Executing 3 searches...
  Searching 1/3: 'AI agent frameworks 2024'
  ✓ Search 1 completed in 1.52s, found 5 results
  ...
⏱️  Search Execution (Total): 4.65s
🧠 Step 3: Synthesizing 15 findings...
⏱️  Synthesis: 5.67s
📝 Step 4: Generating final report...
⏱️  Report Generation: 8.23s
```

### At Completion:
```
============================================================
📊 PERFORMANCE SUMMARY
============================================================
Query Generation:     2.34s (11.2%)
Search Execution:     4.65s (22.3%)
  - Search 1: 1.52s (5 results)
  - Search 2: 1.68s (5 results)
  - Search 3: 1.45s (5 results)
Synthesis:            5.67s (27.1%)
Report Generation:    8.23s (39.4%)
------------------------------------------------------------
TOTAL TIME:           20.89s
============================================================
🔴 Top Bottlenecks:
  - report_generation: 8.23s (39.4%)
  - synthesis: 5.67s (27.1%)
============================================================
```

## Key Metrics Tracked

| Metric | What It Measures |
|--------|------------------|
| Query Generation | Time to generate search queries from user question (LLM call) |
| Search Execution | Total time for all Tavily API searches |
| Individual Searches | Each search query's timing + result count |
| Synthesis | Time to synthesize findings from all results (LLM call) |
| Report Generation | Time to create final markdown report (LLM call) |
| Total Time | End-to-end research execution time |

## Understanding the Output

### Time Percentages
Shows how much of total time each step consumes:
- **< 20%**: Minor contributor
- **20-40%**: Significant step
- **> 40%**: Major bottleneck

### Bottleneck Analysis
Automatically highlights the 2 slowest steps for optimization focus.

### Search Details
Each search shows:
- Query text
- Duration in seconds
- Number of results found
- Success/failure status

## Files Created

1. **research_agent.py** (modified)
   - Main instrumentation

2. **demo_performance_logs.py** (new)
   - Demo script showing expected output

3. **PERFORMANCE_INSTRUMENTATION_SUMMARY.md** (new)
   - Detailed documentation

4. **QUICK_REFERENCE.md** (this file)
   - Quick start guide

## Troubleshooting

### Logs Not Showing?
- Check log level is set to INFO or DEBUG
- Verify logger is configured in main.py
- Use `docker logs` command with `-f` flag to follow

### Performance Data Missing?
- Ensure you're looking at recent logs (after code deployment)
- Rebuild Docker container if changes not reflected
- Check for exceptions in logs

### Unexpected Timing?
- First run may be slower (cold start)
- LLM API latency varies by model and load
- Search API timing depends on query complexity

## Next Steps

1. Run a real research query
2. Check Docker logs for performance summary
3. Identify bottlenecks from the output
4. Consider optimizations based on data
5. Test optimizations and compare timing

## Support

For detailed information, see:
- `PERFORMANCE_INSTRUMENTATION_SUMMARY.md` - Full documentation
- `research_agent.py` - Source code with inline comments
- `demo_performance_logs.py` - Sample output generator
