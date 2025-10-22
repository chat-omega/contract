import { Portfolio, Region, Analysis, SynergyCategory, TargetCompany } from '@/types';

export const dstGlobalPortfolio: Portfolio = {
  id: 'dst-global',
  name: 'DST Global',
  companies: [
    {
      id: 'glean',
      name: 'Glean',
      sector: 'Enterprise Software',
      stage: 'Series D',
      location: 'San Francisco, CA',
      investmentDate: '2023-05-15',
      valuation: '$2.2B',
      status: 'Active',
      description: 'AI-powered workplace search and knowledge management platform'
    },
    {
      id: 'syfe',
      name: 'Syfe',
      sector: 'FinTech',
      stage: 'Series B',
      location: 'Singapore',
      investmentDate: '2022-08-20',
      valuation: '$180M',
      status: 'Active',
      description: 'Digital wealth management and investment platform for Asia'
    },
    {
      id: 'whatfix',
      name: 'Whatfix',
      sector: 'SaaS',
      stage: 'Series D',
      location: 'Bangalore, India',
      investmentDate: '2023-01-10',
      valuation: '$568M',
      status: 'Active',
      description: 'Digital adoption platform for enterprise software training'
    },
    {
      id: 'qonto',
      name: 'Qonto',
      sector: 'FinTech',
      stage: 'Series D',
      location: 'Paris, France',
      investmentDate: '2022-12-05',
      valuation: '$5.0B',
      status: 'Active',
      description: 'Business banking solution for SMEs and freelancers in Europe'
    },
    {
      id: 'airwallex',
      name: 'Airwallex',
      sector: 'FinTech',
      stage: 'Series E',
      location: 'Melbourne, Australia',
      investmentDate: '2021-09-30',
      valuation: '$5.5B',
      status: 'Active',
      description: 'Global payments and financial platform for businesses'
    },
    {
      id: 'gojek',
      name: 'Gojek',
      sector: 'On-Demand Services',
      stage: 'IPO',
      location: 'Jakarta, Indonesia',
      investmentDate: '2018-03-15',
      valuation: '$10.5B',
      status: 'IPO',
      description: 'Southeast Asian super app for transportation, food delivery, and payments'
    },
    {
      id: 'deliveryhero',
      name: 'Delivery Hero',
      sector: 'Food Delivery',
      stage: 'Public',
      location: 'Berlin, Germany',
      investmentDate: '2017-06-12',
      valuation: '$8.2B',
      status: 'Exited',
      description: 'Global online food ordering and delivery marketplace'
    }
  ]
};

