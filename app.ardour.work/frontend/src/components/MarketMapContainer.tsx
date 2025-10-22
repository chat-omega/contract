import { useState } from 'react';
import { CircularTreemap } from './CircularTreemap';
import { TreeMapView } from './TreeMapView';

type VisualizationMode = 'sunburst' | 'treemap';

export function MarketMapContainer() {
  const [mode, setMode] = useState<VisualizationMode>('sunburst');

  return (
    <div className="w-full h-full">
      {mode === 'sunburst' ? (
        <CircularTreemap mode={mode} setMode={setMode} />
      ) : (
        <TreeMapView mode={mode} setMode={setMode} />
      )}
    </div>
  );
}
