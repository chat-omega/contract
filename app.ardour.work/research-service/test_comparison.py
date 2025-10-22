"""
Model Comparison Test Script
Compare GPT-5 vs Cerebras GPT-OSS-120B for research report generation
"""

import asyncio
import json
import time
from datetime import datetime
from research_agent import ResearchAgent


class ComparisonTester:
    """Test and compare different LLM models for research tasks"""

    def __init__(self):
        self.agent = ResearchAgent()
        self.results = {}

    async def run_test(self, query: str, model: str):
        """Run a single test with specified model"""
        print(f"\n{'='*80}")
        print(f"Testing Model: {model}")
        print(f"Query: {query}")
        print(f"{'='*80}\n")

        # Track metrics
        start_time = time.time()
        events = []
        progress_messages = []

        def progress_callback(msg):
            progress_messages.append({
                "timestamp": datetime.now().isoformat(),
                "message": msg
            })
            print(f"📊 Progress: {msg}")

        def event_callback(event):
            events.append({
                "timestamp": datetime.now().isoformat(),
                **event
            })

        try:
            # Run research
            report = await self.agent.research(
                query=query,
                model=model,
                progress_callback=progress_callback,
                event_callback=event_callback
            )

            # Calculate metrics
            end_time = time.time()
            total_duration = end_time - start_time

            # Count events
            queries_generated = len([e for e in events if e.get("type") == "query_added"])
            sources_found = len([e for e in events if e.get("type") == "source_found"])

            # Analyze report
            report_length = len(report)
            report_words = len(report.split())
            report_lines = len(report.split('\n'))

            results = {
                "model": model,
                "query": query,
                "success": True,
                "duration_seconds": round(total_duration, 2),
                "report": report,
                "metrics": {
                    "queries_generated": queries_generated,
                    "sources_found": sources_found,
                    "report_length_chars": report_length,
                    "report_words": report_words,
                    "report_lines": report_lines,
                },
                "events": events,
                "progress": progress_messages,
                "timestamp": datetime.now().isoformat()
            }

            print(f"\n✅ Test completed successfully in {total_duration:.2f}s")
            print(f"📈 Metrics:")
            print(f"   - Queries: {queries_generated}")
            print(f"   - Sources: {sources_found}")
            print(f"   - Report: {report_words} words, {report_lines} lines")

            return results

        except Exception as e:
            print(f"\n❌ Test failed: {str(e)}")
            return {
                "model": model,
                "query": query,
                "success": False,
                "error": str(e),
                "duration_seconds": time.time() - start_time,
                "timestamp": datetime.now().isoformat()
            }

    async def compare_models(self, query: str, models: list):
        """Compare multiple models on the same query"""
        print(f"\n{'='*80}")
        print(f"COMPARATIVE TEST")
        print(f"Query: {query}")
        print(f"Models: {', '.join(models)}")
        print(f"{'='*80}\n")

        results = {}

        # Run tests sequentially to avoid rate limits
        for model in models:
            results[model] = await self.run_test(query, model)

            # Short pause between tests
            if model != models[-1]:
                print("\n⏸️  Pausing 5 seconds before next test...")
                await asyncio.sleep(5)

        return results

    def generate_comparison_report(self, results: dict, output_file: str = "comparison_report.md"):
        """Generate a markdown comparison report"""

        report_lines = [
            "# Model Comparison Report",
            f"\n**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            f"\n**Query:** {list(results.values())[0]['query']}",
            "\n---\n",
            "## Summary\n"
        ]

        # Summary table
        report_lines.append("| Model | Status | Duration | Queries | Sources | Words | Lines |")
        report_lines.append("|-------|--------|----------|---------|---------|-------|-------|")

        for model, result in results.items():
            if result.get('success'):
                metrics = result.get('metrics', {})
                row = (
                    f"| {model} "
                    f"| ✅ Success "
                    f"| {result['duration_seconds']}s "
                    f"| {metrics.get('queries_generated', 'N/A')} "
                    f"| {metrics.get('sources_found', 'N/A')} "
                    f"| {metrics.get('report_words', 'N/A')} "
                    f"| {metrics.get('report_lines', 'N/A')} |"
                )
            else:
                row = f"| {model} | ❌ Failed | {result['duration_seconds']}s | - | - | - | - |"
            report_lines.append(row)

        report_lines.append("\n---\n")

        # Detailed reports for each model
        for model, result in results.items():
            report_lines.append(f"\n## {model}\n")

            if result.get('success'):
                report_lines.append(f"**Duration:** {result['duration_seconds']} seconds\n")

                metrics = result.get('metrics', {})
                report_lines.append("**Metrics:**")
                report_lines.append(f"- Search queries generated: {metrics.get('queries_generated')}")
                report_lines.append(f"- Sources discovered: {metrics.get('sources_found')}")
                report_lines.append(f"- Report length: {metrics.get('report_words')} words, {metrics.get('report_lines')} lines\n")

                report_lines.append("**Generated Report:**\n")
                report_lines.append("```")
                report_lines.append(result.get('report', ''))
                report_lines.append("```\n")
            else:
                report_lines.append(f"**Status:** Failed")
                report_lines.append(f"**Error:** {result.get('error')}\n")

        # Analysis
        report_lines.append("\n---\n")
        report_lines.append("## Comparative Analysis\n")

        successful_results = {k: v for k, v in results.items() if v.get('success')}

        if len(successful_results) >= 2:
            # Speed comparison
            fastest = min(successful_results.items(), key=lambda x: x[1]['duration_seconds'])
            slowest = max(successful_results.items(), key=lambda x: x[1]['duration_seconds'])

            report_lines.append(f"**Speed:**")
            report_lines.append(f"- Fastest: {fastest[0]} ({fastest[1]['duration_seconds']}s)")
            report_lines.append(f"- Slowest: {slowest[0]} ({slowest[1]['duration_seconds']}s)")
            speedup = slowest[1]['duration_seconds'] / fastest[1]['duration_seconds']
            report_lines.append(f"- Speedup: {speedup:.2f}x\n")

            # Report length comparison
            longest = max(successful_results.items(),
                         key=lambda x: x[1]['metrics']['report_words'])
            shortest = min(successful_results.items(),
                          key=lambda x: x[1]['metrics']['report_words'])

            report_lines.append(f"**Report Comprehensiveness:**")
            report_lines.append(f"- Most comprehensive: {longest[0]} ({longest[1]['metrics']['report_words']} words)")
            report_lines.append(f"- Most concise: {shortest[0]} ({shortest[1]['metrics']['report_words']} words)\n")

            # Sources comparison
            most_sources = max(successful_results.items(),
                              key=lambda x: x[1]['metrics']['sources_found'])
            report_lines.append(f"**Research Depth:**")
            report_lines.append(f"- Most sources: {most_sources[0]} ({most_sources[1]['metrics']['sources_found']} sources)\n")

        # Save report
        report_content = '\n'.join(report_lines)
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(report_content)

        print(f"\n📄 Comparison report saved to: {output_file}")
        return report_content


async def main():
    """Run the comparison test"""

    # Test configuration
    test_query = "Analyze the M&A landscape for SaaS companies in 2024, including key trends, valuations, and strategic opportunities"
    models_to_test = [
        "gpt-5",
        "openai/gpt-oss-120b"  # Cerebras model
    ]

    # Run comparison
    tester = ComparisonTester()
    results = await tester.compare_models(test_query, models_to_test)

    # Generate report
    report = tester.generate_comparison_report(results)

    # Also save JSON results
    with open("comparison_results.json", 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print("📊 JSON results saved to: comparison_results.json")

    # Print summary
    print("\n" + "="*80)
    print("COMPARISON COMPLETE")
    print("="*80)

    for model, result in results.items():
        if result.get('success'):
            print(f"\n✅ {model}:")
            print(f"   Duration: {result['duration_seconds']}s")
            print(f"   Report: {result['metrics']['report_words']} words")
        else:
            print(f"\n❌ {model}: Failed - {result.get('error')}")


if __name__ == "__main__":
    asyncio.run(main())
