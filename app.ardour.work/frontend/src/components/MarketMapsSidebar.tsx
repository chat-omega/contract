import { useState } from 'react';
import { LayoutGrid, Layers, GitBranch, FileText } from 'lucide-react';
import { MarketMapContainer } from './MarketMapContainer';
import { MarketMapsListModal } from './MarketMapsListModal';

export function MarketMapsSidebar() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSegmentationClick = () => {
    console.log('Segmentation clicked');
    // TODO: Implement segmentation action
  };

  const handleVersionsClick = () => {
    console.log('Versions clicked');
    // TODO: Implement versions action
  };

  const handleMarketResearchClick = () => {
    console.log('Market Research clicked');
    // TODO: Implement market research action
  };

  return (
    <>
      <div className="h-full bg-slate-900 flex flex-col">
        {/* Header Section */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-slate-700/20">
          <div className="flex items-start space-x-3">
            {/* Button to open Market Maps List Modal */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-shrink-0 p-2 hover:bg-slate-800 rounded-lg transition-colors group"
              title="Open Market Maps List"
            >
              <LayoutGrid className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
            </button>

            {/* Heading */}
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-semibold text-base leading-tight">
                M&A Targets for the company Goqii (goqii.com)
              </h2>
            </div>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-slate-700/20">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSegmentationClick}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/20 hover:border-slate-600/50 rounded-lg transition-all group"
            >
              <Layers className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
              <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                Segmentation
              </span>
            </button>

            <button
              onClick={handleVersionsClick}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/20 hover:border-slate-600/50 rounded-lg transition-all group"
            >
              <GitBranch className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
              <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                Versions
              </span>
            </button>

            <button
              onClick={handleMarketResearchClick}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/20 hover:border-slate-600/50 rounded-lg transition-all group"
            >
              <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
              <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                Market Research
              </span>
            </button>
          </div>
        </div>

        {/* Visualization Section - Takes remaining space */}
        <div className="flex-1 overflow-hidden">
          <MarketMapContainer />
        </div>
      </div>

      {/* Market Maps List Modal */}
      <MarketMapsListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
