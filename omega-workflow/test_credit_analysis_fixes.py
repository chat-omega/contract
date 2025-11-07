#!/usr/bin/env python3
"""
Test script for Credit Analysis Fixes
Tests two critical fixes:
1. CSS overflow fix for scrolling in credit analysis report page
2. Credit Agreement workflow template visibility
"""

import requests
import json
import sys
from typing import Dict, List, Tuple

# Configuration
API_BASE_URL = "http://localhost:5001"
FRONTEND_BASE_URL = "http://localhost:3000"

class TestResults:
    def __init__(self):
        self.tests_passed = 0
        self.tests_failed = 0
        self.tests_total = 0
        self.results = []

    def add_result(self, test_name: str, passed: bool, details: str = ""):
        self.tests_total += 1
        if passed:
            self.tests_passed += 1
            status = "✅ PASS"
        else:
            self.tests_failed += 1
            status = "❌ FAIL"

        result = f"{status} - {test_name}"
        if details:
            result += f"\n    Details: {details}"

        self.results.append(result)
        print(result)

    def print_summary(self):
        print("\n" + "="*80)
        print("TEST SUMMARY")
        print("="*80)
        print(f"Total Tests: {self.tests_total}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_failed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_total*100):.1f}%")
        print("="*80)

        if self.tests_failed == 0:
            print("\n🎉 ALL TESTS PASSED! Both fixes are working correctly.")
            print("✅ Ready for production")
            return True
        else:
            print(f"\n⚠️  {self.tests_failed} test(s) failed. Please review the results above.")
            return False


def test_css_overflow_fix(results: TestResults):
    """Test 3: Verify CSS overflow fix in credit-analysis.css"""
    print("\n" + "="*80)
    print("TEST 3: CSS OVERFLOW FIX VERIFICATION")
    print("="*80)

    try:
        css_file_path = "/home/ubuntu/contract1/omega-workflow/frontend-vanilla-old/css/credit-analysis.css"

        with open(css_file_path, 'r') as f:
            css_content = f.read()

        # Check for overflow: auto in credit-report-container
        if '.credit-report-container' in css_content:
            # Find the credit-report-container block
            container_start = css_content.find('.credit-report-container {')
            container_end = css_content.find('}', container_start)
            container_block = css_content[container_start:container_end]

            # Check for overflow: auto (NOT overflow: hidden)
            has_overflow_auto = 'overflow: auto' in container_block
            has_overflow_hidden = 'overflow: hidden' in container_block
            has_height_100 = 'height: 100%' in container_block

            if has_overflow_auto and not has_overflow_hidden:
                results.add_result(
                    "CSS: .credit-report-container has 'overflow: auto'",
                    True,
                    "Correct CSS property found"
                )
            else:
                results.add_result(
                    "CSS: .credit-report-container overflow property",
                    False,
                    f"overflow:auto={has_overflow_auto}, overflow:hidden={has_overflow_hidden}"
                )

            if has_height_100:
                results.add_result(
                    "CSS: .credit-report-container has 'height: 100%'",
                    True,
                    "Correct height property found"
                )
            else:
                results.add_result(
                    "CSS: .credit-report-container height property",
                    False,
                    "height: 100% not found"
                )
        else:
            results.add_result(
                "CSS: .credit-report-container exists",
                False,
                "CSS class not found in file"
            )

        # Check for overflow-y: auto in credit-report-content
        if '.credit-report-content' in css_content:
            content_start = css_content.find('.credit-report-content {')
            content_end = css_content.find('}', content_start)
            content_block = css_content[content_start:content_end]

            has_overflow_y_auto = 'overflow-y: auto' in content_block

            if has_overflow_y_auto:
                results.add_result(
                    "CSS: .credit-report-content has 'overflow-y: auto'",
                    True,
                    "Left panel can scroll vertically"
                )
            else:
                results.add_result(
                    "CSS: .credit-report-content overflow-y property",
                    False,
                    "overflow-y: auto not found"
                )

        # Check for overflow-y: auto in credit-report-widgets
        if '.credit-report-widgets' in css_content:
            widgets_start = css_content.find('.credit-report-widgets {')
            widgets_end = css_content.find('}', widgets_start)
            widgets_block = css_content[widgets_start:widgets_end]

            has_overflow_y_auto = 'overflow-y: auto' in widgets_block

            if has_overflow_y_auto:
                results.add_result(
                    "CSS: .credit-report-widgets has 'overflow-y: auto'",
                    True,
                    "Right panel can scroll vertically"
                )
            else:
                results.add_result(
                    "CSS: .credit-report-widgets overflow-y property",
                    False,
                    "overflow-y: auto not found"
                )

    except Exception as e:
        results.add_result(
            "CSS File Reading",
            False,
            f"Error reading CSS file: {str(e)}"
        )