export const regions: Region[] = [
  {
    id: 'england',
    name: 'England',
    count: 8,
    bounds: [[49.5, -6.0], [56.0, 2.0]], // SW to NE corners for England
    center: [53.0, -1.5],
    zoom: 6,
    targets: [
      {
        id: 'london-ai-1',
        name: 'DataFlow AI',
        location: 'London',
        coordinates: [51.5074, -0.1278],
        sector: 'AI/ML',
        description: 'Enterprise data analytics platform specializing in real-time business intelligence',
        techStack: ['Python', 'TensorFlow', 'Apache Kafka', 'React', 'PostgreSQL'],
        revenue: '£12M ARR',
        employees: 95,
        fundingStage: 'Series B',
        lastFunding: '£18M',
        strategicFit: 92
      },
      {
        id: 'london-fintech-1',
        name: 'PayStream',
        location: 'London',
        coordinates: [51.5174, -0.1378],
        sector: 'FinTech',
        description: 'B2B payment solutions for cross-border transactions',
        techStack: ['Node.js', 'React', 'MongoDB', 'AWS'],
        revenue: '£8M ARR',
        employees: 67,
        fundingStage: 'Series A',
        lastFunding: '£12M',
        strategicFit: 88
      },
      {
        id: 'manchester-saas-1',
        name: 'CloudOps Pro',
        location: 'Manchester',
        coordinates: [53.4808, -2.2426],
        sector: 'SaaS',
        description: 'Cloud infrastructure management and DevOps automation',
        techStack: ['Go', 'Kubernetes', 'Docker', 'Vue.js', 'Redis'],
        revenue: '£5M ARR',
        employees: 42,
        fundingStage: 'Seed',
        lastFunding: '£3M',
        strategicFit: 85
      },
      {
        id: 'london-enterprise-1',
        name: 'WorkflowMax',
        location: 'London',
        coordinates: [51.5274, -0.1178],
        sector: 'Enterprise Software',
        description: 'Workflow automation platform for large enterprises',
        techStack: ['Java', 'Spring Boot', 'Angular', 'Oracle', 'Apache Airflow'],
        revenue: '£22M ARR',
        employees: 180,
        fundingStage: 'Series C',
        lastFunding: '£35M',
        strategicFit: 94
      },
      {
        id: 'birmingham-iot-1',
        name: 'SmartFactory',
        location: 'Birmingham',
        coordinates: [52.4862, -1.8904],
        sector: 'IoT',
        description: 'Industrial IoT platform for manufacturing optimization',
        techStack: ['C++', 'Python', 'InfluxDB', 'Grafana', 'MQTT'],
        revenue: '£7M ARR',
        employees: 58,
        fundingStage: 'Series A',
        lastFunding: '£9M',
        strategicFit: 79
      },
      {
        id: 'cambridge-ai-1',
        name: 'QuantumLogic',
        location: 'Cambridge',
        coordinates: [52.2053, 0.1218],
        sector: 'AI/ML',
        description: 'Quantum-enhanced machine learning for financial modeling',
        techStack: ['Python', 'Q#', 'TensorFlow', 'FastAPI', 'PostgreSQL'],
        revenue: '£3M ARR',
        employees: 28,
        fundingStage: 'Seed',
        lastFunding: '£5M',
        strategicFit: 87
      },
      {
        id: 'bristol-medtech-1',
        name: 'HealthTech Solutions',
        location: 'Bristol',
        coordinates: [51.4545, -2.5879],
        sector: 'HealthTech',
        description: 'AI-powered diagnostic tools for healthcare providers',
        techStack: ['Python', 'PyTorch', 'Flutter', 'Firebase', 'GCP'],
        revenue: '£6M ARR',
        employees: 45,
        fundingStage: 'Series A',
        lastFunding: '£8M',
        strategicFit: 82
      },
      {
        id: 'edinburgh-fintech-1',
        name: 'CryptoVault',
        location: 'Edinburgh',
        coordinates: [55.9533, -3.1883],
        sector: 'FinTech',
        description: 'Institutional cryptocurrency custody and trading platform',
        techStack: ['Rust', 'React', 'PostgreSQL', 'Redis', 'Kubernetes'],
        revenue: '£15M ARR',
        employees: 110,
        fundingStage: 'Series B',
        lastFunding: '£25M',
        strategicFit: 91
      }
    ]
  },
  {
    id: 'dach',
    name: 'DACH',
    count: 7,
    bounds: [[47.0, 5.5], [55.5, 17.0]], // SW to NE corners for DACH region
    center: [51.0, 10.5],
    zoom: 6,
    targets: [
      {
        id: 'berlin-ai-1',
        name: 'IntelliSearch',
        location: 'Berlin',
        coordinates: [52.5200, 13.4050],
        sector: 'AI/ML',
        description: 'Enterprise search and knowledge management platform with advanced NLP',
        techStack: ['Python', 'TensorFlow', 'Elasticsearch', 'React', 'Docker'],
        revenue: '€15M ARR',
        employees: 120,
        fundingStage: 'Series B',
        lastFunding: '€22M',
        strategicFit: 95
      },
      {
        id: 'munich-fintech-1',
        name: 'FinanceFlow',
        location: 'Munich',
        coordinates: [48.1351, 11.5820],
        sector: 'FinTech',
        description: 'Corporate treasury management and automated financial operations',
        techStack: ['Java', 'Spring', 'PostgreSQL', 'Angular', 'AWS'],
        revenue: '€8M ARR',
        employees: 85,
        fundingStage: 'Series A',
        lastFunding: '€12M',
        strategicFit: 89
      },
      {
        id: 'frankfurt-fintech-1',
        name: 'TradeTech',
        location: 'Frankfurt',
        coordinates: [50.1109, 8.6821],
        sector: 'FinTech',
        description: 'Algorithmic trading platform for institutional investors',
        techStack: ['C++', 'Python', 'React', 'MongoDB', 'Redis'],
        revenue: '€25M ARR',
        employees: 200,
        fundingStage: 'Series C',
        lastFunding: '€40M',
        strategicFit: 93
      },
      {
        id: 'zurich-ai-1',
        name: 'SwissML',
        location: 'Zurich',
        coordinates: [47.3769, 8.5417],
        sector: 'AI/ML',
        description: 'Federated learning platform for privacy-preserving AI',
        techStack: ['Python', 'PyTorch', 'Kubernetes', 'Go', 'Vue.js'],
        revenue: '€6M ARR',
        employees: 52,
        fundingStage: 'Series A',
        lastFunding: '€10M',
        strategicFit: 86
      },
      {
        id: 'vienna-iot-1',
        name: 'AutomationHub',
        location: 'Vienna',
        coordinates: [48.2082, 16.3738],
        sector: 'IoT',
        description: 'Smart building automation and energy management systems',
        techStack: ['Node.js', 'InfluxDB', 'React', 'MQTT', 'Grafana'],
        revenue: '€4M ARR',
        employees: 38,
        fundingStage: 'Seed',
        lastFunding: '€6M',
        strategicFit: 78
      },
      {
        id: 'hamburg-logistics-1',
        name: 'LogiFlow',
        location: 'Hamburg',
        coordinates: [53.5511, 9.9937],
        sector: 'SaaS',
        description: 'Supply chain optimization and logistics management platform',
        techStack: ['Java', 'Spring Boot', 'PostgreSQL', 'Angular', 'Kubernetes'],
        revenue: '€18M ARR',
        employees: 145,
        fundingStage: 'Series B',
        lastFunding: '€28M',
        strategicFit: 90
      },
      {
        id: 'cologne-enterprise-1',
        name: 'DataBridge',
        location: 'Cologne',
        coordinates: [50.9375, 6.9603],
        sector: 'Enterprise Software',
        description: 'Enterprise data integration and ETL platform for large corporations',
        techStack: ['Scala', 'Apache Spark', 'Kafka', 'React', 'Cassandra'],
        revenue: '€12M ARR',
        employees: 95,
        fundingStage: 'Series A',
        lastFunding: '€18M',
        strategicFit: 88
      }
    ]
  }
];

