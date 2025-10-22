import { MarketMapContainer } from '@/components/MarketMapContainer';

export default function CircularTreemapDemo() {
  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'rgb(15, 23, 42)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Market Map Visualization
          </h1>
          <p className="text-slate-400">
            Interactive market map with hierarchical data visualization - switch between Sunburst and TreeMap views
          </p>
        </div>

        <div className="rounded-lg overflow-hidden shadow-2xl" style={{ height: '800px' }}>
          <MarketMapContainer />
        </div>
      </div>
    </div>
  );
}
