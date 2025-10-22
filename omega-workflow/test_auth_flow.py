#!/usr/bin/env python3
"""
Comprehensive Authentication Flow Test Script
Tests all authentication endpoints and edge cases for the Omega Workflow application.
"""

import requests
import json
import time
import sys
from datetime import datetime
from typing import Dict, List, Tuple, Optional

# Configuration
BASE_URL = "http://localhost:5001"
API_BASE = f"{BASE_URL}/api"

# Test results tracking
test_results = []
total_tests = 0
passed_tests = 0
failed_tests = 0

# Color codes for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_header(text: str):
    """Print a formatted header"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text.center(80)}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.END}\n")

def print_test(test_name: str):
    """Print test name"""
    print(f"{Colors.BOLD}Testing: {test_name}{Colors.END}")

def print_pass(message: str):
    """Print success message"""
    print(f"  {Colors.GREEN}✓ PASS:{Colors.END} {message}")

def print_fail(message: str):
    """Print failure message"""
    print(f"  {Colors.RED}✗ FAIL:{Colors.END} {message}")

def print_info(message: str):
    """Print info message"""
    print(f"  {Colors.YELLOW}ℹ INFO:{Colors.END} {message}")

def record_test(test_name: str, passed: bool, message: str, details: Optional[Dict] = None):
    """Record test result"""
    global total_tests, passed_tests, failed_tests
    total_tests += 1
    if passed:
        passed_tests += 1
        print_pass(message)
    else:
        failed_tests += 1
        print_fail(message)

    test_results.append({
        'test': test_name,
        'passed': passed,
        'message': message,
        'details': details,
        'timestamp': datetime.now().isoformat()
    })

def test_health_check() -> bool:
    """Test 1: Health check endpoint"""
    print_test("Health Check")
    try:
        response = requests.get(f"{API_BASE}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            record_test("health_check", True, f"Server is healthy: {data}")
            return True
        else:
            record_test("health_check", False, f"Unexpected status code: {response.status_code}")
            return False
    except Exception as e:
        record_test("health_check", False, f"Health check failed: {str(e)}")
        return False

def test_register_user(username: str, email: str, password: str) -> Tuple[bool, Optional[Dict]]:
    """Test 2: User registration"""
    print_test(f"User Registration: {username}")
    try:
        payload = {
            "username": username,
            "email": email,
            "password": password
        }

        response = requests.post(
            f"{API_BASE}/auth/register",
            json=payload,
            timeout=10
        )

        if response.status_code == 201:
            data = response.json()
            if data.get('success') and data.get('token') and data.get('user'):
                record_test(
                    "register_user",
                    True,
                    f"User registered successfully: {username}",
                    {'user': data.get('user'), 'has_token': bool(data.get('token'))}
                )
                return True, data
            else:
                record_test(
                    "register_user",
                    False,
                    f"Registration response missing required fields: {data}"
                )
                return False, None
        elif response.status_code == 400:
            # Validation error - expected for some tests
            data = response.json()
            record_test(
                "register_user",
                True,
                f"Validation error (expected): {data.get('error')}",
                {'validation_error': data.get('error')}
            )
            return True, None
        else:
            record_test(
                "register_user",
                False,
                f"Registration failed with status {response.status_code}: {response.text}"
            )
            return False, None

    except Exception as e:
        record_test("register_user", False, f"Registration request failed: {str(e)}")
        return False, None

def test_register_validation():
    """Test 3: Registration validation rules"""
    print_test("Registration Input Validation")

    test_cases = [
        {
            'name': 'Short username',
            'data': {'username': 'ab', 'email': 'test@test.com', 'password': 'password123'},
            'should_fail': True,
            'expected_error': 'Username must be at least 3 characters'
        },
        {
            'name': 'Invalid email',
            'data': {'username': 'testuser', 'email': 'invalid-email', 'password': 'password123'},
            'should_fail': True,
            'expected_error': 'Valid email is required'
        },
        {
            'name': 'Short password',
            'data': {'username': 'testuser', 'email': 'test@test.com', 'password': '12345'},
            'should_fail': True,
            'expected_error': 'Password must be at least 6 characters'
        },
        {
            'name': 'Missing fields',
            'data': {'username': 'testuser'},
            'should_fail': True,
            'expected_error': 'required'
        }
    ]

    all_passed = True
    for test_case in test_cases:
        try:
            response = requests.post(
                f"{API_BASE}/auth/register",
                json=test_case['data'],
                timeout=10
            )

            if test_case['should_fail']:
                if response.status_code == 400:
                    error_msg = response.json().get('error', '')
                    if test_case['expected_error'].lower() in error_msg.lower():
                        record_test(
                            f"register_validation_{test_case['name']}",
                            True,
                            f"Correctly rejected: {test_case['name']}"
                        )
                    else:
                        record_test(
                            f"register_validation_{test_case['name']}",
                            False,
                            f"Wrong error message. Expected '{test_case['expected_error']}', got '{error_msg}'"
                        )
                        all_passed = False
                else:
                    record_test(
                        f"register_validation_{test_case['name']}",
                        False,
                        f"Should have failed with 400, got {response.status_code}"
                    )
                    all_passed = False
        except Exception as e:
            record_test(
                f"register_validation_{test_case['name']}",
                False,
                f"Validation test failed: {str(e)}"
            )
            all_passed = False

    return all_passed

def test_login(username: str, password: str) -> Tuple[bool, Optional[str]]:
    """Test 4: User login"""
    print_test(f"User Login: {username}")
    try:
        payload = {
            "username": username,
            "password": password
        }

        response = requests.post(
            f"{API_BASE}/auth/login",
            json=payload,
            timeout=10
        )

        if response.status_code == 200:
            data = response.json()
            token = data.get('token')
            user = data.get('user')

            if token and user:
                record_test(
                    "login",
                    True,
                    f"Login successful for {username}",
                    {'user': user, 'token_length': len(token)}
                )
                return True, token
            else:
                record_test(
                    "login",
                    False,
                    f"Login response missing token or user: {data}"
                )
                return False, None
        elif response.status_code == 401:
            record_test(
                "login",
                False,
                f"Login failed with 401: {response.json().get('error')}"
            )
            return False, None
        else:
            record_test(
                "login",
                False,
                f"Login failed with status {response.status_code}: {response.text}"
            )
            return False, None

    except Exception as e:
        record_test("login", False, f"Login request failed: {str(e)}")
        return False, None

def test_login_invalid_credentials():
    """Test 5: Login with invalid credentials"""
    print_test("Login with Invalid Credentials")

    test_cases = [
        {'username': 'nonexistent', 'password': 'wrongpass'},
        {'username': 'admin', 'password': 'wrongpassword'},
    ]

    all_passed = True
    for credentials in test_cases:
        try:
            response = requests.post(
                f"{API_BASE}/auth/login",
                json=credentials,
                timeout=10
            )

            if response.status_code == 401:
                record_test(
                    f"login_invalid_{credentials['username']}",
                    True,
                    f"Correctly rejected invalid credentials for {credentials['username']}"
                )
            else:
                record_test(
                    f"login_invalid_{credentials['username']}",
                    False,
                    f"Should return 401 for invalid credentials, got {response.status_code}"
                )
                all_passed = False

        except Exception as e:
            record_test(
                f"login_invalid_{credentials['username']}",
                False,
                f"Invalid login test failed: {str(e)}"
            )
            all_passed = False

    return all_passed

def test_protected_endpoint_with_valid_token(token: str) -> bool:
    """Test 6: Access protected endpoint with valid token"""
    print_test("Protected Endpoint - Valid Token")
    try:
        headers = {
            "Authorization": f"Bearer {token}"
        }

        response = requests.get(
            f"{API_BASE}/auth/me",
            headers=headers,
            timeout=10
        )

        if response.status_code == 200:
            data = response.json()
            user = data.get('user')
            if user and user.get('username'):
                record_test(
                    "protected_endpoint_valid_token",
                    True,
                    f"Successfully accessed protected endpoint: {user.get('username')}",
                    {'user': user}
                )
                return True
            else:
                record_test(
                    "protected_endpoint_valid_token",
                    False,
                    f"Response missing user data: {data}"
                )
                return False
        else:
            record_test(
                "protected_endpoint_valid_token",
                False,
                f"Failed to access protected endpoint: {response.status_code}"
            )
            return False

    except Exception as e:
        record_test(
            "protected_endpoint_valid_token",
            False,
            f"Protected endpoint test failed: {str(e)}"
        )
        return False

def test_protected_endpoint_without_token() -> bool:
    """Test 7: Access protected endpoint without token"""
    print_test("Protected Endpoint - No Token")
    try:
        response = requests.get(
            f"{API_BASE}/auth/me",
            timeout=10
        )

        if response.status_code == 401:
            record_test(
                "protected_endpoint_no_token",
                True,
                "Correctly rejected request without token (401)"
            )
            return True
        else:
            record_test(
                "protected_endpoint_no_token",
                False,
                f"Should return 401 without token, got {response.status_code}"
            )
            return False

    except Exception as e:
        record_test(
            "protected_endpoint_no_token",
            False,
            f"No token test failed: {str(e)}"
        )
        return False

def test_protected_endpoint_with_invalid_token() -> bool:
    """Test 8: Access protected endpoint with invalid token"""
    print_test("Protected Endpoint - Invalid Token")

    invalid_tokens = [
        "invalid_token",
        "Bearer invalid_token",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid",
        "",
        "a" * 100
    ]

    all_passed = True
    for idx, token in enumerate(invalid_tokens):
        try:
            headers = {
                "Authorization": f"Bearer {token}"
            }

            response = requests.get(
                f"{API_BASE}/auth/me",
                headers=headers,
                timeout=10
            )

            if response.status_code == 401:
                record_test(
                    f"protected_endpoint_invalid_token_{idx}",
                    True,
                    f"Correctly rejected invalid token #{idx+1}"
                )
            else:
                record_test(
                    f"protected_endpoint_invalid_token_{idx}",
                    False,
                    f"Should return 401 for invalid token, got {response.status_code}"
                )
                all_passed = False

        except Exception as e:
            record_test(
                f"protected_endpoint_invalid_token_{idx}",
                False,
                f"Invalid token test failed: {str(e)}"
            )
            all_passed = False

    return all_passed

def test_documents_endpoint_with_auth(token: str) -> bool:
    """Test 9: Access documents endpoint with authentication"""
    print_test("Documents Endpoint - With Auth")
    try:
        headers = {
            "Authorization": f"Bearer {token}"
        }

        response = requests.get(
            f"{API_BASE}/documents",
            headers=headers,
            timeout=10
        )

        if response.status_code == 200:
            data = response.json()
            record_test(
                "documents_with_auth",
                True,
                f"Successfully accessed documents endpoint: {len(data) if isinstance(data, list) else 'object'} items",
                {'document_count': len(data) if isinstance(data, list) else 0}
            )
            return True
        else:
            record_test(
                "documents_with_auth",
                False,
                f"Failed to access documents: {response.status_code}"
            )
            return False

    except Exception as e:
        record_test(
            "documents_with_auth",
            False,
            f"Documents endpoint test failed: {str(e)}"
        )
        return False

def test_documents_endpoint_without_auth() -> bool:
    """Test 10: Access documents endpoint without authentication"""
    print_test("Documents Endpoint - Without Auth")
    try:
        response = requests.get(
            f"{API_BASE}/documents",
            timeout=10
        )

        if response.status_code == 401:
            data = response.json()
            if 'requiresAuth' in data or 'Authentication required' in data.get('error', ''):
                record_test(
                    "documents_without_auth",
                    True,
                    "Correctly rejected unauthenticated request (401)"
                )
                return True
            else:
                record_test(
                    "documents_without_auth",
                    False,
                    f"401 response missing proper auth error: {data}"
                )
                return False
        else:
            record_test(
                "documents_without_auth",
                False,
                f"Should return 401 without auth, got {response.status_code}"
            )
            return False

    except Exception as e:
        record_test(
            "documents_without_auth",
            False,
            f"Documents no-auth test failed: {str(e)}"
        )
        return False

def test_logout(token: str) -> bool:
    """Test 11: User logout"""
    print_test("User Logout")
    try:
        headers = {
            "Authorization": f"Bearer {token}"
        }

        response = requests.post(
            f"{API_BASE}/auth/logout",
            headers=headers,
            timeout=10
        )

        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                record_test(
                    "logout",
                    True,
                    "Successfully logged out"
                )
                return True
            else:
                record_test(
                    "logout",
                    False,
                    f"Logout response missing success flag: {data}"
                )
                return False
        else:
            record_test(
                "logout",
                False,
                f"Logout failed with status {response.status_code}"
            )
            return False

    except Exception as e:
        record_test("logout", False, f"Logout test failed: {str(e)}")
        return False

def test_token_after_logout(token: str) -> bool:
    """Test 12: Token should be invalid after logout"""
    print_test("Token Validity After Logout")
    try:
        headers = {
            "Authorization": f"Bearer {token}"
        }

        response = requests.get(
            f"{API_BASE}/auth/me",
            headers=headers,
            timeout=10
        )

        if response.status_code == 401:
            record_test(
                "token_after_logout",
                True,
                "Token correctly invalidated after logout"
            )
            return True
        else:
            record_test(
                "token_after_logout",
                False,
                f"Token should be invalid after logout, got {response.status_code}"
            )
            return False

    except Exception as e:
        record_test(
            "token_after_logout",
            False,
            f"Token after logout test failed: {str(e)}"
        )
        return False

def test_duplicate_registration():
    """Test 13: Duplicate username/email registration"""
    print_test("Duplicate Registration Prevention")

    # First registration
    username = f"duptest_{int(time.time())}"
    email = f"duptest_{int(time.time())}@test.com"
    password = "testpass123"

    success1, _ = test_register_user(username, email, password)
    if not success1:
        print_fail("Initial registration failed, cannot test duplicates")
        return False

    time.sleep(0.5)

    # Try duplicate username
    try:
        response = requests.post(
            f"{API_BASE}/auth/register",
            json={
                'username': username,
                'email': f"different_{int(time.time())}@test.com",
                'password': password
            },
            timeout=10
        )

        if response.status_code == 400:
            error = response.json().get('error', '')
            if 'username' in error.lower() or 'exists' in error.lower():
                record_test(
                    "duplicate_username",
                    True,
                    "Correctly rejected duplicate username"
                )
            else:
                record_test(
                    "duplicate_username",
                    False,
                    f"Wrong error for duplicate username: {error}"
                )
                return False
        else:
            record_test(
                "duplicate_username",
                False,
                f"Should reject duplicate username with 400, got {response.status_code}"
            )
            return False
    except Exception as e:
        record_test("duplicate_username", False, f"Duplicate username test failed: {str(e)}")
        return False

    # Try duplicate email
    try:
        response = requests.post(
            f"{API_BASE}/auth/register",
            json={
                'username': f"different_{int(time.time())}",
                'email': email,
                'password': password
            },
            timeout=10
        )

        if response.status_code == 400:
            error = response.json().get('error', '')
            if 'email' in error.lower() or 'exists' in error.lower():
                record_test(
                    "duplicate_email",
                    True,
                    "Correctly rejected duplicate email"
                )
                return True
            else:
                record_test(
                    "duplicate_email",
                    False,
                    f"Wrong error for duplicate email: {error}"
                )
                return False
        else:
            record_test(
                "duplicate_email",
                False,
                f"Should reject duplicate email with 400, got {response.status_code}"
            )
            return False
    except Exception as e:
        record_test("duplicate_email", False, f"Duplicate email test failed: {str(e)}")
        return False

def test_malformed_auth_header():
    """Test 14: Malformed Authorization headers"""
    print_test("Malformed Authorization Headers")

    malformed_headers = [
        {"Authorization": "token123"},  # Missing "Bearer "
        {"Authorization": "bearer token123"},  # Lowercase "bearer"
        {"Authorization": ""},  # Empty
        {"Authorization": "Bearer"},  # Missing token
        {},  # No header
    ]

    all_passed = True
    for idx, headers in enumerate(malformed_headers):
        try:
            response = requests.get(
                f"{API_BASE}/auth/me",
                headers=headers,
                timeout=10
            )

            if response.status_code == 401:
                record_test(
                    f"malformed_auth_header_{idx}",
                    True,
                    f"Correctly rejected malformed header #{idx+1}"
                )
            else:
                record_test(
                    f"malformed_auth_header_{idx}",
                    False,
                    f"Should return 401 for malformed header, got {response.status_code}"
                )
                all_passed = False

        except Exception as e:
            record_test(
                f"malformed_auth_header_{idx}",
                False,
                f"Malformed header test failed: {str(e)}"
            )
            all_passed = False

    return all_passed

def generate_test_report():
    """Generate comprehensive test report"""
    print_header("TEST RESULTS SUMMARY")

    print(f"\n{Colors.BOLD}Overall Statistics:{Colors.END}")
    print(f"  Total Tests: {total_tests}")
    print(f"  {Colors.GREEN}Passed: {passed_tests}{Colors.END}")
    print(f"  {Colors.RED}Failed: {failed_tests}{Colors.END}")

    if total_tests > 0:
        pass_rate = (passed_tests / total_tests) * 100
        print(f"  Pass Rate: {pass_rate:.1f}%")

    # Group results by category
    print(f"\n{Colors.BOLD}Test Results by Category:{Colors.END}")

    categories = {
        'Health & Setup': [],
        'Registration': [],
        'Login': [],
        'Protected Endpoints': [],
        'Logout': [],
        'Validation & Security': []
    }

    for result in test_results:
        test_name = result['test']
        if 'health' in test_name:
            categories['Health & Setup'].append(result)
        elif 'register' in test_name or 'duplicate' in test_name:
            categories['Registration'].append(result)
        elif 'login' in test_name:
            categories['Login'].append(result)
        elif 'protected' in test_name or 'documents' in test_name or 'token' in test_name:
            categories['Protected Endpoints'].append(result)
        elif 'logout' in test_name:
            categories['Logout'].append(result)
        else:
            categories['Validation & Security'].append(result)

    for category, results in categories.items():
        if results:
            passed = sum(1 for r in results if r['passed'])
            total = len(results)
            print(f"\n  {Colors.BOLD}{category}:{Colors.END} {passed}/{total} passed")
            for result in results:
                status = f"{Colors.GREEN}✓{Colors.END}" if result['passed'] else f"{Colors.RED}✗{Colors.END}"
                print(f"    {status} {result['message']}")

    # Issues and recommendations
    if failed_tests > 0:
        print(f"\n{Colors.BOLD}{Colors.RED}ISSUES FOUND:{Colors.END}")
        for result in test_results:
            if not result['passed']:
                print(f"  • {result['test']}: {result['message']}")

        print(f"\n{Colors.BOLD}{Colors.YELLOW}RECOMMENDATIONS:{Colors.END}")

        # Analyze failures and provide recommendations
        failed_categories = []
        for result in test_results:
            if not result['passed']:
                if 'token' in result['test'] or 'auth' in result['test']:
                    failed_categories.append('authentication')
                if '401' in result['message'] and result['passed'] is False:
                    failed_categories.append('authorization')
                if 'validation' in result['test']:
                    failed_categories.append('validation')

        if 'authentication' in failed_categories:
            print("  1. Review token generation and validation logic")
            print("  2. Ensure session management is working correctly")
        if 'authorization' in failed_categories:
            print("  3. Check authorization middleware implementation")
            print("  4. Verify 401 responses are returned for unauthorized requests")
        if 'validation' in failed_categories:
            print("  5. Review input validation rules")
            print("  6. Ensure error messages are clear and consistent")
    else:
        print(f"\n{Colors.BOLD}{Colors.GREEN}All tests passed! ✓{Colors.END}")

    # Save report to file
    report_file = f"/home/ubuntu/contract1/omega-workflow/auth_test_report_{int(time.time())}.json"
    with open(report_file, 'w') as f:
        json.dump({
            'summary': {
                'total_tests': total_tests,
                'passed': passed_tests,
                'failed': failed_tests,
                'pass_rate': (passed_tests / total_tests * 100) if total_tests > 0 else 0,
                'timestamp': datetime.now().isoformat()
            },
            'results': test_results
        }, f, indent=2)

    print(f"\n{Colors.BOLD}Detailed report saved to:{Colors.END} {report_file}")

    return failed_tests == 0

def main():
    """Main test execution function"""
    print_header("OMEGA WORKFLOW - AUTHENTICATION FLOW TEST SUITE")
    print(f"Testing API at: {API_BASE}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    # Test 1: Health check
    if not test_health_check():
        print_fail("Server health check failed. Aborting tests.")
        sys.exit(1)

    # Test 2-3: Registration and validation
    timestamp = int(time.time())
    test_username = f"testuser_{timestamp}"
    test_email = f"testuser_{timestamp}@test.com"
    test_password = "TestPass123!"

    test_register_validation()
    success, register_data = test_register_user(test_username, test_email, test_password)

    if not success or not register_data:
        print_fail("User registration failed. Some tests will be skipped.")
        register_token = None
    else:
        register_token = register_data.get('token')

    # Test 4-5: Login
    test_login_invalid_credentials()
    success, login_token = test_login(test_username, test_password)

    if not success or not login_token:
        print_fail("Login failed. Some tests will be skipped.")
        # Try using admin credentials as fallback
        print_info("Attempting login with default admin credentials...")
        success, login_token = test_login("admin", "admin123")
        if not success:
            print_fail("Admin login also failed. Aborting remaining tests.")
            generate_test_report()
            sys.exit(1)

    # Test 6-10: Protected endpoints
    test_protected_endpoint_with_valid_token(login_token)
    test_protected_endpoint_without_token()
    test_protected_endpoint_with_invalid_token()
    test_documents_endpoint_with_auth(login_token)
    test_documents_endpoint_without_auth()

    # Test 11-12: Logout
    test_logout(login_token)
    test_token_after_logout(login_token)

    # Test 13: Duplicate registration
    test_duplicate_registration()

    # Test 14: Malformed headers
    test_malformed_auth_header()

    # Generate report
    all_passed = generate_test_report()

    print(f"\n{Colors.BOLD}Test execution completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.END}\n")

    sys.exit(0 if all_passed else 1)

if __name__ == "__main__":
    main()