export const synergyCategories: SynergyCategory[] = [
  {
    id: 'geographic-expansion',
    name: 'Geographic Expansion',
    description: 'Market entry strategies and regional presence expansion',
    icon: 'Globe',
    color: 'blue',
    count: 15,
    valuePotential: '€50-150M potential',
    targets: regions.flatMap(r => r.targets) // Reuse existing geographic data
  },
  {
    id: 'technology-digital',
    name: 'Technology & Digital',
    description: 'AI/ML, cloud platforms, cybersecurity, and digital transformation',
    icon: 'Cpu',
    color: 'purple',
    count: 12,
    valuePotential: '€30-100M savings',
    targets: [
      {
        id: 'ai-platform-1',
        name: 'DeepMind Analytics',
        location: 'London',
        coordinates: [51.5174, -0.1278],
        sector: 'AI/ML',
        description: 'Enterprise AI platform for predictive analytics and automation',
        techStack: ['Python', 'TensorFlow', 'Kubernetes', 'React', 'PostgreSQL'],
        revenue: '£25M ARR',
        employees: 150,
        fundingStage: 'Series C',
        lastFunding: '£40M',
        strategicFit: 96
      },
      {
        id: 'cloud-security-1',
        name: 'SecureCloud Pro',
        location: 'Berlin',
        coordinates: [52.5200, 13.4050],
        sector: 'Cybersecurity',
        description: 'Zero-trust cloud security platform for enterprise environments',
        techStack: ['Go', 'Kubernetes', 'React', 'PostgreSQL', 'Redis'],
        revenue: '€18M ARR',
        employees: 120,
        fundingStage: 'Series B',
        lastFunding: '€28M',
        strategicFit: 91
      },
      {
        id: 'automation-platform-1',
        name: 'ProcessFlow AI',
        location: 'Amsterdam',
        coordinates: [52.3676, 4.9041],
        sector: 'Automation',
        description: 'Intelligent process automation for financial services',
        techStack: ['Python', 'React', 'Docker', 'MongoDB', 'Apache Kafka'],
        revenue: '€12M ARR',
        employees: 85,
        fundingStage: 'Series A',
        lastFunding: '€15M',
        strategicFit: 88
      }
    ]
  },
  {
    id: 'supply-chain',
    name: 'Supply Chain & Integration',
    description: 'Suppliers, distributors, logistics, and vertical integration opportunities',
    icon: 'Truck',
    color: 'green',
    count: 10,
    valuePotential: '€25-75M margins',
    targets: [
      {
        id: 'logistics-tech-1',
        name: 'SmartLogistics EU',
        location: 'Rotterdam',
        coordinates: [51.9244, 4.4777],
        sector: 'Logistics',
        description: 'AI-powered supply chain optimization and last-mile delivery',
        techStack: ['Java', 'Spring', 'React', 'PostgreSQL', 'Apache Kafka'],
        revenue: '€35M ARR',
        employees: 200,
        fundingStage: 'Series C',
        lastFunding: '€50M',
        strategicFit: 93
      },
      {
        id: 'procurement-platform-1',
        name: 'ProcureMax',
        location: 'Barcelona',
        coordinates: [41.3851, 2.1734],
        sector: 'Procurement',
        description: 'B2B procurement automation and supplier management platform',
        techStack: ['Node.js', 'Vue.js', 'MongoDB', 'Redis', 'Docker'],
        revenue: '€15M ARR',
        employees: 95,
        fundingStage: 'Series B',
        lastFunding: '€22M',
        strategicFit: 87
      }
    ]
  },
  {
    id: 'customer-distribution',
    name: 'Customer & Distribution',
    description: 'Complementary customer segments and distribution channel expansion',
    icon: 'Users',
    color: 'orange',
    count: 8,
    valuePotential: '€40-120M synergies',
    targets: [
      {
        id: 'b2b-marketplace-1',
        name: 'TradeBridge',
        location: 'Milan',
        coordinates: [45.4642, 9.1900],
        sector: 'B2B Marketplace',
        description: 'B2B marketplace connecting European SMEs with suppliers',
        techStack: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'Elasticsearch'],
        revenue: '€28M ARR',
        employees: 160,
        fundingStage: 'Series C',
        lastFunding: '€45M',
        strategicFit: 94
      },
      {
        id: 'retail-network-1',
        name: 'ConnectRetail',
        location: 'Paris',
        coordinates: [48.8566, 2.3522],
        sector: 'Retail Technology',
        description: 'Omnichannel retail platform for mid-market retailers',
        techStack: ['Java', 'Angular', 'PostgreSQL', 'AWS', 'Apache Kafka'],
        revenue: '€20M ARR',
        employees: 130,
        fundingStage: 'Series B',
        lastFunding: '€30M',
        strategicFit: 89
      }
    ]
  },
  {
    id: 'product-extensions',
    name: 'Product Line Extensions',
    description: 'Adjacent products, R&D capabilities, and portfolio diversification',
    icon: 'Zap',
    color: 'yellow',
    count: 9,
    valuePotential: '€60-180M revenue',
    targets: [
      {
        id: 'fintech-innovation-1',
        name: 'PayNext Solutions',
        location: 'Stockholm',
        coordinates: [59.3293, 18.0686],
        sector: 'FinTech',
        description: 'Next-gen payment solutions and embedded finance APIs',
        techStack: ['Go', 'React', 'PostgreSQL', 'Redis', 'Kubernetes'],
        revenue: '€22M ARR',
        employees: 110,
        fundingStage: 'Series B',
        lastFunding: '€35M',
        strategicFit: 92
      },
      {
        id: 'saas-innovation-1',
        name: 'DataInsights Pro',
        location: 'Copenhagen',
        coordinates: [55.6761, 12.5683],
        sector: 'SaaS',
        description: 'Advanced analytics and business intelligence for enterprises',
        techStack: ['Python', 'React', 'ClickHouse', 'Redis', 'Docker'],
        revenue: '€18M ARR',
        employees: 85,
        fundingStage: 'Series A',
        lastFunding: '€25M',
        strategicFit: 88
      }
    ]
  },
  {
    id: 'operational-excellence',
    name: 'Operational Excellence',
    description: 'Process optimization, shared services, and efficiency improvements',
    icon: 'Settings',
    color: 'slate',
    count: 7,
    valuePotential: '€20-60M savings',
    targets: [
      {
        id: 'ops-consulting-1',
        name: 'EfficiencyExperts',
        location: 'Zurich',
        coordinates: [47.3769, 8.5417],
        sector: 'Operations Consulting',
        description: 'Digital operations consulting and process automation',
        revenue: '€12M ARR',
        employees: 75,
        fundingStage: 'Series A',
        lastFunding: '€18M',
        strategicFit: 85
      },
      {
        id: 'automation-tools-1',
        name: 'WorkflowAI',
        location: 'Vienna',
        coordinates: [48.2082, 16.3738],
        sector: 'Automation',
        description: 'AI-powered workflow automation for back-office operations',
        techStack: ['Python', 'React', 'PostgreSQL', 'Redis', 'Docker'],
        revenue: '€8M ARR',
        employees: 50,
        fundingStage: 'Seed',
        lastFunding: '€12M',
        strategicFit: 82
      }
    ]
  },
  {
    id: 'talent-capabilities',
    name: 'Talent & Capabilities',
    description: 'Specialized expertise, key personnel, and intellectual property',
    icon: 'GraduationCap',
    color: 'indigo',
    count: 6,
    valuePotential: '€15-45M capability',
    targets: [
      {
        id: 'ai-research-1',
        name: 'EuroAI Labs',
        location: 'Oxford',
        coordinates: [51.7520, -1.2577],
        sector: 'AI Research',
        description: 'Applied AI research lab with 50+ PhD researchers',
        revenue: '€8M ARR',
        employees: 65,
        fundingStage: 'Series A',
        lastFunding: '£12M',
        strategicFit: 90
      },
      {
        id: 'consulting-experts-1',
        name: 'StrategyMinds',
        location: 'Brussels',
        coordinates: [50.8503, 4.3517],
        sector: 'Strategy Consulting',
        description: 'Boutique strategy consulting with deep tech expertise',
        revenue: '€6M ARR',
        employees: 35,
        fundingStage: 'Bootstrapped',
        strategicFit: 86
      }
    ]
  },
  {
    id: 'regulatory-compliance',
    name: 'Regulatory & Compliance',
    description: 'Licensed entities, regulatory expertise, and market access',
    icon: 'Shield',
    color: 'red',
    count: 5,
    valuePotential: '€10-30M access',
    targets: [
      {
        id: 'regtech-platform-1',
        name: 'ComplianceFlow',
        location: 'Frankfurt',
        coordinates: [50.1109, 8.6821],
        sector: 'RegTech',
        description: 'Automated compliance monitoring and regulatory reporting',
        techStack: ['Java', 'Spring', 'PostgreSQL', 'Angular', 'Docker'],
        revenue: '€15M ARR',
        employees: 90,
        fundingStage: 'Series B',
        lastFunding: '€25M',
        strategicFit: 89
      },
      {
        id: 'risk-management-1',
        name: 'RiskGuard Pro',
        location: 'Luxembourg',
        coordinates: [49.6116, 6.1319],
        sector: 'Risk Management',
        description: 'Enterprise risk management and regulatory compliance platform',
        revenue: '€10M ARR',
        employees: 60,
        fundingStage: 'Series A',
        lastFunding: '€15M',
        strategicFit: 87
      }
    ]
  }
];

