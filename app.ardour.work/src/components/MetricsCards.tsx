import { TrendingUp, TrendingDown, Building2, DollarSign, Calendar, BarChart3 } from 'lucide-react';
import { Company } from '@/types';

interface MetricsCardsProps {
  companies: Company[];
  portfolioName: string;
}

interface MetricData {
  id: string;
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  description: string;
}

export function MetricsCards({ companies, portfolioName }: MetricsCardsProps) {
  // Calculate metrics from company data
  const calculateMetrics = (): MetricData[] => {
    const totalCompanies = companies.length;
    const activeCompanies = companies.filter(c => c.status === 'Active').length;
    const exitedCompanies = companies.filter(c => c.status === 'Exited').length;
    const ipoCompanies = companies.filter(c => c.status === 'IPO').length;
    
    // Calculate total portfolio value (if valuations exist)
    const totalValue = companies.reduce((sum, company) => {
      if (!company.valuation) return sum;
      
      const valuation = company.valuation.replace(/[^0-9.]/g, '');
      const multiplier = company.valuation.includes('B') ? 1000000000 : 
                        company.valuation.includes('M') ? 1000000 : 1;
      
      return sum + (parseFloat(valuation) * multiplier);
    }, 0);
    
    // Format total value
    const formatValue = (value: number): string => {
      if (value >= 1000000000) {
        return `$${(value / 1000000000).toFixed(1)}B`;
      } else if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
      }
      return `$${value.toLocaleString()}`;
    };
    
    // Calculate average investment age
    const currentYear = new Date().getFullYear();
    const companiesWithDates = companies.filter(c => c.investmentDate);
    const avgAge = companiesWithDates.length > 0 ? 
      companiesWithDates.reduce((sum, c) => {
        const investYear = new Date(c.investmentDate!).getFullYear();
        return sum + (currentYear - investYear);
      }, 0) / companiesWithDates.length : 0;
    
    // Calculate success rate (Active + IPO companies)
    const successRate = totalCompanies > 0 ? 
      ((activeCompanies + ipoCompanies) / totalCompanies * 100) : 0;
    
    return [
      {
        id: 'total-companies',
        label: 'Total Companies',
        value: totalCompanies.toString(),
        change: '+3 this quarter',
        changeType: 'positive',
        icon: <Building2 className="w-6 h-6" />,
        description: `Active portfolio companies in ${portfolioName}`
      },
      {
        id: 'portfolio-value',
        label: 'Portfolio Value',
        value: totalValue > 0 ? formatValue(totalValue) : 'N/A',
        change: totalValue > 0 ? '+12.5% YTD' : undefined,
        changeType: 'positive',
        icon: <DollarSign className="w-6 h-6" />,
        description: 'Total estimated portfolio valuation'
      },
      {
        id: 'active-investments',
        label: 'Active Investments',
        value: activeCompanies.toString(),
        change: `${Math.round(successRate)}% success rate`,
        changeType: successRate > 80 ? 'positive' : successRate > 60 ? 'neutral' : 'negative',
        icon: <TrendingUp className="w-6 h-6" />,
        description: 'Currently active portfolio companies'
      },
      {
        id: 'exits-ipos',
        label: 'Exits & IPOs',
        value: (exitedCompanies + ipoCompanies).toString(),
        change: avgAge > 0 ? `~${Math.round(avgAge)} yrs avg hold` : undefined,
        changeType: 'neutral',
        icon: <BarChart3 className="w-6 h-6" />,
        description: 'Successful exits and public offerings'
      }
    ];
  };

  const metrics = calculateMetrics();

  const getChangeIcon = (changeType?: string) => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp className="w-3 h-3" />;
      case 'negative':
        return <TrendingDown className="w-3 h-3" />;
      default:
        return <Calendar className="w-3 h-3" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric) => (
        <div key={metric.id} className="metrics-card group">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                {metric.icon}
              </div>
            </div>
            <div className="text-right">
              <div className="metric-value">
                {metric.value}
              </div>
              {metric.change && (
                <div className={`metric-change ${metric.changeType || 'neutral'} flex items-center justify-end space-x-1 mt-1`}>
                  {getChangeIcon(metric.changeType)}
                  <span>{metric.change}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="metric-label uppercase tracking-wide">
              {metric.label}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {metric.description}
            </p>
          </div>
          
          {/* Subtle animation bar */}
          <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-accent to-accent/50 group-hover:w-full transition-all duration-500 ease-out" />
        </div>
      ))}
    </div>
  );
}