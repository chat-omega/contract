#!/usr/bin/env python3
"""
Comprehensive Integration Testing for Research Service
Tests all endpoints, environment variables, error handling, and performance
"""

import os
import sys
import time
import json
import asyncio
import requests
from typing import Dict, List, Any
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
BASE_URL = os.getenv("RESEARCH_SERVICE_URL", "http://localhost:8000")
TIMEOUT = 30  # seconds


class Colors:
    """Terminal colors for output"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'


class TestResult:
    """Store test results"""
    def __init__(self):
        self.total_tests = 0
        self.passed = 0
        self.failed = 0
        self.warnings = 0
        self.results = []
        self.start_time = time.time()

    def add_result(self, test_name: str, status: str, message: str, duration: float = 0, details: dict = None):
        self.total_tests += 1
        if status == "PASS":
            self.passed += 1
        elif status == "FAIL":
            self.failed += 1
        elif status == "WARN":
            self.warnings += 1

        self.results.append({
            "test_name": test_name,
            "status": status,
            "message": message,
            "duration": duration,
            "details": details or {}
        })

    def print_result(self, test_name: str, status: str, message: str, duration: float = 0):
        color = Colors.OKGREEN if status == "PASS" else Colors.FAIL if status == "FAIL" else Colors.WARNING
        duration_str = f"({duration:.2f}s)" if duration > 0 else ""
        print(f"{color}[{status}]{Colors.ENDC} {test_name}: {message} {duration_str}")


def print_section(title: str):
    """Print section header"""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*80}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{title:^80}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*80}{Colors.ENDC}\n")


def test_service_health(results: TestResult):
    """Test if service is running and healthy"""
    print_section("SERVICE HEALTH CHECK")

    # Test root endpoint
    start = time.time()
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        duration = time.time() - start

        if response.status_code == 200:
            data = response.json()
            results.add_result(
                "Root Endpoint",
                "PASS",
                f"Service is running: {data.get('service', 'Unknown')} v{data.get('version', 'Unknown')}",
                duration,
                data
            )
            results.print_result("Root Endpoint", "PASS",
                               f"Service is running: {data.get('service', 'Unknown')}", duration)
        else:
            results.add_result(
                "Root Endpoint",
                "FAIL",
                f"Unexpected status code: {response.status_code}",
                duration
            )
            results.print_result("Root Endpoint", "FAIL",
                               f"Status code: {response.status_code}", duration)
    except Exception as e:
        duration = time.time() - start
        results.add_result("Root Endpoint", "FAIL", f"Connection failed: {str(e)}", duration)
        results.print_result("Root Endpoint", "FAIL", f"Connection failed: {str(e)}", duration)
        return False

    # Test health endpoint
    start = time.time()
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        duration = time.time() - start

        if response.status_code == 200:
            data = response.json()
            results.add_result(
                "Health Endpoint",
                "PASS",
                f"Status: {data.get('status', 'unknown')}",
                duration,
                data
            )
            results.print_result("Health Endpoint", "PASS",
                               f"Status: {data.get('status', 'unknown')}", duration)
        else:
            results.add_result(
                "Health Endpoint",
                "FAIL",
                f"Status code: {response.status_code}",
                duration
            )
            results.print_result("Health Endpoint", "FAIL",
                               f"Status code: {response.status_code}", duration)
    except Exception as e:
        duration = time.time() - start
        results.add_result("Health Endpoint", "FAIL", f"Error: {str(e)}", duration)
        results.print_result("Health Endpoint", "FAIL", f"Error: {str(e)}", duration)

    return True


def test_environment_variables(results: TestResult):
    """Test environment variable configuration"""
    print_section("ENVIRONMENT VARIABLES CHECK")

    required_vars = {
        "OPENAI_API_KEY": "OpenAI API Key",
        "TAVILY_API_KEY": "Tavily API Key"
    }

    optional_vars = {
        "CORS_ORIGINS": "CORS Origins",
        "PORT": "Server Port",
        "ANTHROPIC_API_KEY": "Anthropic API Key (optional)",
        "LANGSMITH_API_KEY": "LangSmith API Key (optional)",
        "DEFAULT_MODEL": "Default LLM Model",
        "DEFAULT_SEARCH_PROVIDER": "Default Search Provider"
    }

    # Check required variables
    for var_name, description in required_vars.items():
        value = os.getenv(var_name)
        if value:
            # Mask the key for security
            masked = value[:8] + "..." + value[-4:] if len(value) > 12 else "***"
            results.add_result(
                f"Env Var: {var_name}",
                "PASS",
                f"{description} is configured ({masked})",
                details={"configured": True, "length": len(value)}
            )
            results.print_result(f"Env Var: {var_name}", "PASS",
                               f"{description} configured ({masked})")
        else:
            results.add_result(
                f"Env Var: {var_name}",
                "FAIL",
                f"{description} is NOT configured (REQUIRED)",
                details={"configured": False}
            )
            results.print_result(f"Env Var: {var_name}", "FAIL",
                               f"{description} NOT configured")

    # Check optional variables
    for var_name, description in optional_vars.items():
        value = os.getenv(var_name)
        if value:
            results.add_result(
                f"Env Var: {var_name}",
                "PASS",
                f"{description}: {value[:50]}",
                details={"configured": True, "value": value}
            )
            results.print_result(f"Env Var: {var_name}", "PASS",
                               f"{description}: {value[:50]}")
        else:
            results.add_result(
                f"Env Var: {var_name}",
                "WARN",
                f"{description} not configured (optional)",
                details={"configured": False}
            )
            results.print_result(f"Env Var: {var_name}", "WARN",
                               f"{description} not configured")


def test_start_research_endpoint(results: TestResult) -> str:
    """Test POST /api/research/start endpoint"""
    print_section("START RESEARCH ENDPOINT TEST")

    # Test with valid request
    start = time.time()
    try:
        payload = {
            "query": "What are the latest developments in AI and machine learning in 2024?",
            "model": "gpt-4-turbo-preview",
            "searchProvider": "tavily"
        }

        response = requests.post(
            f"{BASE_URL}/api/research/start",
            json=payload,
            timeout=10
        )
        duration = time.time() - start

        if response.status_code == 200:
            data = response.json()
            session_id = data.get("id")

            # Validate response structure
            required_fields = ["id", "query", "status", "createdAt", "updatedAt"]
            missing_fields = [f for f in required_fields if f not in data]

            if missing_fields:
                results.add_result(
                    "Start Research - Valid Request",
                    "FAIL",
                    f"Missing fields: {missing_fields}",
                    duration,
                    data
                )
                results.print_result("Start Research - Valid Request", "FAIL",
                                   f"Missing fields: {missing_fields}", duration)
                return None

            results.add_result(
                "Start Research - Valid Request",
                "PASS",
                f"Session created: {session_id[:8]}..., Status: {data.get('status')}",
                duration,
                data
            )
            results.print_result("Start Research - Valid Request", "PASS",
                               f"Session: {session_id[:8]}...", duration)
            return session_id
        else:
            results.add_result(
                "Start Research - Valid Request",
                "FAIL",
                f"Status code: {response.status_code}",
                duration,
                {"status_code": response.status_code, "response": response.text}
            )
            results.print_result("Start Research - Valid Request", "FAIL",
                               f"Status: {response.status_code}", duration)
            return None

    except Exception as e:
        duration = time.time() - start
        results.add_result(
            "Start Research - Valid Request",
            "FAIL",
            f"Error: {str(e)}",
            duration
        )
        results.print_result("Start Research - Valid Request", "FAIL",
                           f"Error: {str(e)}", duration)
        return None


def test_session_endpoint(results: TestResult, session_id: str):
    """Test GET /api/research/{session_id} endpoint"""
    print_section("GET SESSION ENDPOINT TEST")

    if not session_id:
        results.add_result(
            "Get Session - Valid ID",
            "FAIL",
            "No session ID available from previous test",
            0
        )
        results.print_result("Get Session - Valid ID", "FAIL",
                           "No session ID from previous test")
        return

    # Test with valid session ID
    start = time.time()
    try:
        response = requests.get(
            f"{BASE_URL}/api/research/{session_id}",
            timeout=5
        )
        duration = time.time() - start

        if response.status_code == 200:
            data = response.json()
            results.add_result(
                "Get Session - Valid ID",
                "PASS",
                f"Retrieved session: {data.get('status')}",
                duration,
                data
            )
            results.print_result("Get Session - Valid ID", "PASS",
                               f"Status: {data.get('status')}", duration)
        else:
            results.add_result(
                "Get Session - Valid ID",
                "FAIL",
                f"Status code: {response.status_code}",
                duration
            )
            results.print_result("Get Session - Valid ID", "FAIL",
                               f"Status: {response.status_code}", duration)
    except Exception as e:
        duration = time.time() - start
        results.add_result(
            "Get Session - Valid ID",
            "FAIL",
            f"Error: {str(e)}",
            duration
        )
        results.print_result("Get Session - Valid ID", "FAIL",
                           f"Error: {str(e)}", duration)

    # Test with invalid session ID
    start = time.time()
    try:
        response = requests.get(
            f"{BASE_URL}/api/research/invalid-session-id-12345",
            timeout=5
        )
        duration = time.time() - start

        if response.status_code == 404:
            results.add_result(
                "Get Session - Invalid ID",
                "PASS",
                "Correctly returned 404 for invalid session",
                duration
            )
            results.print_result("Get Session - Invalid ID", "PASS",
                               "Correctly returned 404", duration)
        else:
            results.add_result(
                "Get Session - Invalid ID",
                "FAIL",
                f"Expected 404, got {response.status_code}",
                duration
            )
            results.print_result("Get Session - Invalid ID", "FAIL",
                               f"Expected 404, got {response.status_code}", duration)
    except Exception as e:
        duration = time.time() - start
        results.add_result(
            "Get Session - Invalid ID",
            "FAIL",
            f"Error: {str(e)}",
            duration
        )
        results.print_result("Get Session - Invalid ID", "FAIL",
                           f"Error: {str(e)}", duration)


def test_history_endpoint(results: TestResult):
    """Test GET /api/research/history endpoint"""
    print_section("HISTORY ENDPOINT TEST")

    start = time.time()
    try:
        response = requests.get(
            f"{BASE_URL}/api/research/history",
            timeout=5
        )
        duration = time.time() - start

        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                results.add_result(
                    "Research History",
                    "PASS",
                    f"Retrieved {len(data)} sessions",
                    duration,
                    {"count": len(data)}
                )
                results.print_result("Research History", "PASS",
                                   f"Retrieved {len(data)} sessions", duration)
            else:
                results.add_result(
                    "Research History",
                    "FAIL",
                    "Response is not a list",
                    duration
                )
                results.print_result("Research History", "FAIL",
                                   "Response is not a list", duration)
        else:
            results.add_result(
                "Research History",
                "FAIL",
                f"Status code: {response.status_code}",
                duration
            )
            results.print_result("Research History", "FAIL",
                               f"Status: {response.status_code}", duration)
    except Exception as e:
        duration = time.time() - start
        results.add_result(
            "Research History",
            "FAIL",
            f"Error: {str(e)}",
            duration
        )
        results.print_result("Research History", "FAIL",
                           f"Error: {str(e)}", duration)


def test_stream_endpoint(results: TestResult, session_id: str):
    """Test GET /api/research/stream/{session_id} endpoint"""
    print_section("STREAM ENDPOINT TEST")

    if not session_id:
        results.add_result(
            "Stream Research - SSE",
            "FAIL",
            "No session ID available",
            0
        )
        results.print_result("Stream Research - SSE", "FAIL",
                           "No session ID available")
        return

    start = time.time()
    try:
        # Test SSE streaming
        response = requests.get(
            f"{BASE_URL}/api/research/stream/{session_id}",
            stream=True,
            timeout=60
        )

        if response.status_code == 200:
            event_count = 0
            event_types = set()

            # Read first few events (don't wait for completion)
            for i, line in enumerate(response.iter_lines()):
                if i > 20:  # Just check first 20 lines
                    break

                if line:
                    decoded = line.decode('utf-8')
                    if decoded.startswith('data:'):
                        event_count += 1
                        try:
                            data_str = decoded[5:].strip()
                            if data_str != "[DONE]":
                                event_data = json.loads(data_str)
                                event_types.add(event_data.get('type', 'unknown'))
                        except:
                            pass

            duration = time.time() - start
            results.add_result(
                "Stream Research - SSE",
                "PASS",
                f"Received {event_count} events, types: {event_types}",
                duration,
                {"event_count": event_count, "event_types": list(event_types)}
            )
            results.print_result("Stream Research - SSE", "PASS",
                               f"Received {event_count} events", duration)
        else:
            duration = time.time() - start
            results.add_result(
                "Stream Research - SSE",
                "FAIL",
                f"Status code: {response.status_code}",
                duration
            )
            results.print_result("Stream Research - SSE", "FAIL",
                               f"Status: {response.status_code}", duration)

    except Exception as e:
        duration = time.time() - start
        results.add_result(
            "Stream Research - SSE",
            "FAIL",
            f"Error: {str(e)}",
            duration
        )
        results.print_result("Stream Research - SSE", "FAIL",
                           f"Error: {str(e)}", duration)


def test_error_handling(results: TestResult):
    """Test error handling scenarios"""
    print_section("ERROR HANDLING TESTS")

    # Test missing query parameter
    start = time.time()
    try:
        response = requests.post(
            f"{BASE_URL}/api/research/start",
            json={},  # Missing query
            timeout=5
        )
        duration = time.time() - start

        if response.status_code == 422:  # Validation error
            results.add_result(
                "Error Handling - Missing Query",
                "PASS",
                "Correctly rejected request with missing query",
                duration
            )
            results.print_result("Error Handling - Missing Query", "PASS",
                               "Correctly rejected missing query", duration)
        else:
            results.add_result(
                "Error Handling - Missing Query",
                "FAIL",
                f"Expected 422, got {response.status_code}",
                duration
            )
            results.print_result("Error Handling - Missing Query", "FAIL",
                               f"Expected 422, got {response.status_code}", duration)
    except Exception as e:
        duration = time.time() - start
        results.add_result(
            "Error Handling - Missing Query",
            "FAIL",
            f"Error: {str(e)}",
            duration
        )
        results.print_result("Error Handling - Missing Query", "FAIL",
                           f"Error: {str(e)}", duration)

    # Test invalid JSON
    start = time.time()
    try:
        response = requests.post(
            f"{BASE_URL}/api/research/start",
            data="invalid json",
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        duration = time.time() - start

        if response.status_code in [400, 422]:
            results.add_result(
                "Error Handling - Invalid JSON",
                "PASS",
                f"Correctly rejected invalid JSON (status {response.status_code})",
                duration
            )
            results.print_result("Error Handling - Invalid JSON", "PASS",
                               f"Correctly rejected (status {response.status_code})", duration)
        else:
            results.add_result(
                "Error Handling - Invalid JSON",
                "FAIL",
                f"Expected 400/422, got {response.status_code}",
                duration
            )
            results.print_result("Error Handling - Invalid JSON", "FAIL",
                               f"Expected 400/422, got {response.status_code}", duration)
    except Exception as e:
        duration = time.time() - start
        results.add_result(
            "Error Handling - Invalid JSON",
            "FAIL",
            f"Error: {str(e)}",
            duration
        )
        results.print_result("Error Handling - Invalid JSON", "FAIL",
                           f"Error: {str(e)}", duration)


def test_performance(results: TestResult):
    """Test performance metrics"""
    print_section("PERFORMANCE TESTS")

    # Test response time for health check
    response_times = []
    for i in range(5):
        start = time.time()
        try:
            response = requests.get(f"{BASE_URL}/health", timeout=5)
            duration = time.time() - start
            if response.status_code == 200:
                response_times.append(duration)
        except:
            pass

    if response_times:
        avg_response = sum(response_times) / len(response_times)
        max_response = max(response_times)
        min_response = min(response_times)

        status = "PASS" if avg_response < 1.0 else "WARN"
        results.add_result(
            "Performance - Health Endpoint",
            status,
            f"Avg: {avg_response:.3f}s, Min: {min_response:.3f}s, Max: {max_response:.3f}s",
            0,
            {"avg": avg_response, "min": min_response, "max": max_response}
        )
        results.print_result("Performance - Health Endpoint", status,
                           f"Avg: {avg_response:.3f}s")
    else:
        results.add_result(
            "Performance - Health Endpoint",
            "FAIL",
            "Could not measure response times",
            0
        )
        results.print_result("Performance - Health Endpoint", "FAIL",
                           "Could not measure")


def generate_report(results: TestResult):
    """Generate comprehensive test report"""
    print_section("INTEGRATION TEST REPORT")

    total_duration = time.time() - results.start_time

    # Summary
    print(f"{Colors.BOLD}Test Summary:{Colors.ENDC}")
    print(f"  Total Tests:     {results.total_tests}")
    print(f"  {Colors.OKGREEN}Passed:          {results.passed}{Colors.ENDC}")
    print(f"  {Colors.FAIL}Failed:          {results.failed}{Colors.ENDC}")
    print(f"  {Colors.WARNING}Warnings:        {results.warnings}{Colors.ENDC}")
    print(f"  Duration:        {total_duration:.2f}s")

    success_rate = (results.passed / results.total_tests * 100) if results.total_tests > 0 else 0
    print(f"  Success Rate:    {success_rate:.1f}%")

    # Detailed results
    if results.failed > 0:
        print(f"\n{Colors.FAIL}{Colors.BOLD}Failed Tests:{Colors.ENDC}")
        for result in results.results:
            if result["status"] == "FAIL":
                print(f"  - {result['test_name']}: {result['message']}")

    if results.warnings > 0:
        print(f"\n{Colors.WARNING}{Colors.BOLD}Warnings:{Colors.ENDC}")
        for result in results.results:
            if result["status"] == "WARN":
                print(f"  - {result['test_name']}: {result['message']}")

    # Recommendations
    print(f"\n{Colors.BOLD}Recommendations:{Colors.ENDC}")

    if results.failed > 0:
        print(f"  {Colors.FAIL}1. Fix failed tests before deploying to production{Colors.ENDC}")

    # Check for API key configuration
    has_openai = os.getenv("OPENAI_API_KEY")
    has_tavily = os.getenv("TAVILY_API_KEY")

    if not has_openai:
        print(f"  {Colors.FAIL}2. Configure OPENAI_API_KEY environment variable{Colors.ENDC}")
    if not has_tavily:
        print(f"  {Colors.FAIL}3. Configure TAVILY_API_KEY environment variable{Colors.ENDC}")

    if results.failed == 0 and has_openai and has_tavily:
        print(f"  {Colors.OKGREEN}All critical tests passed! Service is ready for use.{Colors.ENDC}")

    # Save detailed report to file
    report_file = f"/home/ubuntu/contract1/app.ardour.work/research-service/integration_test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(report_file, 'w') as f:
        json.dump({
            "summary": {
                "total_tests": results.total_tests,
                "passed": results.passed,
                "failed": results.failed,
                "warnings": results.warnings,
                "success_rate": success_rate,
                "duration": total_duration,
                "timestamp": datetime.now().isoformat()
            },
            "results": results.results
        }, f, indent=2)

    print(f"\n{Colors.OKCYAN}Detailed report saved to: {report_file}{Colors.ENDC}")

    return results.failed == 0


def main():
    """Main test execution"""
    print(f"\n{Colors.BOLD}{Colors.HEADER}")
    print("=" * 80)
    print(" " * 20 + "RESEARCH SERVICE INTEGRATION TESTS")
    print("=" * 80)
    print(f"{Colors.ENDC}\n")

    print(f"Testing service at: {Colors.OKCYAN}{BASE_URL}{Colors.ENDC}")
    print(f"Timeout: {TIMEOUT}s\n")

    results = TestResult()

    # Run tests
    if not test_service_health(results):
        print(f"\n{Colors.FAIL}Service is not reachable. Aborting tests.{Colors.ENDC}")
        return 1

    test_environment_variables(results)

    # Test endpoints
    session_id = test_start_research_endpoint(results)
    test_session_endpoint(results, session_id)
    test_history_endpoint(results)
    test_stream_endpoint(results, session_id)

    # Test error handling
    test_error_handling(results)

    # Test performance
    test_performance(results)

    # Generate report
    success = generate_report(results)

    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
