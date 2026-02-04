/**
 * PDF Coordinate Transformation Utilities
 *
 * CRITICAL FIX: Zuva API returns coordinates in SCREEN coordinate space
 * where Y=0 is at TOP and Y increases DOWNWARD. The bbox format is:
 *   [left, bottom, right, top] where bottom > top numerically
 *   because "bottom" is further down the page (higher Y value).
 *
 * Zuva coordinates are at approximately 3x PDF point scale (possibly 216 DPI).
 * We need to scale from Zuva coordinate space to viewport pixel space.
 */

import type { BBox, TransformedCoordinates, PDFPageProxy, PDFViewport } from '@/types';

// Zuva appears to use approximately 3x scale relative to PDF points (72 DPI)
// This means Zuva coordinates are at ~216 DPI (72 * 3 = 216)
const ZUVA_SCALE_FACTOR = 3.0;

/**
 * Transform Zuva bbox coordinates to canvas screen coordinates
 *
 * IMPORTANT: Zuva API returns coordinates in SCREEN coordinate space:
 *   - Y=0 is at TOP of page
 *   - Y increases DOWNWARD
 *   - bbox format: [left, bottom, right, top]
 *   - "bottom" has LARGER Y value than "top"
 *
 * This is OPPOSITE of traditional PDF coordinates where Y=0 is at BOTTOM.
 *
 * @param bbox - Bounding box from Zuva API: [left, bottom, right, top] in screen coords
 * @param page - PDF.js page object
 * @param viewport - PDF.js viewport object
 * @returns Screen coordinates for canvas rendering
 */
export function transformPDFCoordinates(
  bbox: BBox,
  page: PDFPageProxy,
  viewport: PDFViewport
): TransformedCoordinates {
  // Get PDF MediaBox dimensions (native PDF size in points at 72 DPI)
  // page.view format: [x1, y1, x2, y2]
  const pdfMediaBoxWidth = page.view[2] - page.view[0];
  const pdfMediaBoxHeight = page.view[3] - page.view[1];

  // Extract bbox coordinates
  // Bbox format from Zuva API: [left, bottom, right, top]
  // NOTE: In Zuva's SCREEN coordinate system, bottom > top numerically
  const [left, bottom, right, top] = bbox;

  // Detect coordinate space: if top > bottom, it's traditional PDF coords
  // If bottom > top, it's screen coords (what Zuva actually returns)
  const isScreenCoords = bottom > top;

  // Calculate scale from Zuva coordinate space to viewport pixels
  // Zuva coordinates ≈ PDF points * ZUVA_SCALE_FACTOR
  // So: zuva_width ≈ pdfMediaBoxWidth * ZUVA_SCALE_FACTOR
  const zuvaPageWidth = pdfMediaBoxWidth * ZUVA_SCALE_FACTOR;
  const zuvaPageHeight = pdfMediaBoxHeight * ZUVA_SCALE_FACTOR;

  // Scale from Zuva space to viewport space
  const scaleX = viewport.width / zuvaPageWidth;
  const scaleY = viewport.height / zuvaPageHeight;

  let x: number, y: number, width: number, height: number;

  if (isScreenCoords) {
    // Zuva screen coordinates: Y=0 at top, Y increases downward
    // No Y-flip needed, just scale directly
    x = left * scaleX;
    y = top * scaleY;  // 'top' is the smaller Y value (closer to page top)
    width = (right - left) * scaleX;
    height = (bottom - top) * scaleY;  // bottom > top, so this is positive
  } else {
    // Traditional PDF coordinates: Y=0 at bottom, Y increases upward
    // Need Y-flip for canvas (Y=0 at top)
    x = left * scaleX;
    y = viewport.height - (top * scaleY);
    width = (right - left) * scaleX;
    height = (top - bottom) * scaleY;
  }

  // Validate coordinates are reasonable
  const isValid = !isNaN(x) && !isNaN(y) && !isNaN(width) && !isNaN(height) &&
                  x >= 0 && y >= 0 && width > 0 && height > 0 &&
                  x + width <= viewport.width * 1.1 && y + height <= viewport.height * 1.1;

  if (!isValid) {
    console.warn('[pdfCoordinates] Invalid coordinates:', {
      input: { left, bottom, right, top },
      output: { x, y, width, height },
      isScreenCoords,
    });
  }

  return { x, y, width, height };
}

/**
 * Draw a highlight rectangle on a canvas
 *
 * @param ctx - Canvas 2D rendering context
 * @param coords - Transformed coordinates
 * @param color - Highlight color (default: semi-transparent yellow)
 * @param alpha - Opacity (0-1)
 */
export function drawHighlight(
  ctx: CanvasRenderingContext2D,
  coords: TransformedCoordinates,
  color: string = '#ffeb3b',
  alpha: number = 0.3
): void {
  ctx.save();

  // Set fill style with transparency
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;

  // Draw rectangle
  ctx.fillRect(coords.x, coords.y, coords.width, coords.height);

  // Optional: Draw border for better visibility
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 1;
  ctx.strokeRect(coords.x, coords.y, coords.width, coords.height);

  ctx.restore();
}

