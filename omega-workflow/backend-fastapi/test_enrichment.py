#!/usr/bin/env python3
"""Test if the _enrich_extraction_bbox function works correctly"""
import sys
sys.path.insert(0, '/app')

# Test the enrichment function
def _enrich_extraction_bbox(extraction):
    """
    Enrich extraction with bbox from spans if bbox is null
    """
    # If bbox already exists, return as-is
    if extraction.get('bbox') is not None:
        return extraction

    # Try to extract bbox from spans
    spans = extraction.get('spans', [])
    if spans and len(spans) > 0:
        first_span = spans[0]
        bboxes = first_span.get('bboxes', [])
        if bboxes and len(bboxes) > 0:
            first_bbox_obj = bboxes[0]
            bounds = first_bbox_obj.get('bounds', [])
            if bounds and len(bounds) > 0:
                bound = bounds[0]
                # Convert to [left, bottom, right, top] format for PDF coordinates
                extraction['bbox'] = [
                    bound.get('left'),
                    bound.get('bottom'),
                    bound.get('right'),
                    bound.get('top')
                ]

    return extraction

# Test with sample data
test_extraction = {
    'text': 'May 23, 2025',
    'page': None,
    'spans': [
        {
            'bboxes': [
                {
                    'bounds': [
                        {
                            'left': 1259,
                            'bottom': 2120,
                            'right': 1542,
                            'top': 2075
                        }
                    ]
                }
            ]
        }
    ]
}

print("BEFORE enrichment:")
print(f"  bbox: {test_extraction.get('bbox')}")
print(f"  text: {test_extraction.get('text')}")

enriched = _enrich_extraction_bbox(test_extraction)

print("\nAFTER enrichment:")
print(f"  bbox: {enriched.get('bbox')}")
print(f"  text: {enriched.get('text')}")

if enriched.get('bbox') == [1259, 2120, 1542, 2075]:
    print("\n✅ SUCCESS: Function correctly extracts bbox from spans!")
else:
    print(f"\n❌ FAIL: Expected [1259, 2120, 1542, 2075], got {enriched.get('bbox')}")