def test_credit_agreement_template_api(results: TestResults):
    """Test 2: Verify Credit Agreement template exists in API"""
    print("\n" + "="*80)
    print("TEST 2: CREDIT AGREEMENT TEMPLATE API TEST")
    print("="*80)

    try:
        response = requests.get(f"{API_BASE_URL}/api/analyze/workflows/templates", timeout=10)

        if response.status_code == 200:
            results.add_result(
                "API: GET /api/analyze/workflows/templates responds",
                True,
                f"Status: {response.status_code}"
            )

            templates = response.json()

            # Find credit-agreement template
            credit_template = None
            for template in templates:
                if template.get('id') == 'credit-agreement':
                    credit_template = template
                    break

            if credit_template:
                results.add_result(
                    "API: Credit Agreement template exists",
                    True,
                    f"Template ID: {credit_template.get('id')}"
                )

                # Check template name
                expected_name = "Credit Agreement / Credit Analysis"
                actual_name = credit_template.get('name', '')
                if actual_name == expected_name:
                    results.add_result(
                        "API: Template name is correct",
                        True,
                        f"Name: '{actual_name}'"
                    )
                else:
                    results.add_result(
                        "API: Template name",
                        False,
                        f"Expected '{expected_name}', got '{actual_name}'"
                    )

                # Check field count
                fields = credit_template.get('fields', [])
                field_count = len(fields)
                if field_count == 60:
                    results.add_result(
                        "API: Template has 60 fields",
                        True,
                        f"Field count: {field_count}"
                    )
                else:
                    results.add_result(
                        "API: Template field count",
                        False,
                        f"Expected 60 fields, got {field_count}"
                    )

                # Check document types
                doc_types = credit_template.get('documentTypes', [])
                expected_doc_types = ["Debt Related Agt", "Debt Supplemental Agt"]
                if set(doc_types) == set(expected_doc_types):
                    results.add_result(
                        "API: Template has correct document types",
                        True,
                        f"Document types: {doc_types}"
                    )
                else:
                    results.add_result(
                        "API: Template document types",
                        False,
                        f"Expected {expected_doc_types}, got {doc_types}"
                    )

                # Check category
                category = credit_template.get('category', '')
                if category == "Credit/Financing":
                    results.add_result(
                        "API: Template category is correct",
                        True,
                        f"Category: '{category}'"
                    )
                else:
                    results.add_result(
                        "API: Template category",
                        False,
                        f"Expected 'Credit/Financing', got '{category}'"
                    )

                # Print template structure for verification
                print(f"\n    Template Structure:")
                print(f"    - ID: {credit_template.get('id')}")
                print(f"    - Name: {credit_template.get('name')}")
                print(f"    - Category: {credit_template.get('category')}")
                print(f"    - Description: {credit_template.get('description', '')[:80]}...")
                print(f"    - Fields: {len(fields)} field IDs")
                print(f"    - Document Types: {doc_types}")

            else:
                results.add_result(
                    "API: Credit Agreement template exists",
                    False,
                    "Template with id='credit-agreement' not found in API response"
                )
        else:
            results.add_result(
                "API: GET /api/analyze/workflows/templates",
                False,
                f"Status: {response.status_code}"
            )

    except Exception as e:
        results.add_result(
            "API: Connection to backend",
            False,
            f"Error: {str(e)}"
        )


