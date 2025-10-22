import { MarketMapsSidebar } from '@/components/MarketMapsSidebar';

/**
 * Demo page showing the MarketMapsSidebar component in action
 * This demonstrates the complete layout with the sidebar
 */
export function MarketMapsSidebarDemo() {
  return (
    <div className="relative min-h-screen bg-slate-800">
      {/* Market Maps Sidebar - Fixed 500px width */}
      <MarketMapsSidebar />

      {/* Main Content Area - Offset by sidebar width */}
      <div className="ml-[500px] p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-4">
            Market Maps Dashboard
          </h1>
          <p className="text-slate-400 mb-8">
            The sidebar on the left contains the Market Maps controls and visualization area.
          </p>

          <div className="bg-slate-900 rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">
              Component Features
            </h2>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                <span>
                  <strong>Fixed Width:</strong> 500px sidebar for consistent layout
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                <span>
                  <strong>Dark Theme:</strong> Slate-900 background matching the design system
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                <span>
                  <strong>Top Section:</strong> Three tab buttons (Segmentation | Versions | Market Report)
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                <span>
                  <strong>Middle Section:</strong> MarketVisualization component (full height, scrollable)
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                <span>
                  <strong>Bottom Section:</strong> View mode toggle (2D | 3D) and control buttons
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-8 bg-slate-900 rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">
              Usage Example
            </h2>
            <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto">
              <code className="text-sm text-green-400">
{`import { MarketMapsSidebar } from '@/components/MarketMapsSidebar';

function MyPage() {
  return (
    <div className="relative min-h-screen">
      <MarketMapsSidebar />

      {/* Your main content with ml-[500px] offset */}
      <div className="ml-[500px] p-8">
        <h1>Your Content Here</h1>
      </div>
    </div>
  );
}`}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
