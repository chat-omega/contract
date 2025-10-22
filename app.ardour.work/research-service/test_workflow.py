#!/usr/bin/env python3
"""
Additional workflow tests for Research Service
Test complete research workflow end-to-end
"""

import requests
import json
import time
import sys

BASE_URL = "http://127.0.0.1:8000"

def print_header(title):
    print(f"\n{'='*80}")
    print(f"{title:^80}")
    print(f"{'='*80}\n")

def test_simple_research():
    """Test a simple research workflow"""
    print_header("SIMPLE RESEARCH WORKFLOW TEST")

    # Start research
    print("1. Starting research session...")
    payload = {
        "query": "What is quantum computing?"
    }

    response = requests.post(f"{BASE_URL}/api/research/start", json=payload)
    if response.status_code != 200:
        print(f"ERROR: Failed to start research. Status: {response.status_code}")
        return False

    data = response.json()
    session_id = data['id']
    print(f"   Session ID: {session_id}")
    print(f"   Status: {data['status']}")
    print(f"   Query: {data['query']}")

    # Monitor progress via streaming
    print("\n2. Monitoring progress via SSE stream...")
    stream_url = f"{BASE_URL}/api/research/stream/{session_id}"

    try:
        response = requests.get(stream_url, stream=True, timeout=60)

        event_counts = {
            'status': 0,
            'progress': 0,
            'step_started': 0,
            'query_added': 0,
            'source_found': 0,
            'chunk': 0,
            'complete': 0
        }

        queries = []
        sources = []

        for line in response.iter_lines():
            if line:
                decoded = line.decode('utf-8')
                if decoded.startswith('data:'):
                    data_str = decoded[5:].strip()

                    if data_str == "[DONE]":
                        print("\n   Stream completed!")
                        break

                    try:
                        event_data = json.loads(data_str)
                        event_type = event_data.get('type', 'unknown')

                        if event_type in event_counts:
                            event_counts[event_type] += 1

                        # Collect queries
                        if event_type == 'query_added':
                            query = event_data['data']['query']
                            queries.append(query)
                            print(f"   Query {len(queries)}: {query[:60]}...")

                        # Collect sources
                        elif event_type == 'source_found':
                            source = event_data['data']
                            sources.append(source)
                            print(f"   Source: {source['title'][:50]}...")

                        # Show step changes
                        elif event_type == 'step_started':
                            phase = event_data['data']['phase']
                            print(f"\n   Phase: {phase}")

                        # Show progress
                        elif event_type == 'progress':
                            msg = event_data['data']
                            if "completed" in msg.lower() or "generating" in msg.lower():
                                print(f"   {msg}")

                        # Complete
                        elif event_type == 'complete':
                            print("\n   Research completed!")

                    except json.JSONDecodeError:
                        pass

        print(f"\n3. Event Summary:")
        print(f"   Total Events: {sum(event_counts.values())}")
        for event_type, count in event_counts.items():
            print(f"   - {event_type}: {count}")

        print(f"\n   Queries Generated: {len(queries)}")
        print(f"   Sources Found: {len(sources)}")

        # Get final session details
        print("\n4. Fetching final session details...")
        response = requests.get(f"{BASE_URL}/api/research/{session_id}")

        if response.status_code == 200:
            session = response.json()
            print(f"   Final Status: {session['status']}")

            if session.get('report'):
                report_length = len(session['report'])
                print(f"   Report Length: {report_length} characters")
                print(f"\n   Report Preview:")
                print("   " + "-"*76)
                preview = session['report'][:500]
                for line in preview.split('\n'):
                    print(f"   {line}")
                print("   ...")
                print("   " + "-"*76)

            if session.get('error'):
                print(f"   ERROR: {session['error']}")
                return False

        return True

    except Exception as e:
        print(f"ERROR: {e}")
        return False


def test_api_docs():
    """Test that API documentation is accessible"""
    print_header("API DOCUMENTATION TEST")

    # Check OpenAPI docs
    print("Checking OpenAPI documentation...")
    response = requests.get(f"{BASE_URL}/docs")

    if response.status_code == 200:
        print("   PASS: Swagger UI accessible at /docs")
    else:
        print(f"   FAIL: Swagger UI returned {response.status_code}")

    # Check OpenAPI schema
    response = requests.get(f"{BASE_URL}/openapi.json")

    if response.status_code == 200:
        schema = response.json()
        print(f"   PASS: OpenAPI schema accessible")
        print(f"   Title: {schema.get('info', {}).get('title', 'Unknown')}")
        print(f"   Version: {schema.get('info', {}).get('version', 'Unknown')}")
        print(f"   Endpoints: {len(schema.get('paths', {}))}")
    else:
        print(f"   FAIL: OpenAPI schema returned {response.status_code}")


def main():
    print("\n" + "="*80)
    print(" "*20 + "RESEARCH SERVICE WORKFLOW TESTS")
    print("="*80)

    # Test API docs
    test_api_docs()

    # Test simple research workflow
    success = test_simple_research()

    # Summary
    print_header("TEST SUMMARY")
    if success:
        print("   All workflow tests PASSED!")
        return 0
    else:
        print("   Some tests FAILED")
        return 1


if __name__ == "__main__":
    sys.exit(main())
