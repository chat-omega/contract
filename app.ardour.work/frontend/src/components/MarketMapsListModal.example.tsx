/**
 * Example usage of MarketMapsListModal component
 *
 * This file demonstrates how to integrate the MarketMapsListModal
 * into your application.
 */

import { useState } from 'react';
import { MarketMapsListModal } from './MarketMapsListModal';

export function MarketMapsListModalExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">
          Market Maps List Modal Example
        </h1>

        <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-300 mb-4">
            Click the button below to open the Market Maps List Modal.
            This modal displays:
          </p>

          <ul className="list-disc list-inside text-slate-400 mb-6 space-y-2">
            <li>Main Market Maps with quick access links</li>
            <li>Strategy Analyses section with status indicators</li>
            <li>Viewed Companies with company information</li>
            <li>My Market Maps with saved maps and drill-down paths</li>
            <li>Recent Activity feed</li>
            <li>Quick statistics</li>
          </ul>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Open Market Maps Modal
          </button>
        </div>

        <MarketMapsListModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
}

/**
 * Integration Example:
 *
 * import { MarketMapsListModal } from '@/components/MarketMapsListModal';
 *
 * function YourComponent() {
 *   const [showModal, setShowModal] = useState(false);
 *
 *   return (
 *     <>
 *       <button onClick={() => setShowModal(true)}>
 *         View Market Maps
 *       </button>
 *
 *       <MarketMapsListModal
 *         isOpen={showModal}
 *         onClose={() => setShowModal(false)}
 *       />
 *     </>
 *   );
 * }
 */
