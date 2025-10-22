# Performance Testing Guide

## Overview

The `test_performance.py` script is a comprehensive performance testing tool for the Research Service. It measures execution time, identifies bottlenecks, and generates detailed performance reports.

## Features

- **Health Check**: Verifies the research service is running before testing
- **Detailed Timing**: Captures timing for each phase (request, streaming, total)
- **Event Tracking**: Monitors all SSE events during research execution
- **Bottleneck Identification**: Automatically identifies performance issues
- **Optimization Recommendations**: Provides actionable suggestions for improvement
- **Multiple Output Formats**: Generates both human-readable and JSON reports

## Prerequisites

1. **Research Service Running**: The service must be running at `http://localhost:8000`
   ```bash
   docker-compose up research-service
   ```

2. **Dependencies**: The script requires `aiohttp` (already included as a dependency)

## Usage

### Basic Usage (Default Test Queries)

Run with the default set of test queries:

```bash
cd /home/ubuntu/contract1/app.ardour.work/research-service
python3 test_performance.py
```

This will run 3 predefined test queries and generate a comprehensive report.

### Custom Queries

Run with your own custom queries:

```bash
python3 test_performance.py "What are the latest AI trends?" "Analyze the fintech market"
```

You can provide 1 or more custom queries as command-line arguments.

### Make it Executable

The script is designed to be executable:

```bash
chmod +x test_performance.py
./test_performance.py
```

## Output

### Console Output

During execution, you'll see:

```
✓ Research service is healthy

================================================================================
TEST 1: What are the top 3 M&A trends in healthtech in 2024?
================================================================================
📤 Starting research session...
✓ Session created: abc123 (0.45s)
📡 Streaming research progress...
  [  0.12s] step_started: Generating search queries...
  [ 15.34s] step_started: Searching for information...
  [ 45.67s] complete: Research completed successfully
📥 Fetching final results...
✓ Report length: 3456 characters

📊 Test completed in 46.23s
```

### Generated Files

Two files are created for each test run:

1. **Text Report**: `performance_report_YYYYMMDD_HHMMSS.txt`
   - Human-readable summary
   - Timing statistics
   - Bottleneck analysis
   - Optimization recommendations

2. **JSON Data**: `performance_data_YYYYMMDD_HHMMSS.json`
   - Raw test data
   - All events and timing information
   - Detailed analysis results
   - Machine-readable format for further processing

### Sample Report Structure

```
================================================================================
RESEARCH SERVICE PERFORMANCE REPORT
================================================================================
Test Date: 2025-10-20 12:00:00
Base URL: http://localhost:8000

SUMMARY
--------------------------------------------------------------------------------
Total Tests: 3
Successful: 3
Failed: 0

TIMING STATISTICS
--------------------------------------------------------------------------------
Average Total Time: 45.23s
Min Total Time: 38.45s
Max Total Time: 52.67s
Average Stream Time: 44.12s

DETAILED RESULTS
--------------------------------------------------------------------------------

Test 1: What are the top 3 M&A trends in healthtech in 2024?...
  Status: ✓ Success
  Total Time: 45.23s
  Events: 28
  Report Length: 3456 chars

IDENTIFIED BOTTLENECKS
--------------------------------------------------------------------------------
⚠️  Stream time is high (indicates backend processing bottleneck)
   Severity: HIGH
   Recommendation: Check backend logs for LLM or search API timing

OPTIMIZATION RECOMMENDATIONS
--------------------------------------------------------------------------------
1. Parallelize search API calls using asyncio.gather()
2. Consider using streaming responses for report generation
3. Use gpt-3.5-turbo for query generation, reserve gpt-4 for synthesis/report
4. Implement caching for frequently searched queries

================================================================================
For detailed backend timing, check Docker logs:
  docker logs appardourwork-research-service-1
================================================================================
```

## Interpreting Results

### Timing Metrics

- **Request Time**: Time to initiate the research session (should be < 1s)
- **Stream Time**: Time for the backend to complete research and stream results
- **Total Time**: End-to-end time from request to final report retrieval

### Performance Thresholds

- **Good**: Total time < 30 seconds
- **Acceptable**: Total time 30-60 seconds
- **Needs Optimization**: Total time > 60 seconds

### Common Bottlenecks

1. **High Stream Time**: Backend processing is slow
   - Check LLM response times in backend logs
   - Review search API performance
   - Consider parallel processing

2. **Many Events**: Too many intermediate steps
   - Review research workflow efficiency
   - Consolidate similar operations

3. **Large Report Generation**: Final synthesis is slow
   - Consider streaming report generation
   - Use faster model for final formatting

## Analyzing Backend Logs

For detailed backend timing information:

```bash
docker logs appardourwork-research-service-1 --tail 100
```

Look for timing information in the logs to identify specific slow operations.

## Troubleshooting

### Service Not Running

If you see:
```
✗ Cannot connect to research service: [Errno 111] Connection refused
  Make sure the service is running at http://localhost:8000
```

**Solution**: Start the research service:
```bash
docker-compose up research-service
```

### Timeout Errors

If tests timeout (> 5 minutes):
```
✗ Test timed out
```

**Possible Causes**:
- LLM API issues (check OpenAI/Anthropic status)
- Search API issues (check Tavily status)
- Network connectivity problems
- Backend stuck in infinite loop (check logs)

### Import Errors

If you see `ModuleNotFoundError: No module named 'aiohttp'`:

**Solution**: Install aiohttp:
```bash
pip install aiohttp
```

## Best Practices

1. **Run Multiple Times**: Performance can vary; run tests 2-3 times for average
2. **Monitor Backend Logs**: Keep logs open during testing for real-time insights
3. **Test Different Queries**: Vary complexity to understand performance characteristics
4. **Baseline Performance**: Establish baseline metrics before optimization
5. **Document Changes**: Keep performance reports when making code changes

## Integration with CI/CD

The script can be integrated into automated testing:

```bash
# Run performance tests and fail if average time > 60s
python3 test_performance.py && \
  python3 -c "
import json
with open('performance_data_*.json') as f:
    data = json.load(f)
    avg_time = data['analysis']['timing']['average_total']
    if avg_time > 60:
        print(f'Performance regression: {avg_time}s > 60s')
        exit(1)
"
```

## Advanced Usage

### Custom Base URL

Modify the `BASE_URL` constant in the script to test different environments:

```python
BASE_URL = "http://production-server:8000"
```

### Additional Metrics

The JSON output includes all events and can be analyzed further:

```python
import json

with open('performance_data_20251020_120000.json') as f:
    data = json.load(f)

    # Analyze event distribution
    for result in data['results']:
        event_types = {}
        for event in result['events']:
            event_type = event['type']
            event_types[event_type] = event_types.get(event_type, 0) + 1
        print(f"Test {result['test_id']} event distribution:", event_types)
```

## Support

For issues or questions about performance testing:
1. Check the research service logs
2. Verify API keys are configured correctly
3. Review the generated JSON output for detailed error information
4. Check network connectivity to LLM and search APIs
