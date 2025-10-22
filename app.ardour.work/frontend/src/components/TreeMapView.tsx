import { useState, useMemo } from 'react';
import { ResponsiveTreeMap } from '@nivo/treemap';
import { ChevronRight, Circle, Grid } from 'lucide-react';
import {
  goqiiIndustryMap as marketData,
  getGrowthColor
} from '@/data/goqiiIndustryMap';
import { BreadcrumbItem, IndustryNode } from '@/types/industryMap';

interface TreeMapViewProps {
  mode: 'sunburst' | 'treemap';
  setMode: (mode: 'sunburst' | 'treemap') => void;
}

export function TreeMapView({ mode, setMode }: TreeMapViewProps) {
  const [currentPath, setCurrentPath] = useState<number[]>([]);

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

  // Transform data for Nivo TreeMap
  const treeMapData = useMemo(() => {
    const transform = (node: IndustryNode): any => {
      const result: any = {
        name: node.name,
        id: node.id,
        value: node.value,
        growthRate: node.growthRate,
        color: getGrowthColor(node.growthRate)
      };

      if (node.children && node.children.length > 0) {
        result.children = node.children.map(transform);
      }

      return result;
    };

    return transform(currentNode);
  }, [currentNode]);

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (depth: number) => {
    setCurrentPath(currentPath.slice(0, depth));
  };

  // Handle node click for drill-down
  const handleNodeClick = (node: any) => {
    if (node.data.children && node.data.children.length > 0) {
      // Find the index of this node in current children
      const index = currentNode.children?.findIndex(c => c.id === node.data.id);
      if (index !== undefined && index !== -1) {
        setCurrentPath([...currentPath, index]);
      }
    }
  };

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

      {/* TreeMap Visualization */}
      <div className="flex-1" style={{ minHeight: 0 }}>
        <ResponsiveTreeMap
          data={treeMapData}
          identity="name"
          value="value"
          valueFormat=".02s"
          margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          labelSkipSize={12}
          labelTextColor="white"
          parentLabelPosition="left"
          parentLabelTextColor="white"
          borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
          colors={(node) => node.data.color || getGrowthColor(node.data.growthRate || 15)}
          onClick={handleNodeClick}
          animate={true}
          motionConfig="gentle"
          tile="squarify"
          innerPadding={3}
          outerPadding={3}
          enableLabel={true}
          label={(node) => node.id}
          theme={{
            text: {
              fill: 'white',
              fontSize: 11,
              fontWeight: 600
            }
          }}
        />
      </div>

      {/* Bottom Control Bar: View Buttons + Legend */}
      <div className="px-4 py-2 border-t border-slate-700/30">
        <div className="flex items-center gap-4">

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

          {/* Growth Rate Legend - Center to Right */}
          <div className="flex flex-col space-y-1 flex-1 max-w-[45%]">
            <div className="flex items-center justify-between text-[8px] text-slate-400">
              <span>Growth Rate</span>
              <span>Click blocks to drill down</span>
            </div>

            <div className="relative h-3 rounded-lg overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to right,
                    ${getGrowthColor(4)} 0%,
                    ${getGrowthColor(15)} 20%,
                    ${getGrowthColor(25)} 50%,
                    ${getGrowthColor(35)} 70%,
                    ${getGrowthColor(50)} 100%)`
                }}
              />

              <div className="absolute inset-0 flex items-center justify-between px-2">
                <span className="text-white text-[8px] font-semibold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                  4%
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
                  50%+
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