def test_frontend_html_structure(results: TestResults):
    """Test 1: Verify frontend HTML structure for credit analysis"""
    print("\n" + "="*80)
    print("TEST 1: FRONTEND HTML STRUCTURE TEST")
    print("="*80)

    try:
        response = requests.get(f"{FRONTEND_BASE_URL}", timeout=10)

        if response.status_code == 200:
            results.add_result(
                "Frontend: Application is accessible",
                True,
                f"Status: {response.status_code}"
            )

            html_content = response.text

            # Check for credit-report-container
            if 'credit-report-container' in html_content:
                results.add_result(
                    "Frontend: credit-report-container div exists",
                    True,
                    "HTML structure found"
                )
            else:
                results.add_result(
                    "Frontend: credit-report-container div",
                    False,
                    "HTML element not found"
                )

            # Check for credit-report-content (left panel)
            if 'credit-report-content' in html_content:
                results.add_result(
                    "Frontend: credit-report-content div exists",
                    True,
                    "Left panel HTML structure found"
                )
            else:
                results.add_result(
                    "Frontend: credit-report-content div",
                    False,
                    "Left panel HTML element not found"
                )

            # Check for credit-report-widgets (right panel)
            if 'credit-report-widgets' in html_content:
                results.add_result(
                    "Frontend: credit-report-widgets div exists",
                    True,
                    "Right panel HTML structure found"
                )
            else:
                results.add_result(
                    "Frontend: credit-report-widgets div",
                    False,
                    "Right panel HTML element not found"
                )

            # Check for credit-analysis.css link
            if 'credit-analysis.css' in html_content:
                results.add_result(
                    "Frontend: credit-analysis.css is linked",
                    True,
                    "CSS file properly loaded"
                )
            else:
                results.add_result(
                    "Frontend: credit-analysis.css link",
                    False,
                    "CSS file not found in HTML"
                )

        else:
            results.add_result(
                "Frontend: Application accessibility",
                False,
                f"Status: {response.status_code}"
            )

    except Exception as e:
        results.add_result(
            "Frontend: Connection",
            False,
            f"Error: {str(e)}"
        )


def test_frontend_css_loading(results: TestResults):
    """Test CSS file accessibility"""
    print("\n" + "="*80)
    print("TEST 4: CSS FILE ACCESSIBILITY")
    print("="*80)

    try:
        response = requests.get(f"{FRONTEND_BASE_URL}/css/credit-analysis.css", timeout=10)

        if response.status_code == 200:
            results.add_result(
                "Frontend: credit-analysis.css is accessible",
                True,
                f"Status: {response.status_code}, Size: {len(response.text)} bytes"
            )

            css_content = response.text

            # Verify key CSS rules are present
            if '.credit-report-container' in css_content and 'overflow: auto' in css_content:
                results.add_result(
                    "Frontend: CSS contains scrolling fix",
                    True,
                    "overflow: auto property found in CSS"
                )
            else:
                results.add_result(
                    "Frontend: CSS scrolling fix",
                    False,
                    "Scrolling properties not found in loaded CSS"
                )
        else:
            results.add_result(
                "Frontend: credit-analysis.css accessibility",
                False,
                f"Status: {response.status_code}"
            )

    except Exception as e:
        results.add_result(
            "Frontend: CSS file loading",
            False,
            f"Error: {str(e)}"
        )


def main():
    print("\n" + "="*80)
    print("CREDIT ANALYSIS FIXES - COMPREHENSIVE TEST SUITE")
    print("="*80)
    print("Testing two critical fixes:")
    print("1. CSS overflow issue for scrolling on credit analysis report page")
    print("2. Credit Agreement workflow template visibility")
    print("="*80)

    results = TestResults()

    # Run all tests
    test_frontend_html_structure(results)
    test_credit_agreement_template_api(results)
    test_css_overflow_fix(results)
    test_frontend_css_loading(results)

    # Print summary
    success = results.print_summary()

    # Detailed recommendations
    print("\n" + "="*80)
    print("TESTING RECOMMENDATIONS")
    print("="*80)
    print("""
Manual Testing Still Required:
------------------------------
1. SCROLLING TEST (Browser Required):
   - Open http://localhost:3000 in a browser
   - Navigate to Credit Analysis page
   - Click a sample question or type a question
   - Verify LEFT panel scrolls to show all content:
     * Executive Summary
     * Financial Overview
     * Industry Position
     * Risk Assessment
     * Credit Spread Analysis
     * Outlook
     * Recommendation
   - Verify RIGHT panel scrolls to show all 3 widgets:
     * Company Info card
     * Probability of Default chart
     * Credit Spread chart

2. WORKFLOW UI TEST (If accessible):
   - Navigate to http://localhost:3000/workflow-library.html
   - Look for "Credit Agreement / Credit Analysis" template
   - Verify it appears in the template list
   - Try to create a workflow from this template

3. INTEGRATION TEST:
   - Generate a credit report
   - Scroll through entire content
   - Click "Back to Chat"
   - Generate another report
   - Verify scrolling still works

4. RESPONSIVE TEST:
   - Test on different viewport sizes:
     * Desktop (1920x1080)
     * Tablet (768x1024)
     * Mobile (375x667)
   - Verify scrolling works on all sizes
    """)

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
