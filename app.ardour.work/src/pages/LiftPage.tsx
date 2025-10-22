import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Lift } from '@/components/Lift';
import { Company, Target } from '@/types';
import { dstGlobalPortfolio } from '@/data/mockData';

export function LiftPage() {
  const location = useLocation();
  const [selectedCompany] = useState<Company>(dstGlobalPortfolio.companies[0]);
  const [selectedTarget] = useState<Target | null>(null);
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
        <div className="bg-purple-50 border-b border-purple-200 px-6 py-3">
          <p className="text-sm text-purple-800">
            <span className="font-semibold">{selectedCompanies.length} portfolio companies selected:</span>{' '}
            {selectedCompanies.map(c => c.name).join(', ')}
          </p>
        </div>
      )}
      <Lift 
        selectedCompany={selectedCompany}
        selectedTarget={selectedTarget}
      />
    </>
  );
}