/**
 * Draw a clickable highlight with hover effect
 *
 * @param ctx - Canvas 2D rendering context
 * @param coords - Transformed coordinates
 * @param isHovered - Whether the highlight is currently hovered
 * @param isSelected - Whether the highlight is currently selected
 * @param pulseIntensity - Pulse animation intensity (0-1), where 1 is full brightness
 */
export function drawInteractiveHighlight(
  ctx: CanvasRenderingContext2D,
  coords: TransformedCoordinates,
  isHovered: boolean = false,
  isSelected: boolean = false,
  pulseIntensity: number = 0
): void {
  ctx.save();

  // Base highlight color
  let color = '#ffeb3b'; // Yellow
  let alpha = 0.3;

  if (isSelected) {
    color = '#2196f3'; // Blue for selected
    alpha = 0.4;

    // Add pulse effect: increase alpha based on pulse intensity
    // Pulses from 0.4 to 0.7 and back
    if (pulseIntensity > 0) {
      alpha = 0.4 + (pulseIntensity * 0.3);
    }
  } else if (isHovered) {
    alpha = 0.5; // Brighter on hover
  }

  // Fill
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.fillRect(coords.x, coords.y, coords.width, coords.height);

  // Border
  ctx.strokeStyle = color;
  let borderAlpha = isSelected ? 0.8 : 0.6;

  // Pulse the border too
  if (isSelected && pulseIntensity > 0) {
    borderAlpha = 0.8 + (pulseIntensity * 0.2); // 0.8 → 1.0
  }

  ctx.globalAlpha = borderAlpha;
  ctx.lineWidth = isSelected ? 2 : 1;
  ctx.strokeRect(coords.x, coords.y, coords.width, coords.height);

  ctx.restore();
}

/**
 * Check if a point is inside a rectangle
 * Used for click detection on highlights
 *
 * @param x - Mouse X coordinate
 * @param y - Mouse Y coordinate
 * @param rect - Rectangle coordinates
 * @returns True if point is inside rectangle
 */
export function isPointInRect(
  x: number,
  y: number,
  rect: TransformedCoordinates
): boolean {
  return (
    x >= rect.x &&
    x <= rect.x + rect.width &&
    y >= rect.y &&
    y <= rect.y + rect.height
  );
}

/**
 * Get the canvas coordinates from a mouse event
 * Accounts for canvas scaling and scroll position
 *
 * @param event - Mouse event
 * @param canvas - HTML canvas element
 * @returns Canvas coordinates
 */
export function getCanvasCoordinates(
  event: MouseEvent,
  canvas: HTMLCanvasElement
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

/**
 * Draw a search result highlight
 * Visually distinct from extraction highlights
 *
 * @param ctx - Canvas 2D rendering context
 * @param coords - Transformed coordinates
 * @param isCurrent - Whether this is the currently selected search match
 */
export function drawSearchHighlight(
  ctx: CanvasRenderingContext2D,
  coords: TransformedCoordinates,
  isCurrent: boolean = false
): void {
  ctx.save();

  // Color scheme: Orange for search results, Blue for current match
  const color = isCurrent ? '#2196f3' : '#ff9800'; // Blue vs Orange
  const fillAlpha = isCurrent ? 0.5 : 0.3;
  const borderAlpha = isCurrent ? 0.8 : 0.6;
  const borderWidth = isCurrent ? 2 : 1;

  // Draw fill
  ctx.fillStyle = color;
  ctx.globalAlpha = fillAlpha;
  ctx.fillRect(coords.x, coords.y, coords.width, coords.height);

  // Draw border
  ctx.strokeStyle = isCurrent ? '#1976d2' : '#f57c00'; // Darker shades for border
  ctx.globalAlpha = borderAlpha;
  ctx.lineWidth = borderWidth;
  ctx.strokeRect(coords.x, coords.y, coords.width, coords.height);

  // For current match, add a subtle pulse effect border
  if (isCurrent) {
    ctx.strokeStyle = '#2196f3';
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 4;
    ctx.strokeRect(coords.x - 1, coords.y - 1, coords.width + 2, coords.height + 2);
  }

  ctx.restore();
}

/**
 * Transform search match bbox to screen coordinates
 * Handles both PDF.js text item transforms and standard bbox format
 *
 * @param bbox - Bounding box in PDF coordinates
 * @param page - PDF.js page object
 * @param viewport - PDF.js viewport object
 * @returns Transformed coordinates for canvas rendering
 */
export function transformSearchMatchCoordinates(
  bbox: BBox,
  page: PDFPageProxy,
  viewport: PDFViewport
): TransformedCoordinates {
  // Reuse the existing transformation logic
  return transformPDFCoordinates(bbox, page, viewport);
}
