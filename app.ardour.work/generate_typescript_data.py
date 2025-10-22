#!/usr/bin/env python3
"""
Generate TypeScript data file from parsed portfolio JSON
"""

import json

def generate_typescript_data():
    # Load the parsed JSON data
    with open('parsed_portfolio_data.json', 'r', encoding='utf-8') as f:
        portfolios = json.load(f)
    
    # Generate TypeScript content
    ts_content = """import { Portfolio, Region, Analysis, SynergyCategory, TargetCompany } from '@/types';

// Real portfolio data extracted from Shortlist PE.xlsx
// Generated automatically - do not edit manually

"""
    
    # Generate individual portfolio exports
    for portfolio in portfolios:
        portfolio_id = portfolio['id']
        portfolio_name = portfolio['name']
        companies = portfolio['companies']
        
        # Create variable name (ensure it doesn't start with a number)
        var_name = portfolio_id.replace('-', '_').replace('360_', 'three_sixty_') + '_portfolio'
        
        ts_content += f"""export const {var_name}: Portfolio = {{
  id: '{portfolio_id}',
  name: '{portfolio_name}',
  companies: [
"""
        
        # Add each company
        for i, company in enumerate(companies):
            comma = ',' if i < len(companies) - 1 else ''
            
            # Escape single quotes in strings
            def escape_string(s):
                if s is None:
                    return 'undefined'
                return f"'{str(s).replace(chr(39), chr(92) + chr(39))}'"
            
            ts_content += f"""    {{
      id: {escape_string(company['id'])},
      name: {escape_string(company['name'])},
      sector: {escape_string(company['sector'])},
      stage: {escape_string(company['stage'])},
      location: {escape_string(company['location'])},
      investmentDate: {escape_string(company.get('investmentDate'))},
      valuation: {escape_string(company.get('valuation'))},
      status: {escape_string(company['status'])} as 'Active' | 'Exited' | 'IPO',
      description: {escape_string(company.get('description'))}
    }}{comma}
"""
        
        ts_content += f"""  ]
}};

"""
    
    # Create portfolios array
    ts_content += "// All portfolios array\n"
    ts_content += "export const allPortfolios: Portfolio[] = [\n"
    
    for i, portfolio in enumerate(portfolios):
        portfolio_id = portfolio['id']
        var_name = portfolio_id.replace('-', '_').replace('360_', 'three_sixty_') + '_portfolio'
        comma = ',' if i < len(portfolios) - 1 else ''
        ts_content += f"  {var_name}{comma}\n"
    
    ts_content += "];\n\n"
    
    # Add default export (first portfolio for backward compatibility)
    if portfolios:
        first_portfolio_var = portfolios[0]['id'].replace('-', '_').replace('360_', 'three_sixty_') + '_portfolio'
        ts_content += f"// Default export for backward compatibility\n"
        ts_content += f"export const dstGlobalPortfolio = {first_portfolio_var};\n"
    
    # Add portfolio lookup helper
    ts_content += """
// Helper function to get portfolio by id
export const getPortfolioById = (id: string): Portfolio | undefined => {
  return allPortfolios.find(portfolio => portfolio.id === id);
};

// Get all portfolio names for dropdown
export const getPortfolioOptions = () => {
  return allPortfolios.map(portfolio => ({
    id: portfolio.id,
    name: portfolio.name,
    companyCount: portfolio.companies.length
  }));
};

// Additional exports needed by other components

export const regions: Region[] = [
  {
    id: 'england',
    name: 'England',
    count: 8,
    bounds: [[49.5, -6.0], [56.0, 2.0]], 
    center: [53.0, -1.5],
    zoom: 6,
    targets: []
  }
];

export const synergyCategories: SynergyCategory[] = [
  {
    id: 'technology-digital',
    name: 'Technology & Digital',
    description: 'AI/ML, cloud platforms, cybersecurity, and digital transformation',
    icon: 'Cpu',
    color: 'purple',
    count: 12,
    valuePotential: '€30-100M savings',
    targets: []
  }
];

export const mockAnalysis: Analysis = {
  techStackComparison: [
    'React/TypeScript frontend alignment',
    'Python ML backend compatibility',
    'Elasticsearch integration potential',
    'Cloud-native architecture match'
  ],
  financialSynergy: 'Projected 25% cost reduction through shared infrastructure and 40% faster go-to-market',
  customerTraction: 'Recent wins: 3 Fortune 500 clients in Q3, 150% YoY growth in enterprise segment',
  sensitivityAnalysis: 'Best case: €50M combined ARR by 2025. Base case: €35M. Downside: €25M',
  knownConnections: [
    'Klaus Mueller (Former CTO, warm intro via Andreas)',
    'Sarah Chen (Board member, direct connection)',
    'Tech team lead (2nd degree via LinkedIn)'
  ]
};

export const mockTargetCompanies: TargetCompany[] = [
  {
    id: 'tc1',
    name: 'DataSync Solutions',
    location: 'Austin, TX',
    coordinates: [30.2672, -97.7431],
    sector: 'Enterprise Software',
    description: 'Real-time data synchronization platform for enterprise applications',
    techStack: ['Node.js', 'React', 'PostgreSQL', 'AWS', 'Kubernetes'],
    revenue: '$25M',
    employees: 120,
    fundingStage: 'Series B',
    lastFunding: '$30M',
    strategicFit: 92,
    dealSize: '$150-200M',
    priority: 'high',
    notes: 'Strong technical team, expanding into European markets.',
    contacts: [
      {
        id: 'c1',
        name: 'Michael Johnson',
        role: 'CEO & Founder',
        email: 'michael.johnson@datasync.com',
        phone: '+1 512-555-0101',
        linkedIn: 'https://linkedin.com/in/michaeljohnson'
      }
    ]
  }
];
"""
    
    return ts_content

def main():
    print("🔄 Generating TypeScript data file...")
    
    ts_content = generate_typescript_data()
    
    # Write to file
    output_file = "generated_portfolio_data.ts"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(ts_content)
    
    print(f"✅ TypeScript data generated: {output_file}")
    
    # Show stats
    with open('parsed_portfolio_data.json', 'r') as f:
        portfolios = json.load(f)
    
    print(f"📊 Generated data includes:")
    for portfolio in portfolios:
        print(f"   - {portfolio['name']}: {len(portfolio['companies'])} companies")

if __name__ == "__main__":
    main()