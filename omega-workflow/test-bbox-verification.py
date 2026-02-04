#!/usr/bin/env python3
"""
Bbox Coordinate System Verification Script

This script analyzes actual Zuva API bbox data to confirm the coordinate system.
It checks extraction results from the database to identify patterns.
"""

import sqlite3
import json
import sys

def analyze_bbox_coordinates():
    """Analyze bbox coordinates from actual extraction data"""

    print("=" * 80)
    print("PDF BBOX COORDINATE SYSTEM VERIFICATION")
    print("=" * 80)
    print()

    # Connect to database
    conn = sqlite3.connect('/app/database/omega.db')
    cursor = conn.cursor()

    # Get extraction with results
    cursor.execute('''
        SELECT id, document_id, status, results
        FROM extractions
        WHERE status = 'complete' AND results IS NOT NULL
        LIMIT 1
    ''')

    row = cursor.fetchone()

    if not row:
        print("❌ No completed extractions found in database")
        return

    extraction_id, document_id, status, results_json = row

    print(f"Extraction ID: {extraction_id}")
    print(f"Document ID: {document_id}")
    print(f"Status: {status}")
    print()

    results = json.loads(results_json)

    print(f"Total fields: {len(results)}")
    print()

    # Analyze bbox patterns
    bbox_samples = []

    for field_id, field_data in results.items():
        if 'extractions' in field_data:
            for extraction in field_data['extractions']:
                if 'bbox' in extraction and extraction['bbox']:
                    bbox = extraction['bbox']
                    if isinstance(bbox, list) and len(bbox) == 4:
                        bbox_samples.append({
                            'field_id': field_id,
                            'text': extraction.get('text', '')[:50],
                            'page': extraction.get('page'),
                            'bbox': bbox
                        })

                        if len(bbox_samples) >= 10:  # Get first 10 samples
                            break
        if len(bbox_samples) >= 10:
            break

    if not bbox_samples:
        print("❌ No bbox data found in extractions")
        return

    print(f"Found {len(bbox_samples)} samples with bbox data")
    print()
    print("=" * 80)
    print("BBOX COORDINATE ANALYSIS")
    print("=" * 80)
    print()

    # Backend code says: [left, bottom, right, top] for PDF coordinates
    # This means BOTTOM-LEFT origin (PDF standard)
    # In bottom-left origin: bottom < top (bottom is closer to origin)

    print("Backend documentation: bbox = [left, bottom, right, top]")
    print("Expected for BOTTOM-LEFT origin: bottom < top (Y increases upward)")
    print("Expected for TOP-LEFT origin: bottom > top (Y increases downward)")
    print()

    bottom_left_count = 0
    top_left_count = 0

    for i, sample in enumerate(bbox_samples[:5], 1):  # Show first 5 in detail
        left, val2, right, val4 = sample['bbox']

        print(f"Sample {i}:")
        print(f"  Text: \"{sample['text']}...\"")
        print(f"  Page: {sample['page']}")
        print(f"  Bbox: [{left:.2f}, {val2:.2f}, {right:.2f}, {val4:.2f}]")

        # Check if val2 < val4 (bottom < top) indicating bottom-left origin
        if val2 < val4:
            print(f"  Val2 ({val2:.2f}) < Val4 ({val4:.2f}) → BOTTOM-LEFT origin ✓")
            bottom_left_count += 1
        else:
            print(f"  Val2 ({val2:.2f}) > Val4 ({val4:.2f}) → TOP-LEFT origin")
            top_left_count += 1

        print()

    # Summary for all samples
    for sample in bbox_samples:
        left, val2, right, val4 = sample['bbox']
        if val2 < val4:
            bottom_left_count += 1
        else:
            top_left_count += 1

    print("=" * 80)
    print("ANALYSIS SUMMARY")
    print("=" * 80)
    print()
    print(f"Total samples analyzed: {len(bbox_samples)}")
    print(f"  Bottom-left origin patterns: {bottom_left_count} ({bottom_left_count/len(bbox_samples)*100:.1f}%)")
    print(f"  Top-left origin patterns: {top_left_count} ({top_left_count/len(bbox_samples)*100:.1f}%)")
    print()

    if bottom_left_count > top_left_count:
        print("✅ CONCLUSION: Zuva uses BOTTOM-LEFT origin (PDF standard)")
        print("   Format: [left, bottom, right, top] where bottom < top")
        print("   The frontend MUST flip Y-axis: screenY = pageHeight - pdfY")
    elif top_left_count > bottom_left_count:
        print("✅ CONCLUSION: Zuva uses TOP-LEFT origin (screen coordinates)")
        print("   Format: [left, top, right, bottom] where top < bottom")
        print("   The frontend does NOT need Y-axis flipping")
    else:
        print("⚠️  INCONCLUSIVE: Mixed patterns detected")

    print()
    print("=" * 80)
    print("REQUIRED FRONTEND FIX")
    print("=" * 80)
    print()

    if bottom_left_count > top_left_count:
        print("The current frontend implementation is WRONG!")
        print()
        print("Current code (INCORRECT):")
        print("  const [left, bottomY, right, topY] = bbox;")
        print("  const y = topY * coordScaleY;  // WRONG - no Y-axis flip")
        print()
        print("Correct fix:")
        print("  const [left, bottom, right, top] = bbox;")
        print("  const screenY = viewport.height - (top * coordScaleY);  // Flip Y-axis")
        print("  const height = (top - bottom) * coordScaleY;")
    else:
        print("The current frontend implementation might be correct.")
        print("However, verify with visual testing using the diagnostic tool.")

    print()

    conn.close()

if __name__ == "__main__":
    try:
        analyze_bbox_coordinates()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
