import { useState, useMemo } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { ChevronRight, Box, Maximize2 } from 'lucide-react';
import {
  marketData,
  getNodeByPath,
  calculateTotalValue,
  getGrowthColor,
  MarketNode,
  BreadcrumbItem
} from '@/data/marketData';

interface CustomizedContentProps {
  root?: any;
  depth?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  name?: string;
  value?: number;
  growthRate?: number;
  children?: any[];
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      value: number;
      growthRate: number;
      description?: string;
    };
  }>;
}

export function MarketVisualization() {
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [is3DView, setIs3DView] = useState(false);

  // Get current node based on path
  const currentNode = useMemo(() => {
    return getNodeByPath(marketData, currentPath);
  }, [currentPath]);

  // Build breadcrumb trail
  const breadcrumbs = useMemo((): BreadcrumbItem[] => {
    const crumbs: BreadcrumbItem[] = [{ name: marketData.name, path: [] }];
    let current = marketData;

    currentPath.forEach((index, i) => {
      if (current.children && current.children[index]) {
        current = current.children[index];
        crumbs.push({
          name: current.name,
          path: currentPath.slice(0, i + 1)
        });
      }
    });

    return crumbs;
  }, [currentPath]);

  // Transform data for Recharts Treemap
  const treemapData = useMemo(() => {
    const transformNode = (node: MarketNode): any => {
      const value = calculateTotalValue(node);
      const hasChildren = node.children && node.children.length > 0;

      return {
        name: node.name,
        value: hasChildren ? undefined : value,
        growthRate: node.growthRate,
        description: node.description,
        children: hasChildren
          ? node.children.map(transformNode)
          : undefined
      };
    };

    return [transformNode(currentNode)];
  }, [currentNode]);

  // Custom cell renderer
  const CustomizedContent = (props: CustomizedContentProps) => {
    const { x = 0, y = 0, width = 0, height = 0, name, growthRate = 0, children } = props;

    // Only render if cell is large enough
    if (width < 40 || height < 30) {
      return null;
    }

    const backgroundColor = getGrowthColor(growthRate);
    const hasChildren = children && children.length > 0;

    // Calculate font size based on cell dimensions
    const fontSize = Math.min(width / 8, height / 4, 16);
    const showGrowth = width > 80 && height > 50;
    const showIcon = hasChildren && width > 60 && height > 40;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: backgroundColor,
            stroke: 'rgba(255, 255, 255, 0.2)',
            strokeWidth: 2,
            cursor: hasChildren ? 'pointer' : 'default',
            transition: 'all 0.3s ease'
          }}
          rx={4}
          className="hover:brightness-110 transition-all duration-200"
        />

        {is3DView && (
          <>
            {/* 3D effect - side shadow */}
            <rect
              x={x + width}
              y={y + 4}
              width={6}
              height={height}
              style={{
                fill: 'rgba(0, 0, 0, 0.2)',
                pointerEvents: 'none'
              }}
            />
            {/* 3D effect - bottom shadow */}
            <rect
              x={x + 4}
              y={y + height}
              width={width}
              height={6}
              style={{
                fill: 'rgba(0, 0, 0, 0.15)',
                pointerEvents: 'none'
              }}
            />
          </>
        )}

        {/* Text content */}
        <text
          x={x + width / 2}
          y={y + height / 2 - (showGrowth ? 8 : 0)}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fill: 'white',
            fontSize: `${fontSize}px`,
            fontWeight: 600,
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          {name}
        </text>

        {/* Growth rate indicator */}
        {showGrowth && (
          <text
            x={x + width / 2}
            y={y + height / 2 + fontSize}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fill: 'rgba(255, 255, 255, 0.9)',
              fontSize: `${fontSize * 0.7}px`,
              fontWeight: 500,
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              pointerEvents: 'none'
            }}
          >
            {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
          </text>
        )}

        {/* Drill-down icon */}
        {showIcon && (
          <g transform={`translate(${x + width - 24}, ${y + height - 24})`}>
            <circle
              cx={12}
              cy={12}
              r={10}
              style={{
                fill: 'rgba(255, 255, 255, 0.2)',
                stroke: 'rgba(255, 255, 255, 0.5)',
                strokeWidth: 1
              }}
            />
            <path
              d="M9 7l5 5-5 5"
              style={{
                fill: 'none',
                stroke: 'white',
                strokeWidth: 2,
                strokeLinecap: 'round',
                strokeLinejoin: 'round'
              }}
            />
          </g>
        )}
      </g>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="openbb-card p-4 shadow-lg max-w-xs">
          <h3 className="font-semibold text-sm mb-2" style={{ color: 'rgb(var(--foreground))' }}>
            {data.name}
          </h3>
          {data.description && (
            <p className="text-xs mb-2" style={{ color: 'rgb(var(--foreground-secondary))' }}>
              {data.description}
            </p>
          )}
          <div className="flex items-center justify-between text-xs">
            <span style={{ color: 'rgb(var(--muted-foreground))' }}>Market Size:</span>
            <span className="font-medium" style={{ color: 'rgb(var(--foreground))' }}>
              ${data.value}M
            </span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span style={{ color: 'rgb(var(--muted-foreground))' }}>Growth Rate:</span>
            <span
              className="font-medium"
              style={{
                color: data.growthRate > 0 ? 'rgb(var(--success))' : 'rgb(var(--destructive))'
              }}
            >
              {data.growthRate > 0 ? '+' : ''}{data.growthRate.toFixed(1)}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Handle drill-down click
  const handleClick = (data: any) => {
    if (!data || !data.children || data.children.length === 0) {
      return;
    }

    // Find the index of this node in the current node's children
    const childIndex = currentNode.children?.findIndex(
      (child) => child.name === data.name
    );

    if (childIndex !== undefined && childIndex !== -1) {
      setCurrentPath([...currentPath, childIndex]);
    }
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (path: number[]) => {
    setCurrentPath(path);
  };

  // Toggle 3D view
  const toggle3DView = () => {
    setIs3DView(!is3DView);
  };

  const totalValue = calculateTotalValue(currentNode);

  return (
    <div className="openbb-card p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-accent/10 text-accent">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
              Market Visualization
            </h2>
            <p className="text-sm" style={{ color: 'rgb(var(--muted-foreground))' }}>
              Total Market: ${totalValue}M • Growth: {currentNode.growthRate.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* View toggle */}
        <button
          onClick={toggle3DView}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
            is3DView
              ? 'bg-accent text-accent-foreground'
              : 'bg-secondary text-secondary-foreground border border-border'
          }`}
          style={{
            backgroundColor: is3DView ? 'rgb(var(--accent))' : 'rgb(var(--secondary))',
            color: is3DView ? 'rgb(var(--accent-foreground))' : 'rgb(var(--secondary-foreground))'
          }}
        >
          <Maximize2 className="w-4 h-4" />
          <span className="text-sm font-medium">{is3DView ? '3D' : '2D'}</span>
        </button>
      </div>

      {/* Breadcrumb Navigation */}
      {breadcrumbs.length > 1 && (
        <div className="flex items-center space-x-2 mb-4 pb-4 border-b" style={{ borderColor: 'rgb(var(--border))' }}>
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 mx-1" style={{ color: 'rgb(var(--muted-foreground))' }} />
              )}
              <button
                onClick={() => handleBreadcrumbClick(crumb.path)}
                className={`text-sm px-2 py-1 rounded transition-colors ${
                  index === breadcrumbs.length - 1
                    ? 'font-semibold'
                    : 'hover:bg-secondary'
                }`}
                style={{
                  color: index === breadcrumbs.length - 1
                    ? 'rgb(var(--accent))'
                    : 'rgb(var(--foreground-secondary))',
                  backgroundColor: index !== breadcrumbs.length - 1 ? 'transparent' : undefined
                }}
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Treemap Visualization */}
      <div className="flex-1 min-h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={treemapData}
            dataKey="value"
            aspectRatio={4 / 3}
            stroke="rgba(255, 255, 255, 0.2)"
            fill="#8884d8"
            content={<CustomizedContent />}
            onClick={handleClick}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgb(var(--border))' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: getGrowthColor(-10) }}
              />
              <span style={{ color: 'rgb(var(--foreground-secondary))' }}>Negative Growth</span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: getGrowthColor(5) }}
              />
              <span style={{ color: 'rgb(var(--foreground-secondary))' }}>Low Growth (&lt;10%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: getGrowthColor(30) }}
              />
              <span style={{ color: 'rgb(var(--foreground-secondary))' }}>High Growth (30%+)</span>
            </div>
          </div>
          <p className="text-xs" style={{ color: 'rgb(var(--muted-foreground))' }}>
            Click on sectors to drill down • Click breadcrumbs to navigate up
          </p>
        </div>
      </div>
    </div>
  );
}
