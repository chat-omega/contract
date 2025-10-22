/**
 * Industry Map Type Definitions
 *
 * Defines the structure for hierarchical industry classification data
 * used in market maps and M&A target visualizations.
 */

export interface Company {
  /** Company name */
  name: string;

  /** Company website URL */
  website?: string;

  /** Brief company description */
  description?: string;

  /** Funding stage: seed, series-a, series-b, series-c, ipo, acquired, etc. */
  fundingStage?: 'seed' | 'series-a' | 'series-b' | 'series-c' | 'series-d+' | 'ipo' | 'acquired' | 'private' | 'public';

  /** Market capitalization or valuation in millions USD */
  marketCap?: number;

  /** Year founded */
  founded?: number;

  /** Headquarters location */
  headquarters?: string;

  /** Key product or service */
  primaryProduct?: string;
}

export interface IndustryNode {
  /** Unique identifier for the node */
  id: string;

  /** Display name of the industry/category */
  name: string;

  /** Market size in millions USD */
  value: number;

  /** Annual growth rate as a percentage */
  growthRate: number;

  /** Detailed description of this industry segment */
  description: string;

  /** Child nodes (sub-industries or segments) */
  children?: IndustryNode[];

  /** Companies in this segment (typically at deepest level) */
  companies?: Company[];

  /** Additional metadata */
  metadata?: {
    /** Geographic regions where this segment is strong */
    region?: ('North America' | 'Europe' | 'Asia' | 'Global')[];

    /** Market maturity stage */
    maturity?: 'emerging' | 'growing' | 'mature' | 'declining';

    /** Level of competitive intensity */
    competitiveIntensity?: 'low' | 'medium' | 'high';

    /** Key trends driving this segment */
    keyTrends?: string[];

    /** Strategic fit for acquisitions (1-5 scale) */
    strategicFit?: number;

    /** Technology maturity */
    techMaturity?: 'nascent' | 'developing' | 'established' | 'commoditized';
  };

  /** Color for visualization (auto-generated if not provided) */
  color?: string;
}

/**
 * Breadcrumb item for navigation
 */
export interface BreadcrumbItem {
  id: string;
  name: string;
  depth: number;
}

/**
 * Flattened node for easier processing
 */
export interface FlatIndustryNode {
  id: string;
  name: string;
  parentId?: string;
  value: number;
  growthRate: number;
  description: string;
  depth: number;
  companies?: Company[];
  metadata?: IndustryNode['metadata'];
}

/**
 * Color gradient based on growth rate
 */
export const getGrowthColor = (growthRate: number): string => {
  // Growth rate ranges from -20% to +50%
  // Map to colors: red (negative) -> yellow (neutral) -> green (positive)
  if (growthRate < 0) {
    // Red shades for negative growth
    const intensity = Math.min(Math.abs(growthRate) / 20, 1);
    return `rgba(239, 68, 68, ${0.3 + intensity * 0.5})`;
  } else if (growthRate < 10) {
    // Yellow/orange for low growth
    return `rgba(251, 191, 36, ${0.3 + (growthRate / 10) * 0.3})`;
  } else {
    // Green gradient for positive growth (10% to 50%)
    const intensity = Math.min((growthRate - 10) / 40, 1);
    const baseGreen = 22;
    const midGreen = 163;
    const brightGreen = 74;

    // Interpolate between darker and brighter green
    const r = Math.round(baseGreen + (brightGreen - baseGreen) * intensity);
    const g = Math.round(163 + (197 - 163) * intensity);
    const b = Math.round(94);

    return `rgba(${r}, ${g}, ${b}, ${0.5 + intensity * 0.4})`;
  }
};

/**
 * Helper function to flatten hierarchical tree
 */
export const flattenIndustryTree = (
  node: IndustryNode,
  parentId?: string,
  depth: number = 0
): FlatIndustryNode[] => {
  const result: FlatIndustryNode[] = [];

  const flatNode: FlatIndustryNode = {
    id: node.id,
    name: node.name,
    parentId,
    value: node.value,
    growthRate: node.growthRate,
    description: node.description,
    depth,
    companies: node.companies,
    metadata: node.metadata,
  };

  result.push(flatNode);

  if (node.children) {
    node.children.forEach((child) => {
      result.push(...flattenIndustryTree(child, node.id, depth + 1));
    });
  }

  return result;
};

/**
 * Helper function to get node by ID
 */
export const getNodeById = (root: IndustryNode, id: string): IndustryNode | null => {
  if (root.id === id) {
    return root;
  }

  if (root.children) {
    for (const child of root.children) {
      const found = getNodeById(child, id);
      if (found) {
        return found;
      }
    }
  }

  return null;
};

/**
 * Helper function to calculate total market value of a node and its children
 */
export const calculateTotalValue = (node: IndustryNode): number => {
  let total = node.value || 0;

  if (node.children) {
    total = node.children.reduce((sum, child) => sum + calculateTotalValue(child), 0);
  }

  return total;
};

/**
 * Helper function to count total nodes in tree
 */
export const countNodes = (node: IndustryNode): number => {
  let count = 1;

  if (node.children) {
    count += node.children.reduce((sum, child) => sum + countNodes(child), 0);
  }

  return count;
};

/**
 * Helper function to get max depth of tree
 */
export const getMaxDepth = (node: IndustryNode, currentDepth: number = 0): number => {
  if (!node.children || node.children.length === 0) {
    return currentDepth;
  }

  return Math.max(...node.children.map(child => getMaxDepth(child, currentDepth + 1)));
};
