#!/usr/bin/env python3
"""
Standalone test to verify the _enrich_extraction_bbox function works correctly
"""
from typing import Dict, Any

def _enrich_extraction_bbox(extraction: Dict[str, Any]) -> Dict[str, Any]:
    """
    Enrich extraction with bbox AND page from spans if missing
    This handles cached data that was stored before bbox extraction was added
    """
    # Try to extract bbox and page from spans
    spans = extraction.get('spans', [])
    if spans and len(spans) > 0:
        first_span = spans[0]
        bboxes = first_span.get('bboxes', [])
        if bboxes and len(bboxes) > 0:
            first_bbox_obj = bboxes[0]

            # Extract page number if missing (CRITICAL FIX!)
            if extraction.get('page') is None:
                page = first_bbox_obj.get('page')
                if page is not None:
                    extraction['page'] = page

            # Extract bbox if missing
            if extraction.get('bbox') is None:
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


# Test extraction from diagnostic (with spans but null bbox)
test_extraction = {
    'text': '(xi) if such Receivable cannot or may not be transferred',
    'page': 33,
    'bbox': None,
    'confidence': 0.652,
    'spans': [
        {
            'score': 0.652,
            'bounds': {
                'top': 1768,
                'left': 443,
                'bottom': 1814,
                'right': 2029
            },
            'bboxes': [
                {
                    'page': 33,
                    'bounds': [
                        {
                            'top': 1768,
                            'left': 443,
                            'bottom': 1814,
                            'right': 2029
                        }
                    ]
                }
            ]
        }
    ]
}

print('=' * 80)
print('TESTING ENRICHMENT FUNCTION')
print('=' * 80)
print()

print('BEFORE enrichment:')
print(f'  page: {test_extraction.get("page")}')
print(f'  bbox: {test_extraction.get("bbox")}')
print()

# Make a copy to avoid modifying original
import copy
test_copy = copy.deepcopy(test_extraction)

enriched = _enrich_extraction_bbox(test_copy)

print('AFTER enrichment:')
print(f'  page: {enriched.get("page")}')
print(f'  bbox: {enriched.get("bbox")}')
print()

if enriched.get('bbox'):
    print('✅ SUCCESS! Enrichment worked - bbox was populated.')
    print(f'   bbox = {enriched.get("bbox")}')
else:
    print('❌ FAILURE! Enrichment did not work - bbox is still None.')
    print()
    print('DEBUG INFO:')
    print(f'  spans exist: {len(test_extraction.get("spans", []))}')
    if test_extraction.get('spans'):
        first_span = test_extraction['spans'][0]
        print(f'  first_span has bboxes: {"bboxes" in first_span}')
        if 'bboxes' in first_span:
            print(f'  bboxes count: {len(first_span["bboxes"])}')
            if first_span['bboxes']:
                first_bbox = first_span['bboxes'][0]
                print(f'  first bbox: {first_bbox}')
                print(f'  first bbox has bounds: {"bounds" in first_bbox}')
                if 'bounds' in first_bbox:
                    bounds = first_bbox['bounds']
                    print(f'  bounds type: {type(bounds)}')
                    print(f'  bounds value: {bounds}')