export const mockAnalysis: Analysis = {
  techStackComparison: [
    'React/TypeScript frontend alignment',
    'Python ML backend compatibility',
    'Elasticsearch integration potential',
    'Cloud-native architecture match'
  ],
  financialSynergy: 'Projected 25% cost reduction through shared infrastructure and 40% faster go-to-market in European markets',
  customerTraction: 'Recent wins: 3 Fortune 500 clients in Q3, 150% YoY growth in enterprise segment',
  sensitivityAnalysis: 'Best case: €50M combined ARR by 2025. Base case: €35M. Downside: €25M',
  knownConnections: [
    'Klaus Mueller (Former CTO, warm intro via Andreas)',
    'Sarah Chen (Board member, direct connection)',
    'Tech team lead (2nd degree via LinkedIn)'
  ]
};

// Mock Target Companies with Contact Details
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
    notes: 'Strong technical team, expanding into European markets. CEO interested in strategic partnerships.',
    contacts: [
      {
        id: 'c1',
        name: 'Michael Johnson',
        role: 'CEO & Founder',
        email: 'michael.johnson@datasync.com',
        phone: '+1 512-555-0101',
        linkedIn: 'https://linkedin.com/in/michaeljohnson'
      },
      {
        id: 'c2',
        name: 'Sarah Chen',
        role: 'CFO',
        email: 'sarah.chen@datasync.com',
        phone: '+1 512-555-0102',
        linkedIn: 'https://linkedin.com/in/sarahchen'
      },
      {
        id: 'c3',
        name: 'David Kumar',
        role: 'CTO',
        email: 'david.kumar@datasync.com',
        linkedIn: 'https://linkedin.com/in/davidkumar'
      }
    ]
  },
  {
    id: 'tc2',
    name: 'CloudScale Analytics',
    location: 'Seattle, WA',
    coordinates: [47.6062, -122.3321],
    sector: 'Data & Analytics',
    description: 'AI-powered business intelligence and analytics platform',
    techStack: ['Python', 'TensorFlow', 'Apache Spark', 'GCP', 'Docker'],
    revenue: '$45M',
    employees: 200,
    fundingStage: 'Series C',
    lastFunding: '$60M',
    strategicFit: 88,
    dealSize: '$300-400M',
    priority: 'high',
    notes: 'Market leader in predictive analytics. Looking for strategic investor with portfolio synergies.',
    contacts: [
      {
        id: 'c4',
        name: 'Emily Rodriguez',
        role: 'CEO',
        email: 'emily.rodriguez@cloudscale.io',
        phone: '+1 206-555-0201',
        linkedIn: 'https://linkedin.com/in/emilyrodriguez'
      },
      {
        id: 'c5',
        name: 'James Wilson',
        role: 'VP of Sales',
        email: 'james.wilson@cloudscale.io',
        phone: '+1 206-555-0202'
      }
    ]
  },
  {
    id: 'tc3',
    name: 'FinFlow Technologies',
    location: 'London, UK',
    coordinates: [51.5074, -0.1278],
    sector: 'FinTech',
    description: 'Payment orchestration and treasury management for enterprises',
    techStack: ['Java', 'Spring Boot', 'MongoDB', 'Azure', 'Terraform'],
    revenue: '$18M',
    employees: 85,
    fundingStage: 'Series A',
    lastFunding: '$20M',
    strategicFit: 85,
    dealSize: '$80-120M',
    priority: 'medium',
    notes: 'Strong regulatory compliance. Expanding to US market. Open to acquisition discussions.',
    contacts: [
      {
        id: 'c6',
        name: 'Alexander Thompson',
        role: 'CEO',
        email: 'alex.thompson@finflow.com',
        phone: '+44 20 7946 0958',
        linkedIn: 'https://linkedin.com/in/alexthompson'
      },
      {
        id: 'c7',
        name: 'Maria Santos',
        role: 'Head of Business Development',
        email: 'maria.santos@finflow.com',
        linkedIn: 'https://linkedin.com/in/mariasantos'
      }
    ]
  },
  {
    id: 'tc4',
    name: 'SecureVault Inc',
    location: 'Tel Aviv, Israel',
    coordinates: [32.0853, 34.7818],
    sector: 'Cybersecurity',
    description: 'Zero-trust security platform for cloud-native applications',
    techStack: ['Go', 'Rust', 'Kubernetes', 'AWS', 'Prometheus'],
    revenue: '$35M',
    employees: 150,
    fundingStage: 'Series B',
    lastFunding: '$45M',
    strategicFit: 90,
    dealSize: '$200-250M',
    priority: 'high',
    notes: 'Cutting-edge technology. Multiple patents. Strong R&D team.',
    contacts: [
      {
        id: 'c8',
        name: 'Yael Cohen',
        role: 'CEO & Co-Founder',
        email: 'yael.cohen@securevault.io',
        phone: '+972 3-555-0100',
        linkedIn: 'https://linkedin.com/in/yaelcohen'
      },
      {
        id: 'c9',
        name: 'Daniel Levy',
        role: 'CTO & Co-Founder',
        email: 'daniel.levy@securevault.io',
        linkedIn: 'https://linkedin.com/in/daniellevy'
      }
    ]
  },
  {
    id: 'tc5',
    name: 'AutomateNow',
    location: 'Berlin, Germany',
    coordinates: [52.5200, 13.4050],
    sector: 'Process Automation',
    description: 'RPA and workflow automation for enterprise operations',
    techStack: ['Python', 'React', 'PostgreSQL', 'AWS', 'Docker'],
    revenue: '$22M',
    employees: 110,
    fundingStage: 'Series B',
    lastFunding: '$35M',
    strategicFit: 87,
    dealSize: '$120-180M',
    priority: 'medium',
    notes: 'GDPR compliant. Strong presence in DACH region. Partnership opportunities with portfolio.',
    contacts: [
      {
        id: 'c10',
        name: 'Klaus Mueller',
        role: 'CEO',
        email: 'klaus.mueller@automatenow.de',
        phone: '+49 30 555 0100',
        linkedIn: 'https://linkedin.com/in/klausmueller'
      },
      {
        id: 'c11',
        name: 'Anna Schmidt',
        role: 'CFO',
        email: 'anna.schmidt@automatenow.de',
        phone: '+49 30 555 0101'
      }
    ]
  },
  {
    id: 'tc6',
    name: 'HealthTech Solutions',
    location: 'Boston, MA',
    coordinates: [42.3601, -71.0589],
    sector: 'Healthcare Tech',
    description: 'AI-driven patient care optimization platform',
    techStack: ['Python', 'TensorFlow', 'React', 'AWS', 'FHIR'],
    revenue: '$40M',
    employees: 180,
    fundingStage: 'Series C',
    lastFunding: '$75M',
    strategicFit: 82,
    dealSize: '$250-350M',
    priority: 'medium',
    notes: 'FDA compliant. Strong hospital network. Potential for international expansion.',
    contacts: [
      {
        id: 'c12',
        name: 'Dr. Robert Chang',
        role: 'CEO',
        email: 'robert.chang@healthtech.com',
        phone: '+1 617-555-0300',
        linkedIn: 'https://linkedin.com/in/drrobertchang'
      },
      {
        id: 'c13',
        name: 'Jennifer Park',
        role: 'VP of Partnerships',
        email: 'jennifer.park@healthtech.com',
        linkedIn: 'https://linkedin.com/in/jenniferpark'
      }
    ]
  },
  {
    id: 'tc7',
    name: 'LogiChain Pro',
    location: 'Singapore',
    coordinates: [1.3521, 103.8198],
    sector: 'Supply Chain',
    description: 'End-to-end supply chain visibility and optimization platform',
    techStack: ['Java', 'Angular', 'Oracle', 'AWS', 'Blockchain'],
    revenue: '$55M',
    employees: 220,
    fundingStage: 'Series C',
    lastFunding: '$80M',
    strategicFit: 86,
    dealSize: '$400-500M',
    priority: 'high',
    notes: 'Strong APAC presence. Strategic partnerships with major logistics providers.',
    contacts: [
      {
        id: 'c14',
        name: 'Thomas Lee',
        role: 'CEO',
        email: 'thomas.lee@logichain.sg',
        phone: '+65 6555 0100',
        linkedIn: 'https://linkedin.com/in/thomaslee'
      },
      {
        id: 'c15',
        name: 'Priya Sharma',
        role: 'COO',
        email: 'priya.sharma@logichain.sg',
        linkedIn: 'https://linkedin.com/in/priyasharma'
      }
    ]
  },
  {
    id: 'tc8',
    name: 'EdTech Innovations',
    location: 'Toronto, Canada',
    coordinates: [43.6532, -79.3832],
    sector: 'Education Technology',
    description: 'Personalized learning platform for K-12 and higher education',
    techStack: ['Node.js', 'React', 'MongoDB', 'GCP', 'ML Kit'],
    revenue: '$28M',
    employees: 130,
    fundingStage: 'Series B',
    lastFunding: '$40M',
    strategicFit: 80,
    dealSize: '$150-200M',
    priority: 'low',
    notes: 'Growing rapidly in North American market. Strong content partnerships.',
    contacts: [
      {
        id: 'c16',
        name: 'Michelle Brown',
        role: 'CEO & Founder',
        email: 'michelle.brown@edtechinnovations.ca',
        phone: '+1 416-555-0400',
        linkedIn: 'https://linkedin.com/in/michellebrown'
      },
      {
        id: 'c17',
        name: 'David Thompson',
        role: 'VP of Sales',
        email: 'david.thompson@edtechinnovations.ca'
      }
    ]
  }
];