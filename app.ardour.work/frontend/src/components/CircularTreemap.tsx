import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { ChevronRight, Circle, Grid, Plus, Minus } from 'lucide-react';
import {
  goqiiIndustryMap as marketData,
  getGrowthColor,
  calculateTotalValue
} from '@/data/goqiiIndustryMap';
import { getNodeById, BreadcrumbItem } from '@/types/industryMap';

interface SunburstSegment {
  name: string;
  value: number;
  growthRate: number;
  fill: string;
  depth: number;
  index: number;
  hasChildren: boolean;
}

interface CircularTreemapProps {
  mode: 'sunburst' | 'treemap';
  setMode: (mode: 'sunburst' | 'treemap') => void;
}

export function CircularTreemap({ mode, setMode }: CircularTreemapProps) {
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Get current node based on path
  const currentNode = useMemo(() => {
    let node = marketData;
    for (const index of currentPath) {
      if (node.children && node.children[index]) {
        node = node.children[index];
      }
    }
    return node;
  }, [currentPath]);

  // Build breadcrumb trail
  const breadcrumbs = useMemo((): BreadcrumbItem[] => {
    const crumbs: BreadcrumbItem[] = [{ id: marketData.id, name: marketData.name, depth: 0 }];
    let current = marketData;

    currentPath.forEach((index, i) => {
      if (current.children && current.children[index]) {
        current = current.children[index];
        crumbs.push({
          id: current.id,
          name: current.name,
          depth: i + 1
        });
      }
    });

    return crumbs;
  }, [currentPath]);

  // Transform hierarchical data into sunburst segments
  const sunburstData = useMemo(() => {
    const segments: SunburstSegment[] = [];

    if (!currentNode.children || currentNode.children.length === 0) {
      return segments;
    }

    // Add children as main segments
    currentNode.children.forEach((child, index) => {
      const value = calculateTotalValue(child);
      segments.push({
        name: child.name,
        value,
        growthRate: child.growthRate,
        fill: getGrowthColor(child.growthRate),
        depth: 0,
        index,
        hasChildren: Boolean(child.children && child.children.length > 0)
      });
    });

    return segments;
  }, [currentNode]);

  // Calculate nested rings for hierarchical visualization
  const nestedRings = useMemo(() => {
    const rings: SunburstSegment[][] = [sunburstData];

    // Create second level (grandchildren)
    if (currentNode.children) {
      const secondLevel: SunburstSegment[] = [];
      currentNode.children.forEach((child, parentIndex) => {
        if (child.children) {
          child.children.forEach((grandchild, childIndex) => {
            const value = calculateTotalValue(grandchild);
            secondLevel.push({
              name: grandchild.name,
              value,
              growthRate: grandchild.growthRate,
              fill: getGrowthColor(grandchild.growthRate),
              depth: 1,
              index: parentIndex * 100 + childIndex, // Unique index
              hasChildren: Boolean(grandchild.children && grandchild.children.length > 0)
            });
          });
        }
      });
      if (secondLevel.length > 0) {
        rings.push(secondLevel);
      }
    }

    return rings;
  }, [currentNode, sunburstData]);

  // Handle segment click for drill-down
  const handleSegmentClick = (data: SunburstSegment) => {
    if (data.depth === 0 && data.hasChildren) {
      setCurrentPath([...currentPath, data.index]);
      setActiveIndex(null);
    }
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (depth: number) => {
    setCurrentPath(currentPath.slice(0, depth));
    setActiveIndex(null);
  };

  // Handle center click to go up
  const handleCenterClick = () => {
    if (currentPath.length > 0) {
      setCurrentPath(currentPath.slice(0, -1));
      setActiveIndex(null);
    }
  };

  // Custom active shape renderer
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.9}
          stroke="rgba(255, 255, 255, 0.5)"
          strokeWidth={2}
        />
      </g>
    );
  };

  // Custom label renderer
  const renderCustomLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, name, growthRate } = props;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Calculate available arc length to determine if we can show text
    const arcLength = (outerRadius - innerRadius) * Math.abs(props.endAngle - props.startAngle) * RADIAN;

    if (arcLength < 40) return null;

    return (
      <g>
        <text
          x={x}
          y={y}
          fill="white"
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
          fontSize={name.length > 25 ? '10' : '12'}
          fontWeight="600"
          style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
        >
          {name}
        </text>
      </g>
    );
  };

  const totalValue = calculateTotalValue(currentNode);
  const minGrowth = 4;
  const maxGrowth = 50;

  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: 'rgb(15, 23, 42)' }}>
      {/* Breadcrumb Navigation */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center space-x-2">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 mx-1 text-slate-500" />
              )}
              <button
                onClick={() => handleBreadcrumbClick(crumb.depth)}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  index === breadcrumbs.length - 1
                    ? 'font-semibold text-indigo-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Circular Visualization */}
      <div className="flex-1 relative py-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
            {/* Inner ring - main categories */}
            {nestedRings[0] && nestedRings[0].length > 0 && (
              <Pie
                data={nestedRings[0]}
                cx="50%"
                cy="50%"
                innerRadius={`${30 * (zoomLevel / 100)}%`}
                outerRadius={`${60 * (zoomLevel / 100)}%`}
                dataKey="value"
                label={renderCustomLabel}
                labelLine={false}
                isAnimationActive={false}
                activeIndex={activeIndex ?? undefined}
                activeShape={renderActiveShape}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={(data) => handleSegmentClick(data as SunburstSegment)}
                style={{ cursor: 'pointer' }}
              >
                {nestedRings[0].map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    stroke="rgba(15, 23, 42, 0.8)"
                    strokeWidth={3}
                  />
                ))}
              </Pie>
            )}

            {/* Outer ring - subcategories */}
            {nestedRings[1] && nestedRings[1].length > 0 && (
              <Pie
                data={nestedRings[1]}
                cx="50%"
                cy="50%"
                innerRadius={`${62 * (zoomLevel / 100)}%`}
                outerRadius={`${97 * (zoomLevel / 100)}%`}
                dataKey="value"
                isAnimationActive={false}
                label={(props) => {
                  const { cx, cy, midAngle, outerRadius, name } = props;
                  const RADIAN = Math.PI / 180;
                  const radius = outerRadius + 40;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);

                  const arcLength = outerRadius * Math.abs(props.endAngle - props.startAngle) * RADIAN;
                  if (arcLength < 25) return null;

                  return (
                    <text
                      x={x}
                      y={y}
                      fill="rgba(255, 255, 255, 0.7)"
                      textAnchor={x > cx ? 'start' : 'end'}
                      dominantBaseline="central"
                      fontSize={name.length > 30 ? '8' : '10'}
                      fontWeight="500"
                    >
                      {name}
                    </text>
                  );
                }}
                labelLine={false}
              >
                {nestedRings[1].map((entry, index) => (
                  <Cell
                    key={`cell-outer-${index}`}
                    fill={entry.fill}
                    stroke="rgba(15, 23, 42, 0.8)"
                    strokeWidth={2}
                    opacity={0.85}
                  />
                ))}
              </Pie>
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Control Bar: View Buttons + Legend + Zoom */}
      <div className="px-4 py-2 border-t border-slate-700/30">
        <div className="flex items-center justify-between gap-3">

          {/* View Mode Buttons - Left */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setMode('sunburst')}
              className={`p-1.5 rounded-lg transition-all border border-slate-700/50 ${
                mode === 'sunburst'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
              title="Sunburst View"
            >
              <Circle className="w-3 h-3" />
            </button>
            <button
              onClick={() => setMode('treemap')}
              className={`p-1.5 rounded-lg transition-all border border-slate-700/50 ${
                mode === 'treemap'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
              title="TreeMap View"
            >
              <Grid className="w-3 h-3" />
            </button>
          </div>

          {/* Growth Rate Legend - Center */}
          <div className="flex flex-col space-y-1 flex-1 max-w-[35%]">
            <div className="flex items-center justify-between text-[8px] text-slate-400">
              <span>Growth Rate</span>
              <span>Click segments to drill down</span>
            </div>

            {/* Gradient bar */}
            <div className="relative h-3 rounded-lg overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to right,
                    ${getGrowthColor(minGrowth)} 0%,
                    ${getGrowthColor(15)} 20%,
                    ${getGrowthColor(25)} 50%,
                    ${getGrowthColor(35)} 70%,
                    ${getGrowthColor(maxGrowth)} 100%)`
                }}
              />

              {/* Labels */}
              <div className="absolute inset-0 flex items-center justify-between px-2">
                <span className="text-white text-[8px] font-semibold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                  {minGrowth}%
                </span>
                <span className="text-white text-[8px] font-semibold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                  15%
                </span>
                <span className="text-white text-[8px] font-semibold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                  25%
                </span>
                <span className="text-white text-[8px] font-semibold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                  35%
                </span>
                <span className="text-white text-[8px] font-semibold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                  {maxGrowth}%+
                </span>
              </div>
            </div>
          </div>

          {/* Zoom Controls - Right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setZoomLevel(Math.max(80, zoomLevel - 10))}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all border border-slate-700/50"
              title="Zoom Out"
              disabled={zoomLevel <= 80}
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs text-slate-300 font-semibold min-w-[3rem] text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel(Math.min(120, zoomLevel + 10))}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all border border-slate-700/50"
              title="Zoom In"
              disabled={zoomLevel >= 120}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
