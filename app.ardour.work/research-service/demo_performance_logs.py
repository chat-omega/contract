#!/usr/bin/env python3
"""
Demo script to show expected performance log output from research_agent.py
This simulates what the logs will look like when the instrumented agent runs.
"""

import logging
import time

# Configure logging to show INFO level with timestamp
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

logger = logging.getLogger('research_agent')

def simulate_performance_logging():
    """Simulate the performance logging output from research_agent.py"""

    # Mock timing data (in seconds) based on typical research execution
    query_gen_time = 2.34
    search_times = [
        {"query": "AI agent frameworks 2024", "duration": 1.52, "results_count": 5},
        {"query": "LangGraph tutorial and examples", "duration": 1.68, "results_count": 5},
        {"query": "Deep research automation tools", "duration": 1.45, "results_count": 5}
    ]
    search_total_time = sum(s['duration'] for s in search_times)
    synth_time = 5.67
    report_time = 8.23
    total_time = query_gen_time + search_total_time + synth_time + report_time

    print("\n" + "=" * 80)
    print("SAMPLE PERFORMANCE LOG OUTPUT FROM INSTRUMENTED RESEARCH AGENT")
    print("=" * 80 + "\n")
    print("When research_agent.py executes a query, you will see logs like this:")
    print("-" * 80 + "\n")

    # Step 1: Query Generation
    logger.info("🔍 Step 1: Generating search queries...")
    time.sleep(0.1)
    logger.info(f"⏱️  Query Generation: {query_gen_time:.2f}s")

    # Step 2: Search Execution
    logger.info(f"🌐 Step 2: Executing {len(search_times)} searches...")
    for i, search_info in enumerate(search_times, 1):
        logger.info(f"  Searching {i}/{len(search_times)}: '{search_info['query']}'")
        time.sleep(0.05)
        logger.info(f"  ✓ Search {i} completed in {search_info['duration']:.2f}s, found {search_info['results_count']} results")
    logger.info(f"⏱️  Search Execution (Total): {search_total_time:.2f}s")

    # Step 3: Synthesis
    logger.info(f"🧠 Step 3: Synthesizing {sum(s['results_count'] for s in search_times)} findings...")
    time.sleep(0.1)
    logger.info(f"⏱️  Synthesis: {synth_time:.2f}s")

    # Step 4: Report Generation
    logger.info("📝 Step 4: Generating final report...")
    time.sleep(0.1)
    logger.info(f"⏱️  Report Generation: {report_time:.2f}s")

    # Performance Summary
    logger.info("=" * 60)
    logger.info("📊 PERFORMANCE SUMMARY")
    logger.info("=" * 60)
    logger.info(f"Query Generation:     {query_gen_time:.2f}s ({query_gen_time/total_time*100:.1f}%)")
    logger.info(f"Search Execution:     {search_total_time:.2f}s ({search_total_time/total_time*100:.1f}%)")
    for i, search_info in enumerate(search_times, 1):
        logger.info(f"  - Search {i}: {search_info['duration']}s ({search_info.get('results_count', 0)} results)")
    logger.info(f"Synthesis:            {synth_time:.2f}s ({synth_time/total_time*100:.1f}%)")
    logger.info(f"Report Generation:    {report_time:.2f}s ({report_time/total_time*100:.1f}%)")
    logger.info("-" * 60)
    logger.info(f"TOTAL TIME:           {total_time:.2f}s")
    logger.info("=" * 60)

    # Bottleneck Analysis
    step_times = {
        'query_generation': query_gen_time,
        'synthesis': synth_time,
        'report_generation': report_time
    }
    bottlenecks = sorted(
        [(k, v) for k, v in step_times.items()],
        key=lambda x: x[1],
        reverse=True
    )[:2]
    logger.info("🔴 Top Bottlenecks:")
    for step, duration in bottlenecks:
        logger.info(f"  - {step}: {duration:.2f}s ({duration/total_time*100:.1f}%)")
    logger.info("=" * 60)

    print("\n" + "=" * 80)
    print("KEY INSIGHTS FROM THIS OUTPUT:")
    print("-" * 80)
    print("✓ Each step is timed and logged individually")
    print("✓ Search queries show individual timing + results count")
    print("✓ Performance summary shows time breakdown with percentages")
    print("✓ Bottleneck analysis highlights the slowest steps")
    print("✓ All timing uses the logger for consistent output format")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    simulate_performance_logging()
