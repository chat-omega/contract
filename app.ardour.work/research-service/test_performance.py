#!/usr/bin/env python3
"""
Performance Testing Script for Research Service
Tests deep research execution time and identifies bottlenecks.
"""

import asyncio
import aiohttp
import time
import json
from datetime import datetime
from typing import Dict, List, Any
import sys

# Configuration
BASE_URL = "http://localhost:8000"
TEST_QUERIES = [
    "What are the top 3 M&A trends in healthtech in 2024?",
    "Analyze the competitive landscape for fitness wearable companies",
    "Create a market analysis for digital health platforms targeting chronic disease management"
]

class PerformanceTest:
    """Performance testing for research service"""

    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.results = []

    async def check_health(self) -> bool:
        """Check if research service is running"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}/health", timeout=5) as response:
                    if response.status == 200:
                        print("✓ Research service is healthy")
                        return True
                    else:
                        print(f"✗ Health check failed: {response.status}")
                        return False
        except Exception as e:
            print(f"✗ Cannot connect to research service: {e}")
            print(f"  Make sure the service is running at {self.base_url}")
            return False

    async def run_research_test(self, query: str, test_id: int) -> Dict[str, Any]:
        """Run a single research test and capture timing"""
        print(f"\n{'='*80}")
        print(f"TEST {test_id}: {query}")
        print(f"{'='*80}")

        test_result = {
            "test_id": test_id,
            "query": query,
            "timestamp": datetime.now().isoformat(),
            "events": [],
            "timing": {},
            "error": None
        }

        start_time = time.time()

        try:
            # Step 1: Start research session
            print("📤 Starting research session...")
            async with aiohttp.ClientSession() as session:
                # Create research request
                request_start = time.time()
                async with session.post(
                    f"{self.base_url}/api/research/start",
                    json={
                        "query": query,
                        "model": "gpt-4-turbo-preview",
                        "search_provider": "tavily"
                    },
                    timeout=10
                ) as response:
                    if response.status != 200:
                        raise Exception(f"Failed to start research: {response.status}")

                    data = await response.json()
                    session_id = data["session_id"]
                    request_time = time.time() - request_start

                    test_result["session_id"] = session_id
                    test_result["timing"]["request"] = round(request_time, 2)
                    print(f"✓ Session created: {session_id} ({request_time:.2f}s)")

                # Step 2: Stream events
                print("📡 Streaming research progress...")
                stream_start = time.time()
                event_count = 0

                async with session.get(
                    f"{self.base_url}/api/research/stream/{session_id}",
                    timeout=aiohttp.ClientTimeout(total=300)
                ) as stream_response:
                    if stream_response.status != 200:
                        raise Exception(f"Stream failed: {stream_response.status}")

                    async for line in stream_response.content:
                        line = line.decode('utf-8').strip()

                        if line.startswith('data:'):
                            event_count += 1
                            event_data = line[5:].strip()

                            try:
                                event = json.loads(event_data)
                                event_time = time.time() - stream_start

                                event_info = {
                                    "time": round(event_time, 2),
                                    "type": event.get("type"),
                                    "message": event.get("message", "")[:100]  # Truncate long messages
                                }
                                test_result["events"].append(event_info)

                                # Log important events
                                if event.get("type") in ["step_started", "complete", "error"]:
                                    print(f"  [{event_time:6.2f}s] {event.get('type')}: {event.get('message', '')[:80]}")

                                # Exit on completion or error
                                if event.get("type") in ["complete", "error"]:
                                    if event.get("type") == "error":
                                        test_result["error"] = event.get("message")
                                    break

                            except json.JSONDecodeError:
                                pass

                stream_time = time.time() - stream_start
                test_result["timing"]["stream"] = round(stream_time, 2)
                test_result["event_count"] = event_count

                # Step 3: Get final results
                print("📥 Fetching final results...")
                async with session.get(
                    f"{self.base_url}/api/research/{session_id}",
                    timeout=10
                ) as response:
                    if response.status == 200:
                        final_data = await response.json()
                        test_result["status"] = final_data.get("status")
                        test_result["report_length"] = len(final_data.get("report", ""))
                        print(f"✓ Report length: {test_result['report_length']} characters")

        except asyncio.TimeoutError:
            test_result["error"] = "Request timed out"
            print("✗ Test timed out")
        except Exception as e:
            test_result["error"] = str(e)
            print(f"✗ Test failed: {e}")

        # Calculate total time
        total_time = time.time() - start_time
        test_result["timing"]["total"] = round(total_time, 2)

        print(f"\n📊 Test completed in {total_time:.2f}s")

        return test_result

    def analyze_results(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze test results and identify bottlenecks"""
        analysis = {
            "summary": {
                "total_tests": len(results),
                "successful_tests": len([r for r in results if not r.get("error")]),
                "failed_tests": len([r for r in results if r.get("error")]),
            },
            "timing": {
                "average_total": 0,
                "min_total": float('inf'),
                "max_total": 0,
                "average_stream": 0
            },
            "bottlenecks": [],
            "recommendations": []
        }

        # Calculate timing statistics
        successful_results = [r for r in results if not r.get("error")]
        if successful_results:
            total_times = [r["timing"]["total"] for r in successful_results]
            stream_times = [r["timing"].get("stream", 0) for r in successful_results]

            analysis["timing"]["average_total"] = round(sum(total_times) / len(total_times), 2)
            analysis["timing"]["min_total"] = round(min(total_times), 2)
            analysis["timing"]["max_total"] = round(max(total_times), 2)
            analysis["timing"]["average_stream"] = round(sum(stream_times) / len(stream_times), 2)

        # Identify bottlenecks (analyze from backend logs if available)
        if analysis["timing"]["average_total"] > 60:
            analysis["bottlenecks"].append({
                "issue": "Total execution time exceeds 60 seconds",
                "severity": "high",
                "recommendation": "Consider parallelizing search queries or using faster LLM models for certain steps"
            })

        if analysis["timing"]["average_stream"] > 50:
            analysis["bottlenecks"].append({
                "issue": "Stream time is high (indicates backend processing bottleneck)",
                "severity": "high",
                "recommendation": "Check backend logs for LLM or search API timing"
            })

        # Generate recommendations
        if analysis["timing"]["average_total"] > 30:
            analysis["recommendations"].extend([
                "Parallelize search API calls using asyncio.gather()",
                "Consider using streaming responses for report generation",
                "Use gpt-3.5-turbo for query generation, reserve gpt-4 for synthesis/report",
                "Implement caching for frequently searched queries"
            ])

        return analysis

    def generate_report(self, results: List[Dict[str, Any]], analysis: Dict[str, Any]) -> str:
        """Generate formatted performance report"""
        report_lines = []
        report_lines.append("=" * 80)
        report_lines.append("RESEARCH SERVICE PERFORMANCE REPORT")
        report_lines.append("=" * 80)
        report_lines.append(f"Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report_lines.append(f"Base URL: {self.base_url}")
        report_lines.append("")

        # Summary
        report_lines.append("SUMMARY")
        report_lines.append("-" * 80)
        report_lines.append(f"Total Tests: {analysis['summary']['total_tests']}")
        report_lines.append(f"Successful: {analysis['summary']['successful_tests']}")
        report_lines.append(f"Failed: {analysis['summary']['failed_tests']}")
        report_lines.append("")

        # Timing
        report_lines.append("TIMING STATISTICS")
        report_lines.append("-" * 80)
        report_lines.append(f"Average Total Time: {analysis['timing']['average_total']}s")
        report_lines.append(f"Min Total Time: {analysis['timing']['min_total']}s")
        report_lines.append(f"Max Total Time: {analysis['timing']['max_total']}s")
        report_lines.append(f"Average Stream Time: {analysis['timing']['average_stream']}s")
        report_lines.append("")

        # Detailed results
        report_lines.append("DETAILED RESULTS")
        report_lines.append("-" * 80)
        for result in results:
            report_lines.append(f"\nTest {result['test_id']}: {result['query'][:60]}...")
            report_lines.append(f"  Status: {'✓ Success' if not result.get('error') else '✗ Failed: ' + result.get('error', '')}")
            report_lines.append(f"  Total Time: {result['timing']['total']}s")
            report_lines.append(f"  Events: {result.get('event_count', 0)}")
            if not result.get('error'):
                report_lines.append(f"  Report Length: {result.get('report_length', 0)} chars")

        report_lines.append("")

        # Bottlenecks
        if analysis["bottlenecks"]:
            report_lines.append("IDENTIFIED BOTTLENECKS")
            report_lines.append("-" * 80)
            for bottleneck in analysis["bottlenecks"]:
                report_lines.append(f"⚠️  {bottleneck['issue']}")
                report_lines.append(f"   Severity: {bottleneck['severity'].upper()}")
                report_lines.append(f"   Recommendation: {bottleneck['recommendation']}")
                report_lines.append("")

        # Recommendations
        if analysis["recommendations"]:
            report_lines.append("OPTIMIZATION RECOMMENDATIONS")
            report_lines.append("-" * 80)
            for i, rec in enumerate(analysis["recommendations"], 1):
                report_lines.append(f"{i}. {rec}")

        report_lines.append("")
        report_lines.append("=" * 80)
        report_lines.append("For detailed backend timing, check Docker logs:")
        report_lines.append("  docker logs appardourwork-research-service-1")
        report_lines.append("=" * 80)

        return "\n".join(report_lines)

    async def run_tests(self, queries: List[str] = None):
        """Run all performance tests"""
        if queries is None:
            queries = TEST_QUERIES

        # Check health first
        if not await self.check_health():
            print("\n⚠️  Research service is not available. Start it with:")
            print("     docker-compose up research-service")
            return

        # Run tests
        for i, query in enumerate(queries, 1):
            result = await self.run_research_test(query, i)
            self.results.append(result)

            # Brief pause between tests
            if i < len(queries):
                await asyncio.sleep(2)

        # Analyze and report
        analysis = self.analyze_results(self.results)
        report = self.generate_report(self.results, analysis)

        # Print report
        print("\n\n")
        print(report)

        # Save to file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = f"performance_report_{timestamp}.txt"
        json_file = f"performance_data_{timestamp}.json"

        with open(report_file, 'w') as f:
            f.write(report)

        with open(json_file, 'w') as f:
            json.dump({
                "results": self.results,
                "analysis": analysis
            }, f, indent=2)

        print(f"\n📄 Reports saved:")
        print(f"  - {report_file}")
        print(f"  - {json_file}")

async def main():
    """Main entry point"""
    tester = PerformanceTest()

    # Use custom queries if provided
    queries = sys.argv[1:] if len(sys.argv) > 1 else None

    await tester.run_tests(queries)

if __name__ == "__main__":
    asyncio.run(main())
