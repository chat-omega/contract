import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Scout } from '@/components/Scout';
import { GrowthLever, Target, Company } from '@/types';

export function ScoutPage() {
  const location = useLocation();
  const [selectedLever] = useState<GrowthLever>('bolt-on');
  const [selectedTarget, setSelectedTarget] = useState<Target | null>(null);
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([]);

  useEffect(() => {
    // Check if companies were passed from navigation
    if (location.state?.selectedCompanies) {
      setSelectedCompanies(location.state.selectedCompanies);
    }
  }, [location.state]);

  return (
    <>
      {selectedCompanies.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">{selectedCompanies.length} portfolio companies selected:</span>{' '}
            {selectedCompanies.map(c => c.name).join(', ')}
          </p>
        </div>
      )}
      <Scout 
        selectedLever={selectedLever}
        onTargetSelect={setSelectedTarget}
        selectedTarget={selectedTarget}
      />
    </>
  );
}