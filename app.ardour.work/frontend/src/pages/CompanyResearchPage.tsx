import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Building2, TrendingUp, Target, Users, Mail, Phone, Linkedin, DollarSign, Calendar, Globe, Package, Briefcase } from 'lucide-react';
import { Company } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { useWorkflow } from '@/contexts/WorkflowContext';
import { Toast } from '@/components/Toast';
import { TargetDetailModal } from '@/components/TargetDetailModal';

interface ContactInfo {
  name: string;
  role: string;
  email: string;
  phone: string;
  linkedin: string;
}

interface PotentialTarget {
  name: string;
  type: string;
  location: string;
  dealSize: string;
  strategicRationale: string;
  contacts: ContactInfo[];
}

interface ValueCreationThesis {
  id: number;
  title: string;
  description: string;
  potentialValue: string;
  timeframe: string;
  targets: PotentialTarget[];
}

export function CompanyResearchPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const company = location.state?.company as Company;

  if (!company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Company Not Found</h2>
          <p className="text-slate-400 mb-4">Unable to load company information</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Default generic data for most companies
  const defaultGenericData = {
    executiveSummary: {
      highlights: [
        'Multi-path value creation strategy combining organic growth, strategic partnerships, and M&A opportunities',
        `Market positioning in ${company.sector} sector with strong competitive advantages and scalable business model`,
        'Target exit via strategic sale, secondary offering, or IPO depending on market conditions and valuation optimization'
      ]
    },

    industry: {
      overview: `${company.sector} is experiencing rapid growth driven by digital transformation and market expansion. The sector shows strong fundamentals with increasing demand, favorable regulatory environment, and significant opportunities for consolidation and value creation.`,
      marketSize: 'Growing Market with Strong Tailwinds',
      growthDrivers: [
        'Digital transformation and technology adoption',
        'Market consolidation opportunities',
        'Regulatory tailwinds and policy support',
        'Increasing consumer/enterprise demand'
      ]
    },

    revenueScenarios: [
      { multiple: '3× Sales', ev: 'Conservative valuation', scenario: 'Base case exit' },
      { multiple: '5× Sales', ev: 'Market standard', scenario: 'Strategic buyer interest' },
      { multiple: '7× Sales', ev: 'Premium valuation', scenario: 'Competitive process + growth story' }
    ],

    moicIrrTable: {
      headers: ['Hold (yrs)', '1.5×', '2.0×', '2.5×', '3.0×', '4.0×'],
      rows: [
        { years: 3, returns: ['14.5%', '26.0%', '35.7%', '44.2%', '58.7%'] },
        { years: 5, returns: ['8.4%', '14.9%', '20.1%', '24.6%', '32.0%'] },
        { years: 7, returns: ['6.0%', '10.4%', '14.0%', '17.0%', '21.9%'] }
      ]
    },

    competition: [
      { name: 'Market Leader A', marketShare: '25%', strength: 'Scale & distribution' },
      { name: 'Competitor B', marketShare: '18%', strength: 'Product innovation' },
      { name: 'Competitor C', marketShare: '15%', strength: 'Customer relationships' },
      { name: company.name, marketShare: '12%', strength: 'Technology & execution' }
    ],

    customerSegments: [
      { segment: 'Enterprise', description: 'Large enterprise customers', contribution: '45%' },
      { segment: 'Mid-Market', description: 'Mid-sized businesses', contribution: '35%' },
      { segment: 'SMB/Other', description: 'Small business and other segments', contribution: '20%' }
    ],

    productsServices: [
      { category: 'Core Product/Service', revenue: 'Primary revenue', growth: '+25% YoY' },
      { category: 'Add-ons & Upsells', revenue: 'Secondary revenue', growth: '+30% YoY' },
      { category: 'Professional Services', revenue: 'Service revenue', growth: '+18% YoY' },
      { category: 'Recurring Revenue', revenue: 'Subscription/recurring', growth: '+22% YoY' }
    ],

    valueCreationTheses: [
      {
        id: 1,
        title: 'Strategic Sale to Industry Leader',
        description: 'Full or majority acquisition by strategic buyer in the sector. Synergies include customer base consolidation, technology integration, geographic expansion, and operational efficiencies.',
        potentialValue: 'Premium valuation (5-7× revenue)',
        timeframe: '9-12 months',
        targets: [
          {
            name: 'Strategic Buyer A',
            type: 'Industry Leader',
            location: 'Major Market',
            dealSize: 'Full acquisition',
            strategicRationale: 'Market consolidation, technology acquisition, customer base expansion',
            contacts: [
              {
                name: 'Corp Dev Team',
                role: 'Corporate Development',
                email: 'corpdev@strategicbuyer.com',
                phone: '+1-XXX-XXX-XXXX',
                linkedin: 'linkedin.com/company/strategicbuyer'
              }
            ]
          },
          {
            name: 'Strategic Buyer B',
            type: 'Adjacent Player',
            location: 'Major Market',
            dealSize: 'Majority stake',
            strategicRationale: 'Product line expansion, cross-selling opportunities',
            contacts: [
              {
                name: 'M&A Team',
                role: 'Mergers & Acquisitions',
                email: 'ma@adjacentplayer.com',
                phone: '+1-XXX-XXX-XXXX',
                linkedin: 'linkedin.com/company/adjacentplayer'
              }
            ]
          }
        ]
      },
      {
        id: 2,
        title: 'Growth Equity / Secondary Round',
        description: 'Bring in growth capital partner or provide liquidity to existing investors through secondary transaction. Maintain growth trajectory while providing partial exit opportunity.',
        potentialValue: '4-5× revenue valuation',
        timeframe: '6-9 months',
        targets: [
          {
            name: 'Growth Equity Fund A',
            type: 'Growth Equity Firm',
            location: 'Global',
            dealSize: 'Primary + Secondary',
            strategicRationale: 'Growth capital for expansion, partial liquidity for existing investors',
            contacts: [
              {
                name: 'Investment Team',
                role: 'Partner / Principal',
                email: 'invest@growthequity.com',
                phone: '+1-XXX-XXX-XXXX',
                linkedin: 'linkedin.com/company/growthequityfund'
              }
            ]
          },
          {
            name: 'Secondary Fund B',
            type: 'Secondary PE Fund',
            location: 'Global',
            dealSize: 'LP Stakes',
            strategicRationale: 'Liquidity for early investors, continuation vehicle potential',
            contacts: [
              {
                name: 'Secondary Team',
                role: 'Managing Director',
                email: 'secondaries@fundB.com',
                phone: '+1-XXX-XXX-XXXX',
                linkedin: 'linkedin.com/company/secondaryfund'
              }
            ]
          }
        ]
      },
      {
        id: 3,
        title: 'Bolt-on Acquisitions + Build',
        description: 'Acquire complementary businesses to accelerate growth, expand capabilities, and increase valuation multiple. Focus on tuck-in acquisitions that add strategic value and can be quickly integrated.',
        potentialValue: 'Scale to premium multiple (6-8×)',
        timeframe: '18-24 months',
        targets: [
          {
            name: 'Target Company A',
            type: 'Complementary Business',
            location: 'Key Market',
            dealSize: 'Tuck-in acquisition',
            strategicRationale: 'Technology/product enhancement, customer base addition, geographic expansion',
            contacts: [
              {
                name: 'Founder/CEO',
                role: 'Chief Executive Officer',
                email: 'ceo@targetcompany.com',
                phone: '+1-XXX-XXX-XXXX',
                linkedin: 'linkedin.com/in/ceo-target'
              }
            ]
          },
          {
            name: 'Target Company B',
            type: 'Adjacent Capability',
            location: 'Key Market',
            dealSize: 'Strategic acquisition',
            strategicRationale: 'Capability addition, talent acquisition, market access',
            contacts: [
              {
                name: 'Founder/CEO',
                role: 'Chief Executive Officer',
                email: 'founder@targetB.com',
                phone: '+1-XXX-XXX-XXXX',
                linkedin: 'linkedin.com/in/founder-targetb'
              }
            ]
          }
        ]
      }
    ]
  };

  // FirstCry-specific data
  const firstCryData = {
    // Executive Summary
    executiveSummary: {
      highlights: [
        'Two-track: (1) Sell-down/secondary block to long-onlys/secondaries + (2) strategic buyers/partners (retail conglomerates + marketplaces)',
        'Pricing anchor: FY25 revenue ₹7,660 Cr → market trades at ~2.4× sales = ₹19k Cr mcap; strategic premium 2.5-3.0× = ₹19.6-23.6k Cr',
        'Most probable buyers: Reliance Retail (Hamleys), Tata Trent (Westside/Zudio), ABFRL/TMRW, Amazon/Flipkart/Myntra, Landmark Group (Middle East)'
      ]
    },

    industry: {
      overview: `FirstCry is India's leading omnichannel baby & kids retailer with 1,150+ stores, listed on NSE/BSE since Aug 13, 2024. Market cap ~₹19k Cr at 2.4× sales. Key differentiators: >55% own-brand mix (targeting >60%), 78% online/22% offline GMV split, GlobalBees subsidiary for D2C roll-up, and UAE/Middle East franchise expansion. IPO validates scale; strategic value lies in PL penetration, offline density, and logistics optimization.`,
      marketSize: 'India Baby & Kids Retail (Omnichannel)',
      growthDrivers: [
        'Private-label expansion (target >60% from current >55%)',
        'Offline store density (1,150+ → 2,000 COCO/FOFO plan)',
        'GlobalBees D2C brand roll-up consolidation',
        'Middle East expansion (UAE franchises + FirstCry.ae)'
      ]
    },

    // Revenue scenarios
    revenueScenarios: [
      { multiple: '2.0× Sales', ev: '₹15.7k Cr', scenario: 'Discount to market (block floor)' },
      { multiple: '2.5× Sales', ev: '₹19.6k Cr', scenario: 'Current market (₹7,870 Cr TTM)' },
      { multiple: '3.0× Sales', ev: '₹23.6k Cr', scenario: 'Strategic premium (PL mix >60%, store scale)' }
    ],

    // MOIC to IRR table
    moicIrrTable: {
      headers: ['Hold (yrs)', '1.5×', '2.0×', '2.5×', '3.0×', '4.0×'],
      rows: [
        { years: 3, returns: ['14.5%', '26.0%', '35.7%', '44.2%', '58.7%'] },
        { years: 5, returns: ['8.4%', '14.9%', '20.1%', '24.6%', '32.0%'] },
        { years: 7, returns: ['6.0%', '10.4%', '14.0%', '17.0%', '21.9%'] }
      ]
    },

    competition: [
      { name: 'Reliance Retail', marketShare: 'Hamleys, AJIO Kids', strength: 'Mall footprint + toy ecosystem' },
      { name: 'Amazon / Flipkart / Myntra', marketShare: 'Kids category leaders', strength: 'Marketplace scale + fulfilment' },
      { name: 'Tata Trent', marketShare: 'Westside/Zudio kidswear', strength: 'Apparel traffic + omnichannel' },
      { name: 'FirstCry', marketShare: 'Market Leader', strength: 'Omnichannel scale + >55% own brands + GlobalBees roll-up' }
    ],

    customerSegments: [
      { segment: 'Online (D2C + Marketplace)', description: 'E-commerce platform + marketplace sellers', contribution: '78% GMV' },
      { segment: 'Offline (COCO + FOFO Stores)', description: '1,150+ stores across India', contribution: '22% GMV' },
      { segment: 'Own Brands', description: 'Private-label products (target >60%)', contribution: '>55% of sales' }
    ],

    productsServices: [
      { category: 'Baby & Kids Apparel', revenue: '₹3,800 Cr', growth: '+15% YoY' },
      { category: 'Toys, Gear & Equipment', revenue: '₹2,100 Cr', growth: '+18% YoY' },
      { category: 'Diapers & Hygiene', revenue: '₹1,200 Cr', growth: '+12% YoY' },
      { category: 'GlobalBees (D2C Roll-up)', revenue: '₹560 Cr', growth: '+25% YoY' }
    ],

    valueCreationTheses: [
      {
        id: 1,
        title: 'Public-Market Liquidity (Clean Secondary)',
        description: 'Sell-down via accelerated book build (ABB) or block trade to long-only institutions and sovereign wealth funds. Listed on NSE/BSE since Aug 13, 2024, providing immediate liquidity at market valuation (~2.4× sales = ₹19k Cr). Structured blocks with secondary PE funds can include board observer rights and downside collars.',
        potentialValue: '₹19k Cr @ 2.4× sales (market)',
        timeframe: '3-6 months',
        targets: [
          {
            name: 'ADIA (Abu Dhabi Investment Authority)',
            type: 'Sovereign Wealth Fund',
            location: 'Abu Dhabi, UAE',
            dealSize: 'Block anchor (IPO anchor investor)',
            strategicRationale: 'IPO anchor investor with demonstrated appetite for FirstCry; can absorb large blocks at market pricing with speed',
            contacts: [
              {
                name: 'Public Markets Desk',
                role: 'India Equities',
                email: 'publicmarkets@adia.ae',
                phone: '+971-2-XXXX-XXXX',
                linkedin: 'linkedin.com/company/adia'
              }
            ]
          },
          {
            name: 'GIC (Singapore)',
            type: 'Sovereign Wealth Fund',
            location: 'Singapore',
            dealSize: 'Block co-anchor (IPO anchor)',
            strategicRationale: 'IPO anchor with strong India retail/consumer track record; can participate in accelerated book builds',
            contacts: [
              {
                name: 'Public Equities Team',
                role: 'India Coverage',
                email: 'publicequities@gic.com.sg',
                phone: '+65-XXXX-XXXX',
                linkedin: 'linkedin.com/company/gic'
              }
            ]
          },
          {
            name: 'TPG NewQuest',
            type: 'Secondary PE Fund',
            location: 'Asia (India presence)',
            dealSize: 'Structured block with governance',
            strategicRationale: 'Asia secondaries platform; structured blocks with board observer, collar/downside protection if desired',
            contacts: [
              {
                name: 'Amit Gupta',
                role: 'Founding Partner',
                email: 'asia@tpgnewquest.com',
                phone: '+91-22-XXXX-XXXX',
                linkedin: 'linkedin.com/company/tpg-newquest'
              }
            ]
          },
          {
            name: 'TR Capital',
            type: 'Secondary PE Fund',
            location: 'Mumbai, India',
            dealSize: 'Structured block',
            strategicRationale: 'Pan-Asia secondary specialist with Mumbai office (2024); active in listed and pre-IPO secondaries',
            contacts: [
              {
                name: 'India Team',
                role: 'Investment Team',
                email: 'india@trcapital.com',
                phone: '+91-22-XXXX-XXXX',
                linkedin: 'linkedin.com/company/tr-capital'
              }
            ]
          },
          {
            name: 'Neo Asset Management',
            type: 'India Secondary Fund',
            location: 'India',
            dealSize: 'Block participation',
            strategicRationale: 'Neo II Secondary Fund dedicated to India; focus on consumer/retail secondaries',
            contacts: [
              {
                name: 'Hemant Daga',
                role: 'CEO',
                email: 'hemant@neoasset.in',
                phone: '+91-XX-XXXX-XXXX',
                linkedin: 'linkedin.com/in/hemantdaga'
              }
            ]
          },
          {
            name: 'Global Long-Only Institutions',
            type: 'Mutual Funds / Asset Managers',
            location: 'Global',
            dealSize: 'ABB participation',
            strategicRationale: 'Fidelity, T. Rowe Price, BlackRock, Vanguard - all active in India listed equity; ABB demand pools',
            contacts: [
              {
                name: 'India Desk',
                role: 'Portfolio Managers',
                email: 'india@[fund].com',
                phone: 'Various',
                linkedin: 'linkedin.com/company/[fund]'
              }
            ]
          }
        ]
      },
      {
        id: 2,
        title: 'Strategic Stake / Combination',
        description: 'Strategic minority stake, JV, or full acquisition by retail conglomerates, marketplaces, or regional players. Value-creation angle: lift (i) private-label penetration >60%, (ii) offline store density via mall access, (iii) logistics cost via network effects. Positioning emphasizes omnichannel scale, own-brand mix, and GlobalBees roll-up capability.',
        potentialValue: '₹19.6-23.6k Cr (2.5-3.0× sales)',
        timeframe: '9-12 months',
        targets: [
          {
            name: 'Reliance Retail',
            type: 'Retail Conglomerate',
            location: 'Mumbai, India',
            dealSize: '2.5-3.0× Sales (Strategic)',
            strategicRationale: 'Hamleys owner (toys) + AJIO/Trends (fashion) = kids ecosystem synergy; mall footprint for FirstCry store-in-store; scope for co-developed PL kids brands',
            contacts: [
              {
                name: 'Corporate Development',
                role: 'M&A / Strategic Partnerships',
                email: 'corpdev@ril.com',
                phone: '+91-22-XXXX-XXXX',
                linkedin: 'linkedin.com/company/reliance-retail'
              }
            ]
          },
          {
            name: 'Tata Trent (Westside/Zudio)',
            type: 'Retail Conglomerate',
            location: 'Mumbai, India',
            dealSize: '2.5-3.0× Sales (Minority or Control)',
            strategicRationale: 'Strong kidswear traffic at Westside/Zudio; potential merch/PL synergy, omnichannel alliance, or minority stake with commercial pact',
            contacts: [
              {
                name: 'Category Leadership',
                role: 'Kidswear / Corporate Development',
                email: 'corpdev@trent.co.in',
                phone: '+91-22-XXXX-XXXX',
                linkedin: 'linkedin.com/company/trent-limited'
              }
            ]
          },
          {
            name: 'ABFRL / TMRW (Aditya Birla Fashion)',
            type: 'Fashion Conglomerate',
            location: 'Mumbai, India',
            dealSize: 'Strategic Partnership / Stake',
            strategicRationale: 'House of brands investing in kids & D2C; scope for PL sourcing, omnichannel integration, creator commerce on TMRW platform',
            contacts: [
              {
                name: 'M&A Team',
                role: 'Corporate Development',
                email: 'corpdev@abfrl.com',
                phone: '+91-22-XXXX-XXXX',
                linkedin: 'linkedin.com/company/aditya-birla-fashion-and-retail'
              }
            ]
          },
          {
            name: 'Amazon India',
            type: 'Marketplace / Tech Giant',
            location: 'Bengaluru, India',
            dealSize: 'Strategic Minority + Category Captain JV',
            strategicRationale: 'Kids fashion scale on Amazon.in; funded Hopscotch (kids marketplace) signals appetite; FirstCry as anchor brand/category captain + logistics partnership',
            contacts: [
              {
                name: 'Fashion & Kids Category',
                role: 'Category Leadership / Partnerships',
                email: 'in-partnerships@amazon.com',
                phone: '+91-80-XXXX-XXXX',
                linkedin: 'linkedin.com/company/amazon'
              }
            ]
          },
          {
            name: 'Flipkart / Myntra',
            type: 'Marketplace',
            location: 'Bengaluru, India',
            dealSize: 'Minority Stake + JV',
            strategicRationale: 'Kids category leaders on Flipkart/Myntra; FirstCry integration for exclusive PL brands, fulfilment synergy, omnichannel pilot',
            contacts: [
              {
                name: 'Corporate Development',
                role: 'Strategic Partnerships / M&A',
                email: 'corpdev@flipkart.com',
                phone: '+91-80-XXXX-XXXX',
                linkedin: 'linkedin.com/company/flipkart'
              }
            ]
          },
          {
            name: 'Landmark Group / Babyshop',
            type: 'Middle East Retail',
            location: 'Dubai, UAE',
            dealSize: 'Regional JV / Expansion Partner',
            strategicRationale: 'FirstCry already operates FirstCry.ae and UAE franchises; Landmark Group (Babyshop peer) regional partnership for GCC/Middle East scale-up',
            contacts: [
              {
                name: 'Strategic Partnerships',
                role: 'Business Development / M&A',
                email: 'partnerships@landmarkgroup.com',
                phone: '+971-4-XXXX-XXXX',
                linkedin: 'linkedin.com/company/landmark-group'
              }
            ]
          }
        ]
      },
      {
        id: 3,
        title: '"Beast It" - Bolt-on Acquisitions',
        description: 'Tuck-in acquisitions to raise ARPU, expand margin, and add B2B channels. Focus on D2C baby gear, hygiene, and kids fashion to lift PL mix >60%, scale stores to 2,000, and leverage GlobalBees (FirstCry subsidiary) for integration. Target: lift revenue and rerate to 3.0× sales before exit in 18-24 months. Keep deals sub-₹100 Cr for speed.',
        potentialValue: 'Rerate to 3.0× sales (₹23.6k Cr)',
        timeframe: '12-18 months build + exit',
        targets: [
          {
            name: 'R for Rabbit',
            type: 'D2C Baby Gear (Strollers, Car Seats)',
            location: 'India',
            dealSize: '₹60-100 Cr',
            strategicRationale: 'Freshly funded, scaling stroller/gear brand; strong D2C presence; adds high-margin products to FirstCry assortment and PL pipeline',
            contacts: [
              {
                name: 'Founder/CEO',
                role: 'Chief Executive',
                email: 'info@rforrabbit.com',
                phone: '+91-XX-XXXX-XXXX',
                linkedin: 'linkedin.com/company/r-for-rabbit'
              }
            ]
          },
          {
            name: 'SuperBottoms',
            type: 'D2C Sustainable Diapers',
            location: 'India',
            dealSize: '₹50-80 Cr',
            strategicRationale: 'Profitable cloth-diaper brand with sustainable positioning; strong unit economics; adds premium hygiene category and eco-conscious brand equity',
            contacts: [
              {
                name: 'Founder/CEO',
                role: 'Chief Executive',
                email: 'hello@superbottoms.com',
                phone: '+91-XX-XXXX-XXXX',
                linkedin: 'linkedin.com/company/superbottoms'
              }
            ]
          },
          {
            name: 'The Moms Co',
            type: 'D2C Baby Hygiene & Wellness',
            location: 'India (Good Glamm portfolio)',
            dealSize: 'Partnership / Brand Rights',
            strategicRationale: 'Part of Good Glamm Group; partnership or selective brand/product rights for baby hygiene; adds clean/natural positioning',
            contacts: [
              {
                name: 'Good Glamm Group',
                role: 'Corporate Development',
                email: 'corpdev@myglamm.com',
                phone: '+91-22-XXXX-XXXX',
                linkedin: 'linkedin.com/company/the-moms-co'
              }
            ]
          },
          {
            name: 'Hopscotch',
            type: 'Kids Fashion Marketplace',
            location: 'Mumbai, India',
            dealSize: '₹80-120 Cr',
            strategicRationale: 'Amazon-backed kids marketplace; assortment depth + design engine; integrates as premium fashion vertical within FirstCry omnichannel',
            contacts: [
              {
                name: 'Founder/CEO',
                role: 'Chief Executive',
                email: 'contact@hopscotch.in',
                phone: '+91-22-XXXX-XXXX',
                linkedin: 'linkedin.com/company/hopscotch'
              }
            ]
          },
          {
            name: 'GlobalBees Roll-up (Existing Subsidiary)',
            type: 'D2C Brand Aggregator',
            location: 'India (FirstCry subsidiary)',
            dealSize: 'Ongoing consolidation',
            strategicRationale: 'FirstCry owns GlobalBees; use as acquisition engine to keep rolling up long-tail D2C baby/kids brands (recent stake hikes & control deals); accelerate PL integration',
            contacts: [
              {
                name: 'GlobalBees Leadership',
                role: 'M&A / Integration',
                email: 'ma@globalbees.in',
                phone: '+91-XX-XXXX-XXXX',
                linkedin: 'linkedin.com/company/globalbees'
              }
            ]
          }
        ]
      }
    ]
  };

  // GOQii-specific data - Strategic Outreach Pack for GCC & SEA
  const goqiiData = {
    executiveSummary: {
      highlights: [
        '$20-30M strategic syndicate round (50-70% secondary + 30-50% growth capital) for GCC & SEA regional expansion',
        'Anchor preventive-health leadership with engagement-first model: behavior + data + action via insurer and sovereign distribution',
        'Revenue trajectory: $8.5M (FY24A) → $40.0M (FY27P) with EBITDA expansion from -12% to +15%; active users 2.1M → 6.5M',
        'Business mix FY27P: Subscriptions (45%), B2B Corporate Wellness (30%), Diagnostics/Telehealth (15%), Devices (10%)',
        'Expansion focus: UAE, KSA, Singapore first with named anchor prospects (M42/PureHealth, Tawuniya/Bupa Arabia, AIA/Prudential)'
      ]
    },

    industry: {
      overview: `GOQii is raising a $20-30M strategic syndicate to regionalize a proven, engagement-first preventive-health platform across GCC & SEA. The company combines wearables, human coaching, and AI-powered insights into a HealthOS that enables insurers and employers to reduce claims costs through sustained behavior change. Distribution strategy leverages insurer white-label programs, sovereign health ecosystems, corporate wellness partnerships, and super-app integrations (Grab/Good Doctor) to lower CAC and expand LTV with Vitality-style incentives. Target markets (UAE, KSA, Singapore) show strong policy shift toward prevention amid rising chronic disease burden, high smartphone penetration, and openness to wellness gamification.`,
      marketSize: '$100B+ Health Engagement Market (GCC & SEA)',
      growthDrivers: [
        'Policy shift toward prevention amid chronic disease burden; employer wellness mandates',
        'High smartphone penetration; insurer digitization; Vitality-style wellness incentives',
        'Distribution through insurers, sovereign health systems, large employers, and super-apps',
        'AI coaching automation reducing cost per engaged user by ~25%; CAC:LTV improving to 1:6'
      ]
    },

    revenueScenarios: [
      { multiple: 'FY24A Revenue', ev: '$8.5M', scenario: 'Current baseline (India-focused)' },
      { multiple: 'FY26P Revenue', ev: '$20.0M', scenario: 'GCC/SEA pilots launched; initial traction' },
      { multiple: 'FY27P Revenue', ev: '$40.0M', scenario: 'Regional scale-up; multiple insurer/employer programs live' }
    ],

    moicIrrTable: {
      headers: ['Metric', 'FY24A', 'FY26P', 'FY27P', 'Notes'],
      rows: [
        { years: 'Revenue (USD)', returns: ['$8.5M', '$20.0M', '$40.0M', 'GCC/SEA expansion'] },
        { years: 'Gross Margin', returns: ['49%', '52%', '55%', 'Subscription + B2B mix improvement'] },
        { years: 'EBITDA Margin', returns: ['-12%', '+5%', '+15%', 'Operating leverage + AI coaching'] },
        { years: 'Active Users', returns: ['2.1M', '4.0M', '6.5M', 'Insurer & employer distribution'] }
      ]
    },

    competition: [
      { name: 'Vitality (Discovery)', marketShare: 'Global Leader', strength: 'Insurer white-label wellness + incentives' },
      { name: 'AIA Vitality', marketShare: 'SEA Incumbent', strength: 'Integrated across AIA markets; behavioral economics' },
      { name: 'Dacadoo / Liva / Wellthy', marketShare: 'Regional Challengers', strength: 'Corporate wellness SaaS; limited coaching depth' },
      { name: 'GOQii', marketShare: 'Engagement-First Platform', strength: 'Human + AI coaching; HealthOS APIs; device-agnostic data capture' }
    ],

    customerSegments: [
      { segment: 'Subscriptions (FY27P)', description: 'Recurring wellness + coaching fees', contribution: '45%' },
      { segment: 'B2B Corporate Wellness (FY27P)', description: 'Employer/insurer programs + dashboards', contribution: '30%' },
      { segment: 'Diagnostics/Telehealth (FY27P)', description: 'Cross-sell from engaged cohorts', contribution: '15%' },
      { segment: 'Devices (FY27P)', description: 'Acquisition driver; lower margin', contribution: '10%' }
    ],

    productsServices: [
      { category: 'Engagement Infrastructure', revenue: 'Wearables + App + Coaching', growth: 'Daily habit change; risk scoring APIs' },
      { category: 'HealthOS Platform', revenue: 'APIs for insurers/providers', growth: 'Pull risk scores, engagement metrics, outcomes data' },
      { category: 'Ecosystem Integration', revenue: 'Diagnostics, teleconsults, pharmacy', growth: 'Configurable rewards; B2B2C distribution' },
      { category: 'Expansion Playbook', revenue: 'UAE, KSA, SG first', growth: '90-day pilots with insurers/employers; local localization' }
    ],

    valueCreationTheses: [
      {
        id: 1,
        title: 'Insurer-Led Strategic Round',
        description: 'Target insurers operating Vitality-style wellness programs (AIA, Prudential, AXA, Allianz, Bupa) for minority stake ($6-10M) + pilot commitment. Pilot: white-label HealthOS integration for 10k-50k members with 90-day engagement tracking. Strategic rationale: proven engagement infra reduces claims cost by 8-15%; insurer owns distribution + data; co-develop localized coaching content. Ideal: anchor 1-2 insurers at round lead, commit to 3-year rollout across GCC/SEA books.',
        potentialValue: '$6-10M (20-30% stake) + pilot fees',
        targets: [
          {
            name: 'AIA Group / AIA Catalyst',
            type: 'Life Insurer + VC Arm',
            location: 'Hong Kong / Singapore',
            dealSize: '$5-8M lead + SEA pilot (SG, MY, TH)',
            strategicRationale: 'AIA Vitality largest wellness program in SEA; pilot integration with 50k AIA SG members; co-develop localized coaching + rewards; potential rollout to 38M AIA customers across 18 markets',
            contacts: [
              {
                name: 'Stuart A. Spencer',
                role: 'CEO, AIA Catalyst',
                email: 'stuart.spencer@aia.com',
                phone: '+852-XXXX-XXXX',
                linkedin: 'linkedin.com/in/stuart-spencer-aia'
              }
            ]
          },
          {
            name: 'Prudential Strategic Ventures',
            type: 'Life Insurer + VC',
            location: 'Singapore / Hong Kong',
            dealSize: '$4-7M co-lead + SEA pilot',
            strategicRationale: 'Prudential Vitality program across SEA; GOQii pilot for 20k PRUActive members in SG/HK; coaching integration + claims analytics; scale to 19M Prudential SEA customers',
            contacts: [
              {
                name: 'Nic Humphries',
                role: 'CEO, Prudential Singapore / Head of Health',
                email: 'nic.humphries@prudential.com.sg',
                phone: '+65-XXXX-XXXX',
                linkedin: 'linkedin.com/in/nic-humphries'
              }
            ]
          },
          {
            name: 'AXA Asia & Gulf',
            type: 'Life & Health Insurer',
            location: 'Hong Kong / Dubai',
            dealSize: '$3-6M participation + GCC/SEA pilot',
            strategicRationale: 'AXA Health Keeper app in Asia + Gulf; GOQii coaching layer for 15k members (UAE, HK, SG); wellness incentives tied to AXA claims data; expand to AXA corporate wellness clients',
            contacts: [
              {
                name: 'Gordon Watson',
                role: 'CEO, AXA Asia & Africa',
                email: 'gordon.watson@axa.com',
                phone: '+852-XXXX-XXXX',
                linkedin: 'linkedin.com/in/gordon-watson-axa'
              }
            ]
          },
          {
            name: 'Allianz X',
            type: 'Digital Investment Unit (Allianz Group)',
            location: 'Munich / Singapore',
            dealSize: '$4-7M co-lead + pilot',
            strategicRationale: 'Allianz Partners wellness programs + Allianz SEA health portfolios; GOQii pilot for 10k Allianz Care members (expats in GCC/SEA); integrate coaching + risk scoring APIs; scale via Allianz Partners B2B2C',
            contacts: [
              {
                name: 'Nazim Cetin',
                role: 'CEO, Allianz X',
                email: 'nazim.cetin@allianz.com',
                phone: '+49-89-XXXX-XXXX',
                linkedin: 'linkedin.com/in/nazimcetin'
              }
            ]
          },
          {
            name: 'Bupa Arabia / Bupa Global',
            type: 'Health Insurer',
            location: 'Riyadh, KSA / London, UK',
            dealSize: '$3-6M + KSA pilot',
            strategicRationale: 'Bupa Arabia (KSA market leader, ~5M members) launching wellness initiatives aligned with Vision 2030; GOQii pilot for 20k corporate clients in Riyadh/Jeddah; Arabic coaching + localized content; expand to Bupa Gulf (UAE, Oman)',
            contacts: [
              {
                name: 'Tal Nazer',
                role: 'CEO, Bupa Arabia',
                email: 'tal.nazer@bupa.com.sa',
                phone: '+966-11-XXXX-XXXX',
                linkedin: 'linkedin.com/in/tal-nazer'
              }
            ]
          }
        ]
      },
      {
        id: 2,
        title: 'Sovereign & Healthcare Strategic Round',
        description: 'Target sovereign wealth/health funds + hospital groups deploying population-scale prevention (Temasek/EDBI, Khazanah, Mubadala/M42, ADQ/PureHealth, IHH) for $8-12M anchor + government/hospital distribution. Pilot: 50k-100k citizens/employees via national wellness programs or employer mandates. Strategic rationale: prevention mandates reduce public health burden; GOQii provides engagement layer for PHCs, corporates, and national health apps. Ideal: 1-2 sovereign co-leads at 25-35% combined; secure MOU for 500k-1M user rollout over 24 months.',
        potentialValue: '$8-12M (25-35% stake) + sovereign distribution',
        targets: [
          {
            name: 'Temasek / EDBI',
            type: 'Sovereign + Healthcare VC',
            location: 'Singapore',
            dealSize: '$6-10M lead + SG national pilot',
            strategicRationale: 'Temasek healthcare portfolio (Sheares, Fullerton Health) + EDBI digital health mandate; GOQii pilot via HPB (Health Promotion Board) for 100k Singaporeans under Healthier SG program; integrate with national HealthHub app; scale to 500k via employer wellness mandates',
            contacts: [
              {
                name: 'Chia Song Hwee',
                role: 'Deputy CEO & CIO, Temasek',
                email: 'corporate@temasek.com.sg',
                phone: '+65-XXXX-XXXX',
                linkedin: 'linkedin.com/in/chia-song-hwee'
              }
            ]
          },
          {
            name: 'Khazanah Nasional',
            type: 'Sovereign Wealth Fund',
            location: 'Kuala Lumpur, Malaysia',
            dealSize: '$5-8M co-lead + MY national pilot',
            strategicRationale: 'Khazanah healthcare investments (IHH, Affin Hwang); GOQii pilot via Ministry of Health Malaysia for 50k public servants (KWSP wellness program); integrate with MySejahtera health app; expand to 1M Malaysians via employer mandates',
            contacts: [
              {
                name: 'Amirul Feisal Wan Zahir',
                role: 'Managing Director, Khazanah',
                email: 'corporate@khazanah.com.my',
                phone: '+60-3-XXXX-XXXX',
                linkedin: 'linkedin.com/in/amirulfeisal'
              }
            ]
          },
          {
            name: 'Mubadala / M42 Health',
            type: 'Sovereign + Integrated Health System',
            location: 'Abu Dhabi, UAE',
            dealSize: '$6-10M lead + UAE national pilot',
            strategicRationale: 'M42 (Mubadala healthcare arm, largest in MENA) operates hospitals, PHCs, and national screening programs; GOQii pilot for 50k UAE nationals via SEHA PHCs + corporate wellness (ADNOC, Etihad); integrate with M42 digital health stack; scale to 500k via Abu Dhabi public health mandate',
            contacts: [
              {
                name: 'Hasan Jasem Al Nowais',
                role: 'CEO, M42',
                email: 'info@m42.ae',
                phone: '+971-2-XXXX-XXXX',
                linkedin: 'linkedin.com/in/hasan-alnowais'
              }
            ]
          },
          {
            name: 'ADQ / PureHealth',
            type: 'Sovereign + Healthcare Operator',
            location: 'Abu Dhabi, UAE',
            dealSize: '$5-8M co-lead + UAE pilot',
            strategicRationale: 'PureHealth (ADQ healthcare platform, 200+ facilities across UAE) operates national screening + vaccination programs; GOQii pilot for 30k PureHealth employees + 20k Abu Dhabi government employees; integrate with PureHealth EHR + wellness app; expand to 300k via employer mandates (government + corporates)',
            contacts: [
              {
                name: 'Farhan Malik',
                role: 'Group CEO, PureHealth',
                email: 'info@purehealth.ae',
                phone: '+971-2-XXXX-XXXX',
                linkedin: 'linkedin.com/in/farhan-malik-purehealth'
              }
            ]
          },
          {
            name: 'IHH Healthcare',
            type: 'Pan-Asian Hospital Group',
            location: 'Kuala Lumpur, Malaysia (Khazanah + Mitsui portfolio)',
            dealSize: '$4-7M + SEA hospital network pilot',
            strategicRationale: 'IHH operates 80+ hospitals across 10 countries (SG, MY, TH, IN, CN); GOQii pilot for 50k IHH corporate wellness clients (Parkway Shenton SG, Pantai MY); post-discharge engagement for chronic disease patients; scale to 500k via IHH employer network + patient base',
            contacts: [
              {
                name: 'Dr. Prem Kumar Nair',
                role: 'Group CEO, IHH Healthcare',
                email: 'corporate@ihhhealthcare.com',
                phone: '+60-3-XXXX-XXXX',
                linkedin: 'linkedin.com/in/prem-kumar-nair'
              }
            ]
          }
        ]
      },
      {
        id: 3,
        title: 'Distribution Partnership Round',
        description: 'Target super-app platforms + distribution-first insurers (Grab Ventures, Tawuniya Vitality) for $4-8M strategic stake + embedded wellness in super-app or insurer digital channels. Pilot: 100k-500k Grab Health/GrabPay users or Tawuniya policyholders with gamified engagement, rewards redemption, and cross-sell to diagnostics/telehealth. Strategic rationale: super-app reduces CAC to near-zero via in-app distribution; GOQii provides engagement layer + health commerce revenue share. Ideal: 1 super-app anchor + 1 insurer co-investor; MOU for 1M+ user rollout.',
        potentialValue: '$4-8M (15-25% stake) + distribution',
        targets: [
          {
            name: 'Grab Ventures / Good Doctor (Grab Health)',
            type: 'Super-App + Digital Health',
            location: 'Singapore (HQ) / SEA',
            dealSize: '$6-10M lead + SEA super-app pilot',
            strategicRationale: 'Grab operates in 8 SEA countries with 187M users; Good Doctor (Grab-backed telehealth) has 30M users; GOQii embedded in Grab Health tab for 500k pilot users (SG, MY, TH); gamified wellness missions earn GrabRewards; cross-sell to Good Doctor teleconsults + diagnostics; scale to 5M Grab users via GrabPay wellness wallet',
            contacts: [
              {
                name: 'Ming Maa',
                role: 'President, Grab',
                email: 'corporate@grab.com',
                phone: '+65-XXXX-XXXX',
                linkedin: 'linkedin.com/in/ming-maa'
              }
            ]
          },
          {
            name: 'Tawuniya (The Company for Cooperative Insurance) - Vitality Division',
            type: 'Health Insurer (KSA Market Leader)',
            location: 'Riyadh, Saudi Arabia',
            dealSize: '$4-7M co-lead + KSA insurer pilot',
            strategicRationale: 'Tawuniya (largest health insurer in KSA, 6M+ members) launching Tawuniya Vitality program aligned with Vision 2030 wellness goals; GOQii powers engagement layer for 100k Vitality members; Arabic coaching + localized rewards (gym, retail discounts); integrate with Tawuniya app + claims data; scale to 1M members over 24 months',
            contacts: [
              {
                name: 'Dr. Abdulatif Al-Sheikh',
                role: 'CEO, Tawuniya',
                email: 'info@tawuniya.com.sa',
                phone: '+966-11-XXXX-XXXX',
                linkedin: 'linkedin.com/in/abdulatif-alsheikh'
              }
            ]
          }
        ]
      }
    ]
  };

  // Freo-specific data - Strategic Value-Creation Pack (India, UPI-led Credit Scale-Up)
  const freoData = {
    executiveSummary: {
      highlights: [
        'Credit on UPI is the unlock: pre-sanctioned credit lines usable on UPI (and RuPay-on-UPI) expand acceptance to any UPI QR, lifting activation and frequency',
        'Partner-first distribution: scale through issuer banks (credit-line issuance) and merchant acquirers/aggregators (checkout embed), keeping CAC low',
        'Asset-light posture: Freo orchestrates underwriting, lifecycle engagement, and collections with bank/NBFC partners as lender-of-record'
      ]
    },

    industry: {
      overview: 'Freo — Strategic Value-Creation Pack (India, UPI-led Credit Scale-Up)',
      marketSize: 'India UPI Credit Market',
      growthDrivers: []
    },

    revenueScenarios: [],
    moicIrrTable: { headers: [], rows: [] },
    competition: [],
    customerSegments: [],
    productsServices: [],
    valueCreationTheses: [
      {
        id: 1,
        title: 'Issuer-Led CL-UPI Scale',
        description: 'Banks to issue pre-sanctioned credit lines usable on UPI (and RuPay-on-UPI where applicable). Pilot: 50k–100k pre-approved users; phased rollout. Strategic rationale: Max acceptance (any UPI QR) → higher activation & frequency; issuer owns balance sheet; Freo provides underwriting, lifecycle ops, and collections. Ideal: Anchor 1–2 issuers with multi-year volume commitments; tight credit box & repayment mandates. Structure: Commercial issuance agreement (no equity required; optional minority check tied to milestones).',
        potentialValue: 'Commercial SOW + optional minority',
        targets: [
          {
            name: 'HDFC Bank',
            type: 'Universal Bank',
            location: 'Mumbai',
            dealSize: 'CL-UPI issuance program for salaried/prime cohorts',
            strategicRationale: 'Scale retail base, strong cards/UPI stack; high propensity to activate/upsell across HDFC ecosystem',
            contacts: [
              {
                name: 'Head—Retail Assets',
                role: 'Retail Assets Leadership',
                email: 'retail@hdfcbank.com',
                phone: '+91-22-XXXX-XXXX',
                linkedin: 'linkedin.com/company/hdfc-bank'
              },
              {
                name: 'Head—Cards & Payments',
                role: 'Cards & Payments Leadership',
                email: 'cards@hdfcbank.com',
                phone: '+91-22-XXXX-XXXX',
                linkedin: 'linkedin.com/company/hdfc-bank'
              },
              {
                name: 'Head—Digital Partnerships',
                role: 'Digital Partnerships',
                email: 'partnerships@hdfcbank.com',
                phone: '+91-22-XXXX-XXXX',
                linkedin: 'linkedin.com/company/hdfc-bank'
              }
            ]
          },
          {
            name: 'ICICI Bank',
            type: 'Private Bank',
            location: 'Mumbai',
            dealSize: 'Co-branded CL-UPI line + risk-sharing framework',
            strategicRationale: 'Tech-forward issuer; deep consumer credit ops; fast integration cadence',
            contacts: [
              {
                name: 'Head—Consumer Finance',
                role: 'Consumer Finance Leadership',
                email: 'consumer@icicibank.com',
                phone: '+91-22-XXXX-XXXX',
                linkedin: 'linkedin.com/company/icici-bank'
              },
              {
                name: 'Head—UPI & Cards',
                role: 'UPI & Cards Leadership',
                email: 'upi@icicibank.com',
                phone: '+91-22-XXXX-XXXX',
                linkedin: 'linkedin.com/company/icici-bank'
              },
              {
                name: 'Head—Partnerships',
                role: 'Partnership Development',
                email: 'partnerships@icicibank.com',
                phone: '+91-22-XXXX-XXXX',
                linkedin: 'linkedin.com/company/icici-bank'
              }
            ]
          },
          {
            name: 'IDFC FIRST Bank',
            type: 'Private Bank',
            location: 'Mumbai',
            dealSize: 'Anchor issuer for pre-sanctioned CL-UPI with rapid pilot',
            strategicRationale: 'Aggressive retail growth, digital DNA, flexible product constructs',
            contacts: [
              {
                name: 'Head—Retail Assets',
                role: 'Retail Assets Leadership',
                email: 'retail@idfcfirstbank.com',
                phone: '+91-22-XXXX-XXXX',
                linkedin: 'linkedin.com/company/idfc-first-bank'
              },
              {
                name: 'Head—Digital Lending',
                role: 'Digital Lending Leadership',
                email: 'digital@idfcfirstbank.com',
                phone: '+91-22-XXXX-XXXX',
                linkedin: 'linkedin.com/company/idfc-first-bank'
              },
              {
                name: 'Collections COO',
                role: 'Collections Operations',
                email: 'collections@idfcfirstbank.com',
                phone: '+91-22-XXXX-XXXX',
                linkedin: 'linkedin.com/company/idfc-first-bank'
              }
            ]
          },
          {
            name: 'Federal Bank',
            type: 'Private Bank',
            location: 'Kochi/Mumbai',
            dealSize: 'Program issuer for targeted segments (salaried/prime, South-led footprint)',
            strategicRationale: 'Partnership-friendly; strong co-brand history; disciplined risk posture',
            contacts: [
              {
                name: 'Head—Consumer Banking',
                role: 'Consumer Banking Leadership',
                email: 'consumer@federalbank.co.in',
                phone: '+91-484-XXXX-XXXX',
                linkedin: 'linkedin.com/company/federal-bank'
              },
              {
                name: 'Head—Fintech Partnerships',
                role: 'Fintech Partnership Development',
                email: 'fintech@federalbank.co.in',
                phone: '+91-484-XXXX-XXXX',
                linkedin: 'linkedin.com/company/federal-bank'
              },
              {
                name: 'Head—Risk',
                role: 'Risk Management',
                email: 'risk@federalbank.co.in',
                phone: '+91-484-XXXX-XXXX',
                linkedin: 'linkedin.com/company/federal-bank'
              }
            ]
          },
          {
            name: 'AU Small Finance Bank',
            type: 'SFB',
            location: 'Jaipur/Mumbai',
            dealSize: 'CL-UPI issuance in tier-2/3 focus; phased expansion',
            strategicRationale: 'Rapidly scaling retail franchise; appetite for innovative credit formats',
            contacts: [
              {
                name: 'Head—Retail Lending',
                role: 'Retail Lending Leadership',
                email: 'retail@aubank.in',
                phone: '+91-141-XXXX-XXXX',
                linkedin: 'linkedin.com/company/au-small-finance-bank'
              },
              {
                name: 'Head—Cards/Payments',
                role: 'Cards & Payments Leadership',
                email: 'cards@aubank.in',
                phone: '+91-141-XXXX-XXXX',
                linkedin: 'linkedin.com/company/au-small-finance-bank'
              },
              {
                name: 'Head—Collections',
                role: 'Collections Management',
                email: 'collections@aubank.in',
                phone: '+91-141-XXXX-XXXX',
                linkedin: 'linkedin.com/company/au-small-finance-bank'
              }
            ]
          }
        ]
      },
      {
        id: 2,
        title: 'Merchant & Acquirer Distribution (BNPL/Pay-Later on UPI)',
        description: 'Acquirers/gateways & large QR networks to embed Pay-Later at checkout (QR + intent). Pilot: 5–10k merchant checkouts across 2–3 high-AOV categories (electronics, travel, education). Strategic rationale: Near-zero CAC via merchant pipes; boosts conversion and average ticket where POS credit is absent. Ideal: 2 distribution anchors with category pilots and national scale option. Structure: Commercial distribution (rev-share/fees; no equity required).',
        potentialValue: 'Revenue-share model',
        targets: [
          {
            name: 'PhonePe',
            type: 'UPI PSP & Merchant QR',
            location: 'Bengaluru',
            dealSize: 'Checkout embed on UPI intent/QR + co-marketing in high-AOV categories',
            strategicRationale: 'Massive consumer + MSME reach; strong QR density for rapid activation',
            contacts: [
              {
                name: 'Head—Credit Products',
                role: 'Credit Products Leadership',
                email: 'credit@phonepe.com',
                phone: '+91-80-XXXX-XXXX',
                linkedin: 'linkedin.com/company/phonepe'
              },
              {
                name: 'Head—Merchant Acquiring',
                role: 'Merchant Acquiring Leadership',
                email: 'merchants@phonepe.com',
                phone: '+91-80-XXXX-XXXX',
                linkedin: 'linkedin.com/company/phonepe'
              },
              {
                name: 'Partnerships Lead',
                role: 'Strategic Partnerships',
                email: 'partnerships@phonepe.com',
                phone: '+91-80-XXXX-XXXX',
                linkedin: 'linkedin.com/company/phonepe'
              }
            ]
          },
          {
            name: 'Paytm',
            type: 'UPI PSP & MSME QR',
            location: 'Noida',
            dealSize: 'QR-first Pay-Later placement + collections rail alignment',
            strategicRationale: 'Deep MSME network; proven wallet/UPI funnels; robust merchant tooling',
            contacts: [
              {
                name: 'Head—Credit/BNPL',
                role: 'Credit & BNPL Leadership',
                email: 'credit@paytm.com',
                phone: '+91-120-XXXX-XXXX',
                linkedin: 'linkedin.com/company/paytm'
              },
              {
                name: 'Head—Offline Merchants',
                role: 'Offline Merchant Network',
                email: 'merchants@paytm.com',
                phone: '+91-120-XXXX-XXXX',
                linkedin: 'linkedin.com/company/paytm'
              },
              {
                name: 'Risk Ops',
                role: 'Risk Operations',
                email: 'risk@paytm.com',
                phone: '+91-120-XXXX-XXXX',
                linkedin: 'linkedin.com/company/paytm'
              }
            ]
          },
          {
            name: 'Razorpay',
            type: 'Payment Gateway/Acquirer',
            location: 'Bengaluru',
            dealSize: 'Pay-Later button for online checkout + split settlement SOPs',
            strategicRationale: 'Leading e-commerce gateway; data-rich categories ideal for installments',
            contacts: [
              {
                name: 'Head—Checkout',
                role: 'Checkout Products',
                email: 'checkout@razorpay.com',
                phone: '+91-80-XXXX-XXXX',
                linkedin: 'linkedin.com/company/razorpay'
              },
              {
                name: 'Head—Credit Partnerships',
                role: 'Credit Partnership Development',
                email: 'credit@razorpay.com',
                phone: '+91-80-XXXX-XXXX',
                linkedin: 'linkedin.com/company/razorpay'
              },
              {
                name: 'Enterprise Sales',
                role: 'Enterprise Sales Leadership',
                email: 'enterprise@razorpay.com',
                phone: '+91-80-XXXX-XXXX',
                linkedin: 'linkedin.com/company/razorpay'
              }
            ]
          },
          {
            name: 'Pine Labs',
            type: 'Merchant Network & Commerce Cloud',
            location: 'Noida',
            dealSize: 'QR/POS hybrid Pay-Later in big-ticket retail',
            strategicRationale: 'Strong retail relationships; EMI heritage + modern QR reach',
            contacts: [
              {
                name: 'Head—Consumer Credit',
                role: 'Consumer Credit Leadership',
                email: 'credit@pinelabs.com',
                phone: '+91-120-XXXX-XXXX',
                linkedin: 'linkedin.com/company/pine-labs'
              },
              {
                name: 'Network Partnerships',
                role: 'Network Partnership Development',
                email: 'partnerships@pinelabs.com',
                phone: '+91-120-XXXX-XXXX',
                linkedin: 'linkedin.com/company/pine-labs'
              },
              {
                name: 'Category Heads',
                role: 'Category Management',
                email: 'category@pinelabs.com',
                phone: '+91-120-XXXX-XXXX',
                linkedin: 'linkedin.com/company/pine-labs'
              }
            ]
          },
          {
            name: 'BharatPe',
            type: 'MSME QR Acquirer',
            location: 'New Delhi',
            dealSize: 'Merchant funnel for micro-ticket installments & working-capital aligned flows',
            strategicRationale: 'Wide SME footprint; opportunity to prove credit on QR beyond POS corridors',
            contacts: [
              {
                name: 'Head—Credit',
                role: 'Credit Products',
                email: 'credit@bharatpe.com',
                phone: '+91-11-XXXX-XXXX',
                linkedin: 'linkedin.com/company/bharatpe'
              },
              {
                name: 'Head—Merchant Growth',
                role: 'Merchant Growth & Expansion',
                email: 'growth@bharatpe.com',
                phone: '+91-11-XXXX-XXXX',
                linkedin: 'linkedin.com/company/bharatpe'
              },
              {
                name: 'Partner Success',
                role: 'Partner Success Management',
                email: 'partners@bharatpe.com',
                phone: '+91-11-XXXX-XXXX',
                linkedin: 'linkedin.com/company/bharatpe'
              }
            ]
          }
        ]
      },
      {
        id: 3,
        title: 'Deposit & Protection Cross-Sell (Trust + Liability Engine)',
        description: 'Bank + insurance/invest partners to increase attach on prime cohorts. Pilot: Targeted cohorts from CL-UPI/checkout pilots; in-app offers with AutoPay mandates. Strategic rationale: Lowers blended CAC; improves approval via bank telemetry; adds fee income with minimal balance-sheet risk. Ideal: 1 bank (deeper attach) + 2 insurance + 1 investing partner. Structure: Embedded distribution (referral/commission; no equity required).',
        potentialValue: 'Referral/commission model',
        targets: [
          {
            name: 'Equitas Small Finance Bank (existing partner)',
            type: 'SFB',
            location: 'Chennai',
            dealSize: 'Deeper attach—salary-tagged accounts, AutoPay mandates, collections workflows',
            strategicRationale: 'Existing savings rail → higher trust & better repayments; clean compliance story',
            contacts: [
              {
                name: 'Head—Liabilities',
                role: 'Liabilities Management',
                email: 'liabilities@equitasbank.com',
                phone: '+91-44-XXXX-XXXX',
                linkedin: 'linkedin.com/company/equitas-small-finance-bank'
              },
              {
                name: 'Head—Digital Partnerships',
                role: 'Digital Partnership Development',
                email: 'partnerships@equitasbank.com',
                phone: '+91-44-XXXX-XXXX',
                linkedin: 'linkedin.com/company/equitas-small-finance-bank'
              },
              {
                name: 'Collections Ops',
                role: 'Collections Operations',
                email: 'collections@equitasbank.com',
                phone: '+91-44-XXXX-XXXX',
                linkedin: 'linkedin.com/company/equitas-small-finance-bank'
              }
            ]
          },
          {
            name: 'ICICI Lombard',
            type: 'General Insurance',
            location: 'Mumbai',
            dealSize: 'Sachet covers (accident/health/device) embedded in credit cohorts',
            strategicRationale: 'GI scale + product breadth; strong ops for micro-covers',
            contacts: [
              {
                name: 'Head—Digital Bancassurance',
                role: 'Digital Bancassurance Leadership',
                email: 'bancassurance@icicilombard.com',
                phone: '+91-22-XXXX-XXXX',
                linkedin: 'linkedin.com/company/icici-lombard'
              },
              {
                name: 'Product Head—Retail GI',
                role: 'Retail GI Product Management',
                email: 'retail@icicilombard.com',
                phone: '+91-22-XXXX-XXXX',
                linkedin: 'linkedin.com/company/icici-lombard'
              },
              {
                name: 'Partnerships',
                role: 'Strategic Partnerships',
                email: 'partnerships@icicilombard.com',
                phone: '+91-22-XXXX-XXXX',
                linkedin: 'linkedin.com/company/icici-lombard'
              }
            ]
          },
          {
            name: 'HDFC ERGO',
            type: 'General Insurance',
            location: 'Mumbai',
            dealSize: 'Micro-insurance overlays on Pay-Later line items and categories',
            strategicRationale: 'Deep category expertise; robust digital servicing',
            contacts: [
              {
                name: 'Head—Alliances',
                role: 'Alliance Management',
                email: 'alliances@hdfcergo.com',
                phone: '+91-22-XXXX-XXXX',
                linkedin: 'linkedin.com/company/hdfc-ergo'
              },
              {
                name: 'Head—Embedded Insurance',
                role: 'Embedded Insurance Leadership',
                email: 'embedded@hdfcergo.com',
                phone: '+91-22-XXXX-XXXX',
                linkedin: 'linkedin.com/company/hdfc-ergo'
              },
              {
                name: 'Claims Ops',
                role: 'Claims Operations',
                email: 'claims@hdfcergo.com',
                phone: '+91-22-XXXX-XXXX',
                linkedin: 'linkedin.com/company/hdfc-ergo'
              }
            ]
          },
          {
            name: 'ACKO',
            type: 'Digital-first GI',
            location: 'Bengaluru',
            dealSize: 'In-app embedded device/travel covers; instant policy issuance',
            strategicRationale: 'Seamless APIs; fast claims UX suited for app-native flows',
            contacts: [
              {
                name: 'Head—Embedded',
                role: 'Embedded Insurance Products',
                email: 'embedded@acko.com',
                phone: '+91-80-XXXX-XXXX',
                linkedin: 'linkedin.com/company/acko'
              },
              {
                name: 'Tech Partnerships',
                role: 'Technology Partnership Development',
                email: 'tech@acko.com',
                phone: '+91-80-XXXX-XXXX',
                linkedin: 'linkedin.com/company/acko'
              },
              {
                name: 'Category PMs',
                role: 'Product Management',
                email: 'product@acko.com',
                phone: '+91-80-XXXX-XXXX',
                linkedin: 'linkedin.com/company/acko'
              }
            ]
          },
          {
            name: 'Groww / Upstox',
            type: 'Retail Investing',
            location: 'Bengaluru / Mumbai',
            dealSize: 'Micro-SIP/"round-up invest" nudges for prime credit users',
            strategicRationale: 'Simple, low-friction wealth on-ramp; boosts engagement & ARPU',
            contacts: [
              {
                name: 'Head—Partnerships',
                role: 'Partnership Development',
                email: 'partnerships@groww.in',
                phone: '+91-80-XXXX-XXXX',
                linkedin: 'linkedin.com/company/groww'
              },
              {
                name: 'Product—Invest',
                role: 'Investment Products',
                email: 'invest@groww.in',
                phone: '+91-80-XXXX-XXXX',
                linkedin: 'linkedin.com/company/groww'
              },
              {
                name: 'Compliance',
                role: 'Compliance & Regulatory',
                email: 'compliance@groww.in',
                phone: '+91-80-XXXX-XXXX',
                linkedin: 'linkedin.com/company/groww'
              }
            ]
          }
        ]
      }
    ]
  };

  // MediSys Edutech-specific data - Strategic Value-Creation Pack (Medical & Allied Health EdTech)
  const mediSysData = {
    executiveSummary: {
      highlights: [
        'Institution-first, learner-everywhere: MediSys supplies curriculum packages + platforms to colleges and complements that with DocTutorials for continuous, exam-aligned learning',
        'Asset-light scale: grow via content licensing to universities/hospitals and subscriptions to students—leveraging existing brands/apps rather than cap-ex heavy delivery',
        'MegaDelta value plan: concentrate on (1) university pipelines, (2) exam-prep depth and retention, (3) hospital CME/skills productivity—while tightening governance on content QA and learning analytics'
      ]
    },

    industry: {
      overview: 'MediSys Edutech — Strategic Value-Creation Pack (Medical & Allied Health EdTech)',
      marketSize: 'India Medical & Allied Health Education',
      growthDrivers: []
    },

    revenueScenarios: [],
    moicIrrTable: { headers: [], rows: [] },
    competition: [],
    customerSegments: [],
    productsServices: [],
    valueCreationTheses: [
      {
        id: 1,
        title: 'University Systems (CBME-Aligned Licensing)',
        description: 'Target state/private medical universities and their affiliated colleges to license CBME-mapped core modules + OSCE/OSPE toolkits.',
        potentialValue: 'Institutional license',
        targets: [
          {
            name: 'Rajiv Gandhi University of Health Sciences (RGUHS), Karnataka',
            type: 'State Medical University',
            location: 'Bengaluru',
            dealSize: 'Institutional license',
            strategicRationale: 'CBME core + OSCE kits for MBBS Year 1–2; nursing/allied packs in phase 2. Large affiliated network → fast scale via circular adoption',
            contacts: [
              {
                name: 'Vice-Chancellor',
                role: 'Vice-Chancellor',
                email: 'vc@rguhs.edu.in',
                phone: '+91 80 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              },
              {
                name: 'Registrar',
                role: 'Registrar',
                email: 'registrar@rguhs.edu.in',
                phone: '+91 80 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              },
              {
                name: 'Dean Academics',
                role: 'Dean Academics',
                email: 'dean@rguhs.edu.in',
                phone: '+91 80 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              }
            ]
          },
          {
            name: 'Maharashtra University of Health Sciences (MUHS)',
            type: 'State Medical University',
            location: 'Nashik',
            dealSize: 'Institutional license',
            strategicRationale: 'MBBS core subjects + assessment bank & analytics for affiliated colleges. High seat count; strong template for state-wide replication',
            contacts: [
              {
                name: 'Pro-VC',
                role: 'Pro-Vice Chancellor',
                email: 'provc@muhs.edu.in',
                phone: '+91 253 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              },
              {
                name: 'Controller of Examinations',
                role: 'Controller of Examinations',
                email: 'coe@muhs.edu.in',
                phone: '+91 253 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              },
              {
                name: 'Dean—Faculty of Medicine',
                role: 'Dean—Faculty of Medicine',
                email: 'deanmed@muhs.edu.in',
                phone: '+91 253 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              }
            ]
          },
          {
            name: 'The Tamil Nadu Dr. MGR Medical University',
            type: 'State Medical University',
            location: 'Chennai',
            dealSize: 'Institutional license',
            strategicRationale: 'CBME modules + OSCE/OSPE toolkits; phased roll-out by specialty. Dense college cluster; operational champions available',
            contacts: [
              {
                name: 'Registrar',
                role: 'Registrar',
                email: 'registrar@tnmgrmu.edu.in',
                phone: '+91 44 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              },
              {
                name: 'Additional Controller—Academic',
                role: 'Additional Controller—Academic',
                email: 'academic@tnmgrmu.edu.in',
                phone: '+91 44 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              },
              {
                name: 'HoDs',
                role: 'Heads of Departments',
                email: 'hods@tnmgrmu.edu.in',
                phone: '+91 44 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              }
            ]
          },
          {
            name: 'Manipal Academy of Higher Education (MAHE)',
            type: 'Deemed University',
            location: 'Manipal/Mangalore',
            dealSize: 'Institutional license',
            strategicRationale: 'Premium content license + joint academic innovation (simulation/OSCE). Flagship private brand; lighthouse for private segment',
            contacts: [
              {
                name: 'Dean—KMC',
                role: 'Dean—KMC',
                email: 'dean@kmc.manipal.edu',
                phone: '+91 820 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              },
              {
                name: 'Director—Digital Learning',
                role: 'Director—Digital Learning',
                email: 'digital@manipal.edu',
                phone: '+91 820 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              },
              {
                name: 'Program Chairs',
                role: 'Program Chairs',
                email: 'programs@manipal.edu',
                phone: '+91 820 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              }
            ]
          },
          {
            name: 'Amrita Vishwa Vidyapeetham (Health Sciences Campus)',
            type: 'Deemed University',
            location: 'Kochi/Coimbatore',
            dealSize: 'Institutional license',
            strategicRationale: 'MBBS/Nursing/Allied packs with competency dashboards. Multi-discipline health sciences footprint → cross-sell breadth',
            contacts: [
              {
                name: 'Principal—Medical College',
                role: 'Principal—Medical College',
                email: 'principal@aims.amrita.edu',
                phone: '+91 484 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              },
              {
                name: 'Dean—Nursing/Allied Health',
                role: 'Dean—Nursing/Allied Health',
                email: 'nursing@amrita.edu',
                phone: '+91 484 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              },
              {
                name: 'IT/EdTech Lead',
                role: 'IT/EdTech Lead',
                email: 'edtech@amrita.edu',
                phone: '+91 484 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              }
            ]
          }
        ]
      },
      {
        id: 2,
        title: 'Hospital Groups & Networks (CME/CPD & Workforce Upskilling)',
        description: 'Target integrated hospital chains for CME credit packs, onboarding, nursing skills refresh and compliance dashboards.',
        potentialValue: 'Enterprise CME',
        targets: [
          {
            name: 'Apollo Hospitals',
            type: 'Multispecialty Chain',
            location: 'Pan-India',
            dealSize: 'Enterprise CME',
            strategicRationale: 'CME pathways (medicine/surgery/nursing) + onboarding modules. Largest private footprint; strong brand signal for others',
            contacts: [
              {
                name: 'Group Medical Education',
                role: 'Group Medical Education',
                email: 'education@apollohospitals.com',
                phone: '+91 44 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              },
              {
                name: 'CNO',
                role: 'Chief Nursing Officer',
                email: 'cno@apollohospitals.com',
                phone: '+91 44 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              },
              {
                name: 'L&D/HR Ops',
                role: 'L&D/HR Operations',
                email: 'hr@apollohospitals.com',
                phone: '+91 44 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              }
            ]
          },
          {
            name: 'Fortis Healthcare (IHH Group)',
            type: 'Multispecialty Chain',
            location: 'NCR & Key Metros',
            dealSize: 'Enterprise CME',
            strategicRationale: 'CME + OSCE-style skills validation; nursing refreshers. Clinical governance culture; scalable SOP alignment',
            contacts: [
              {
                name: 'Group Clinical Education',
                role: 'Group Clinical Education',
                email: 'education@fortishealthcare.com',
                phone: '+91 11 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              },
              {
                name: 'Nursing Education Head',
                role: 'Nursing Education Head',
                email: 'nursing@fortishealthcare.com',
                phone: '+91 11 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              },
              {
                name: 'HR—L&D',
                role: 'HR—L&D',
                email: 'lnd@fortishealthcare.com',
                phone: '+91 11 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              }
            ]
          },
          {
            name: 'Max Healthcare',
            type: 'Multispecialty Chain',
            location: 'North/West India',
            dealSize: 'Enterprise CME',
            strategicRationale: 'Department-wise CME packs + compliance dashboards. Outcome-focused leadership; rapid multi-site replication',
            contacts: [
              {
                name: 'Medical Education',
                role: 'Medical Education',
                email: 'mededucation@maxhealthcare.com',
                phone: '+91 11 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              },
              {
                name: 'Quality & Accreditation',
                role: 'Quality & Accreditation',
                email: 'quality@maxhealthcare.com',
                phone: '+91 11 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              },
              {
                name: 'HR—Capability',
                role: 'HR—Capability',
                email: 'capability@maxhealthcare.com',
                phone: '+91 11 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              }
            ]
          },
          {
            name: 'Narayana Health',
            type: 'Cardiac & Multispecialty',
            location: 'Pan-India',
            dealSize: 'Enterprise CME',
            strategicRationale: 'Specialty-specific CME (cardio, onco) + nursing ICU skills bundles. High-acuity pathways → strong proof of competency uplift',
            contacts: [
              {
                name: 'Academic Affairs',
                role: 'Academic Affairs',
                email: 'academics@narayanahealth.org',
                phone: '+91 80 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              },
              {
                name: 'Nursing Education',
                role: 'Nursing Education',
                email: 'nursing@narayanahealth.org',
                phone: '+91 80 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              },
              {
                name: 'Clinical Ops',
                role: 'Clinical Operations',
                email: 'clinicalops@narayanahealth.org',
                phone: '+91 80 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              }
            ]
          },
          {
            name: 'Aster DM Healthcare',
            type: 'Multinational Chain',
            location: 'India & GCC',
            dealSize: 'Enterprise CME',
            strategicRationale: 'India pilot + GCC extension (nursing/allied compliance). Cross-border footprint → future GCC expansion option',
            contacts: [
              {
                name: 'Group Medical Education',
                role: 'Group Medical Education',
                email: 'education@asterdm.com',
                phone: '+91 484 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              },
              {
                name: 'Nursing Leadership',
                role: 'Nursing Leadership',
                email: 'nursing@asterdm.com',
                phone: '+91 484 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              },
              {
                name: 'Digital Learning',
                role: 'Digital Learning',
                email: 'digital@asterdm.com',
                phone: '+91 484 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              }
            ]
          }
        ]
      },
      {
        id: 3,
        title: 'Student Acquisition & Channels (Low-CAC Growth)',
        description: 'Target digital and ecosystem partners to bundle student access and amplify reach for MBBS, nursing & allied cohorts.',
        potentialValue: 'Commercial bundle',
        targets: [
          {
            name: 'Jio Platforms',
            type: 'Telco/Apps Ecosystem',
            location: 'Pan-India',
            dealSize: 'Commercial bundle',
            strategicRationale: 'Education bundle (zero-rated/discounted access) for verified med students. Massive student reach; affordable data plans boost engagement',
            contacts: [
              {
                name: 'Partnerships—Education',
                role: 'Partnerships—Education',
                email: 'education@jio.com',
                phone: '+91 22 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              },
              {
                name: 'App Ecosystem',
                role: 'App Ecosystem',
                email: 'apps@jio.com',
                phone: '+91 22 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              },
              {
                name: 'Campus Programs',
                role: 'Campus Programs',
                email: 'campus@jio.com',
                phone: '+91 22 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              }
            ]
          },
          {
            name: 'Airtel (Airtel Thanks / Xstream)',
            type: 'Telco/Content',
            location: 'Pan-India',
            dealSize: 'Commercial bundle',
            strategicRationale: 'Co-branded pack during exam seasons (NEET PG/FMGE windows). Content distribution rails; conversion via targeted cohorts',
            contacts: [
              {
                name: 'Partnerships',
                role: 'Partnerships',
                email: 'partnerships@airtel.com',
                phone: '+91 11 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              },
              {
                name: 'Content/Alliances',
                role: 'Content/Alliances',
                email: 'content@airtel.com',
                phone: '+91 11 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              },
              {
                name: 'B2C Growth',
                role: 'B2C Growth',
                email: 'growth@airtel.com',
                phone: '+91 11 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              }
            ]
          },
          {
            name: 'Samsung (Galaxy Store / Student Program)',
            type: 'Device OEM',
            location: 'Pan-India',
            dealSize: 'Commercial bundle',
            strategicRationale: 'Device-linked academic offer; pre-installed access link/education hub. High med-student Android share; frictionless onboarding',
            contacts: [
              {
                name: 'Enterprise Partnerships',
                role: 'Enterprise Partnerships',
                email: 'partnerships@samsung.com',
                phone: '+91 124 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              },
              {
                name: 'Galaxy Store',
                role: 'Galaxy Store',
                email: 'galaxystore@samsung.com',
                phone: '+91 124 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              },
              {
                name: 'Education Programs',
                role: 'Education Programs',
                email: 'education@samsung.com',
                phone: '+91 124 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              }
            ]
          },
          {
            name: 'Xiaomi (GetApps / Campus)',
            type: 'Device OEM/App Store',
            location: 'Pan-India',
            dealSize: 'Commercial bundle',
            strategicRationale: 'Student referral campaigns + featured placement in education vertical. Wide device footprint in Tier-2/3 campuses',
            contacts: [
              {
                name: 'Content Partnerships',
                role: 'Content Partnerships',
                email: 'partnerships@xiaomi.com',
                phone: '+91 80 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              },
              {
                name: 'GetApps',
                role: 'GetApps',
                email: 'getapps@xiaomi.com',
                phone: '+91 80 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              },
              {
                name: 'Campus Marketing',
                role: 'Campus Marketing',
                email: 'campus@xiaomi.com',
                phone: '+91 80 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              }
            ]
          },
          {
            name: 'CollegeDekho',
            type: 'Student Discovery Platform',
            location: 'Pan-India',
            dealSize: 'Commercial bundle',
            strategicRationale: 'Verified medical-track funnels (MBBS/PG) with scholarship-style promos. High-intent audiences around admissions/exam cycles',
            contacts: [
              {
                name: 'Head—Alliances',
                role: 'Head—Alliances',
                email: 'alliances@collegedekho.com',
                phone: '+91 11 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              },
              {
                name: 'Category Lead—Medical',
                role: 'Category Lead—Medical',
                email: 'medical@collegedekho.com',
                phone: '+91 11 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              },
              {
                name: 'Growth Ops',
                role: 'Growth Operations',
                email: 'growth@collegedekho.com',
                phone: '+91 11 XXXX XXXX',
                linkedin: 'linkedin.com/in/placeholder'
              }
            ]
          }
        ]
      }
    ]
  };

  // Select data based on company name
  const mockData = company.name === 'GOQii' ? goqiiData :
                    company.name === 'FirstCry' ? firstCryData :
                    company.name === 'Freo' ? freoData :
                    company.name === 'MediSys Edutech' ? mediSysData :
                    defaultGenericData;

  const [selectedThesisId, setSelectedThesisId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'analysis' | 'targets'>('analysis');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<PotentialTarget | null>(null);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const { addWorkflow } = useWorkflow();
  const selectedThesis = mockData.valueCreationTheses.find(t => t.id === selectedThesisId);

  const handleEmailClick = (
    contact: ContactInfo,
    target: PotentialTarget,
    thesis: ValueCreationThesis
  ) => {
    // Create workflow
    addWorkflow({
      name: `Outreach: ${contact.name} at ${target.name}`,
      description: `Strategic outreach for ${company.name} - ${thesis.title}`,
      status: 'active',
      owner: 'Investment Team',
      companyName: company.name,
      targetName: target.name,
      contactName: contact.name,
      contactEmail: contact.email,
      thesisTitle: thesis.title
    });

    // Show toast
    setToastMessage(`Contact: ${contact.name} at ${target.name}`);
    setShowToast(true);
  };

  const handleTargetClick = (target: PotentialTarget) => {
    setSelectedTarget(target);
    setShowTargetModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/20 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-400" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{company.name}</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Value Creation Thesis */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2 mb-2">
              <Briefcase className="w-6 h-6 text-blue-400" />
              <span>Value Creation Thesis</span>
            </h2>
            <p className="text-slate-400">Strategic M&A opportunities to maximize portfolio company value</p>
          </div>

          {/* Tab Buttons - Show for GOQii, Freo, and MediSys Edutech */}
          {(company.name === 'GOQii' || company.name === 'Freo' || company.name === 'MediSys Edutech') && (
            <div className="flex space-x-2 mb-6 border-b border-slate-700/20">
              <button
                onClick={() => setActiveTab('analysis')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'analysis'
                    ? 'text-blue-400 border-b-2 border-blue-500/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Analysis
              </button>
              <button
                onClick={() => setActiveTab('targets')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'targets'
                    ? 'text-blue-400 border-b-2 border-blue-500/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Opportunities
              </button>
            </div>
          )}

          {/* Analysis Tab - Only for GOQii */}
          {company.name === 'GOQii' && activeTab === 'analysis' && (
            <Card>
              <CardContent className="prose prose-invert max-w-none p-8">
                <h1 className="text-3xl font-bold text-white mb-2">GOQii Strategic Outreach Pack — GCC & SEA</h1>
                <h2 className="text-xl font-semibold text-blue-400 mb-6">$20–30M Strategic Syndicate Round (50–70% Secondary + 30–50% Growth)</h2>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Key takeaways</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>GOQii is raising a $20–30M strategic syndicate to regionalize a proven, engagement-first preventive-health platform across GCC & SEA while maintaining EBITDA discipline.</li>
                  <li>Distribution will lean on insurers, sovereign ecosystems, large employers, and super-app partners to lower CAC and expand LTV with Vitality-style incentives and API-based risk scoring.</li>
                  <li>Business mix targets by FY27P: Subscriptions (45%), B2B Corporate Wellness (30%), Diagnostics/Telehealth (15%), Devices (10%); revenue $8.5M FY24A → $40.0M FY27P with margin expansion to EBITDA +15%.</li>
                  <li>Expansion playbook focuses first on UAE, KSA, and Singapore with named anchor prospects (M42/PureHealth, Tawuniya/Bupa Arabia, AIA/Prudential) and clear 90-day pilot roadmaps.</li>
                  <li>A detailed syndication matrix and one-pager angles are provided for CVCs/sovereigns (Temasek, Mubadala, ADQ, etc.), global insurers (AIA, AXA, Allianz, Prudential, Bupa), providers (IHH), and channels (Grab/Good Doctor).</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Executive Summary</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Anchor preventive-health leadership with an engagement-first model (behavior + data + action).</li>
                  <li>Leverage insurer and sovereign distribution in GCC & SEA to reduce CAC and increase LTV.</li>
                  <li>Use strategic capital to regionalize the platform, while maintaining EBITDA discipline.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Investment highlights (1/2)</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Large addressable market: $100B+ health engagement across GCC & SEA.</li>
                  <li>Unique engagement layer connecting sensors, coaching, and AI insights.</li>
                  <li>Retention & monetization: &gt;80% 12-month retention; expanding subscription mix.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Investment highlights (2/2)</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Validated India model; ready to replicate in similar demographics and payor systems.</li>
                  <li>Strategic participation window for CVCs/sovereigns aligned to digital health and ESG outcomes.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Round overview & use of proceeds</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Round size: $20–30M; structure: 50–70% secondary + 30–50% primary growth.</li>
                  <li>Use of proceeds: GCC/SEA expansion, AI coaching automation, localization, regulatory, and B2B pilots.</li>
                  <li>Target close: Q2 FY26 with 1–2 co-leads and 2–4 strategic co-investors.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">GCC & SEA market thesis</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Policy shift toward prevention amid chronic disease burdens and employer wellness demand.</li>
                  <li>High smartphone penetration, insurer digitization, and wellness incentives (Vitality-style).</li>
                  <li>Openness to metaverse/gamified health engagement aligned with Animoca's ecosystem.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Problem (payors, providers, employers)</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Rising claims costs from chronic diseases; poor sustained engagement.</li>
                  <li>Fragmented data across devices, apps, providers; limited behavioral adherence.</li>
                  <li>Need measurable outcomes to justify wellness benefits and ESG reporting.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">GOQii solution — The engagement infrastructure</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Daily habit change: wearables + human coaches + AI nudges.</li>
                  <li>HealthOS: APIs for insurers/providers to pull risk scores and engagement metrics.</li>
                  <li>Ecosystem: diagnostics, teleconsults, pharmacy tie-ins; configurable rewards.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Product stack</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Devices: watches/bands (SpO₂, HR, sleep) for data capture.</li>
                  <li>App: Health Locker, risk scoring, challenges, rewards; enterprise admin.</li>
                  <li>Coaching: human + AI hybrid for outcomes; localized languages and cohorts.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Business model & mix (FY27P)</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Subscriptions (45%): recurring wellness + coaching.</li>
                  <li>B2B Corporate Wellness (30%): employer/insurer programs and dashboards.</li>
                  <li>Diagnostics/Telehealth (15%): cross-sell from cohorts.</li>
                  <li>Devices (10%): acquisition driver; lower margin.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Traction & proof points</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Active users: 2.1M (FY24) → 6.5M (FY27P).</li>
                  <li>Cohort outcomes: improved activity adherence; early risk-detection pilot wins.</li>
                  <li>Enterprise pilots with measurable KPIs: engagement uplift and claims delta.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Financial overview (USD)</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Revenue: $8.5M (FY24A) → $40.0M (FY27P).</li>
                  <li>Gross margin: 49% → 55%; EBITDA: −12% → +15%.</li>
                  <li>CAC:LTV ~ 1:6 via insurer and employer distribution.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Revenue trajectory</h3>
                <p className="text-slate-300">FY24A–FY27P revenue growth (USD millions) illustrated (chart referenced in deck).</p>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Margin trajectory</h3>
                <p className="text-slate-300">Gross and EBITDA margin improvement through FY27P (chart referenced).</p>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Unit economics & cohorts</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Blended CAC trending down via B2B2C; LTV rising with subscriptions & diagnostics.</li>
                  <li>90-day habit programs lift adherence by 20–30%.</li>
                  <li>AI-assisted coaching reduces cost per engaged user by ~25%.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">GTM — Insurer & employer distribution</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>White-label wellness programs with risk-score APIs; Vitality-like incentives.</li>
                  <li>Corporate wellness challenges and dashboards; admin analytics for HR/benefits.</li>
                  <li>Co-marketing through bancassurance/telco partnerships in SEA.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Expansion playbook (UAE, KSA, SG first)</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>UAE: government-linked providers (M42/PureHealth); corporate free-zone employers.</li>
                  <li>KSA: insurers (Tawuniya/Bupa Arabia) for Vitality-style benefits; Arabic localization.</li>
                  <li>Singapore: AIA/Prudential pilots; EDBI/Temasek ecosystem integration.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Key risks & mitigation</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Engagement fatigue → gamification & coach rotation; A/B testing content.</li>
                  <li>Data privacy/regulatory → consent architecture; local data residency as required.</li>
                  <li>Coaching scalability → AI triage, optimized coach-to-user ratios, QA frameworks.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Governance & reporting upgrades</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Quarterly KPI pack: engagement, cohort outcomes, claims proxy metrics.</li>
                  <li>SOC2/ISO upgrades; medical advisory board for chronic care protocols.</li>
                  <li>Board cadence aligned to co-lead investors; audit-ready financials.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Syndication strategy (matrix)</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Leads: AIA Catalyst / Temasek / Mubadala.</li>
                  <li>Co-Invest: AXA / Prudential / ADQ.</li>
                  <li>Anchors: Bupa / Grab / Tawuniya — distribution + pilots.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">90-day outreach roadmap</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>M1: Warm intros; data-room access; pilot scoping.</li>
                  <li>M2: Pilot design (UAE + SG); regulatory confirmation; KPI baselines.</li>
                  <li>M3: TS negotiation; announce pilots; close syndicate (target Q2 FY26).</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Data room & pilot readiness</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Available: anonymized cohort metrics, engagement/retention dashboards, security docs.</li>
                  <li>Pilot menu: corporate wellness, chronic-prevention, post-discharge coaching.</li>
                  <li>Measurement: clear pre/post metrics; insurer claims proxy models.</li>
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Analysis Tab - Only for Freo */}
          {company.name === 'Freo' && activeTab === 'analysis' && (
            <Card>
              <CardContent className="prose prose-invert max-w-none p-8">
                <h1 className="text-3xl font-bold text-white mb-2">Freo — Strategic Value-Creation Pack (India, UPI-led Credit Scale-Up)</h1>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Key takeaways</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Credit on UPI is the unlock: pre-sanctioned credit lines usable on UPI (and RuPay-on-UPI) expand acceptance to any UPI QR, lifting activation and frequency.</li>
                  <li>Partner-first distribution: scale through issuer banks (credit-line issuance) and merchant acquirers/aggregators (checkout embed), keeping CAC low.</li>
                  <li>Asset-light posture: Freo orchestrates underwriting, lifecycle engagement, and collections with bank/NBFC partners as lender-of-record.</li>
                  <li>Trust & cross-sell: the partner-bank savings account is the trust anchor to cross-sell micro-insurance and small-ticket investments to prime cohorts.</li>
                  <li>Execution over invention: the 12-month plan focuses on integrations, pilots, and disciplined credit box—not new product bets.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Executive Summary</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Unify credit + payments + deposits: Freo makes revolving credit usable on UPI, meeting consumers where they already pay.</li>
                  <li>Distribution via partners, not marketing spend: issuers for pre-approved credit, acquirers for checkout access; Freo supplies the UX, risk ops, and collections rails.</li>
                  <li>EBITDA discipline: improve unit economics through higher utilization (UPI acceptance), lower CAC (partner pipes), and tighter collections (mandates/AutoPay).</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Investment highlights (1/2)</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Rail advantage: UPI ubiquity + credit enablement = step-function growth in acceptance versus POS-only credit.</li>
                  <li>Full-stack engagement: credit line, UPI, co-branded card, and deposits in one surface → higher daily/weekly touch.</li>
                  <li>Risk competence: thin-file underwriting + in-app repayment nudges + granular credit box management.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Investment highlights (2/2)</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Partnership DNA: existing bank partnerships reduce regulatory and balance-sheet risk.</li>
                  <li>Multiple monetization paths: interest share, interchange (RuPay/card), merchant fees (BNPL take rate), referral fees (insurance/invest), and deposit-led cross-sell.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">India market thesis (UPI era)</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Credit goes where UPI goes: credit lines and cards on UPI extend revolving credit to QR merchants nationwide.</li>
                  <li>Merchant push: acquirers and gateways are incentivized to enable Pay-Later/credit at checkout to boost conversion and baskets.</li>
                  <li>Category uplift: electronics, travel, education, and services show rising UPI ticket sizes—natural fits for installments/Pay-Later.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Problem (consumers, issuers, merchants)</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Consumers: easy payments, hard credit—limited acceptance, cumbersome onboarding, opaque fees.</li>
                  <li>Issuers: high CAC to activate lines/cards; under-utilized limits; collections friction outside EMI/POS contexts.</li>
                  <li>Merchants: conversion loss without credit at QR; integrations sprawl; settlement and returns complexity.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Freo solution — the CreditOS for UPI</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Make credit liquid on UPI: pre-sanctioned lines transact at any UPI QR; RuPay-on-UPI where applicable.</li>
                  <li>Lifecycle system: from offer → KYC → activation → in-app controls → nudges → repayment → reprice/upsell.</li>
                  <li>Partner architecture: issuer/NBFC as lender-of-record; acquirer/gateway at checkout; bank partner for deposits and mandates.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Product stack</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Credit-line (CL-UPI) & Pay-Later: pre-approved line with UPI utilization; configurable credit box per cohort.</li>
                  <li>UPI app layer: intent, QR, and in-app journey with offer surfacing and repayment shortcuts.</li>
                  <li>Co-branded card (existing program): complements UPI usage where cards are preferred.</li>
                  <li>Deposits (partner-bank): savings account for trust, mandates (AutoPay), and telemetry.</li>
                  <li>Collections & risk: rule-based reminders, micro-repay options, hardship protocols, and score drift monitors.</li>
                  <li>Partner APIs/SDKs: checkout embed, settlement/reconciliation, and dispute workflows.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Business model & monetization levers</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Interest income share from issuer/NBFC on utilized balances.</li>
                  <li>Interchange (RuPay-on-UPI and card transactions, where applicable).</li>
                  <li>Merchant fees / BNPL take rate via acquirer/gateway distribution.</li>
                  <li>Referral/commission on micro-insurance and invest products.</li>
                  <li>Operational efficiency: lower CAC via partner pipes; better utilization via UPI acceptance.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Traction & proof points (qualitative)</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>UPI + credit narrative live in product.</li>
                  <li>Bank partnerships live (savings + co-branded card lineage).</li>
                  <li>BNPL/Pay-Later flows present and extensible to acquirer networks.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Value-creation themes (3)</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Issuer-led scale (Credit-Line-on-UPI): sign 1–2 anchor issuers; ship CL-UPI with tight credit box and repayment mandates.</li>
                  <li>Merchant & acquirer distribution: embed Pay-Later at checkout with 2 acquirer/gateway partners; start with 2–3 high-AOV categories.</li>
                  <li>Deposit & protection cross-sell: deepen savings attach for prime cohorts; add sachet insurance/device/accident covers and micro-invest.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">GTM — partner motions</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Issuer motion: pre-approved base activation, co-branded credit line, agreed loss budget, and utilization targets.</li>
                  <li>Acquirer motion: checkout button/intent placement, category pilots, settlement/returns SOPs.</li>
                  <li>Owned channel motion: lifecycle campaigns (activation → utilization → repay → upsell) and in-app education.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Execution roadmap (12 months)</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>0–90 days: finalize one issuer SOW for CL-UPI; shortlist two acquirers; lock repayment/collections flows and sandbox integrations.</li>
                  <li>90–180 days: run pilots (50–100k users CL-UPI; 5–10k checkout Pay-Later); measure activation, utilization, losses, and collections KPIs.</li>
                  <li>6–12 months: add 2nd issuer; scale acquirer pilot nationwide; roll out deposit/insurance attach to prime cohorts.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Key risks & mitigation</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Policy/guardrails: adhere to issuer-of-record, permitted use cases, category exclusions, and consent mandates.</li>
                  <li>Collections/LGD: conservative initial limits, AutoPay mandates, micro-repay options, and early-warning scorecards.</li>
                  <li>Funding concentration: diversify issuer/NBFC partners and avoid single-counterparty dependence.</li>
                  <li>Tech scaling: partner-first SLAs, phased rollout, and observability for UPI/issuer/acquirer integrations.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Governance & reporting upgrades</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Credit policy & model governance (documentation, overrides, challenger models).</li>
                  <li>Compliance pack (KYC/AML, consent/notifications, partner contracts).</li>
                  <li>Operational dashboards (activation, utilization, DPD buckets, roll rates, cure rates, NPS).</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Partnership & capital options (optional)</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Strategic issuance agreement with an anchor issuer (no equity required).</li>
                  <li>Commercial distribution with a large acquirer/gateway (revenue-share).</li>
                  <li>Minority strategic (issuer or payments platform) if it accelerates integrations or unlocks volumes—keep rights narrow and milestone-based.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Pilot readiness (what's on the shelf)</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Offer & risk playbooks, credit box configs, and collections SOPs.</li>
                  <li>Partner API specs (checkout, settlement, disputes) and sandbox flows.</li>
                  <li>Measurement plan for pilots: activation, utilization per active, loss metrics, repayment behavior, NPS.</li>
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Analysis Tab - Only for MediSys Edutech */}
          {company.name === 'MediSys Edutech' && activeTab === 'analysis' && (
            <Card>
              <CardContent className="prose prose-invert max-w-none p-8">
                <h1 className="text-3xl font-bold text-white mb-2">MediSys Edutech — Strategic Value-Creation Pack (Medical & Allied Health EdTech)</h1>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Key takeaways</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>What MediSys does: builds curriculum-aligned, ICT-based teaching/learning products for medical and allied-health education, delivered to institutions and learners (B2B + B2C).</li>
                  <li>Dual surfaces: (i) institutional content/LMS packages for MBBS, BDS, Nursing & allied programs; (ii) a direct-to-student exam-prep surface via DocTutorials (MBBS curriculum, NEET PG/FMGE/INI CET/NEET SS).</li>
                  <li>MegaDelta fit: long-held portfolio company with a healthcare-education thesis; scope to compound via university deals, hospital upskilling/CME, and scaled B2C exam prep.</li>
                  <li>Where to lean in: standardize CBME-aligned modules for universities, deepen DocTutorials cohorts, and productize hospital workforce skilling (CME, OSCE/OSPE support).</li>
                  <li>Execution over invention: expand distribution and completion outcomes; don't reinvent content categories that already resonate.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Executive Summary</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Institution-first, learner-everywhere: MediSys supplies curriculum packages + platforms to colleges and complements that with DocTutorials for continuous, exam-aligned learning.</li>
                  <li>Asset-light scale: grow via content licensing to universities/hospitals and subscriptions to students—leveraging existing brands/apps rather than cap-ex heavy delivery.</li>
                  <li>MegaDelta value plan: concentrate on (1) university pipelines, (2) exam-prep depth and retention, (3) hospital CME/skills productivity—while tightening governance on content QA and learning analytics.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Investment highlights (1/2)</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Curriculum backbone: competency-based, peer-reviewed packages across medical, dental, nursing & allied health—built to "drop-in" for institutions.</li>
                  <li>Proven B2C surface: DocTutorials brand covers MBBS curriculum through post-grad/super-specialty entrance tracks with live sessions, revisions and app distribution.</li>
                  <li>Digitally native distribution: Android/iOS presence lowers time-to-market and supports hybrid learning.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Investment highlights (2/2)</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Defensible content library: specialty depth + faculty-led pedagogy are harder to replicate than generic edtech.</li>
                  <li>Multiple monetization paths: institutional licenses, student subs, CME/CPD modules, and potential third-party distribution (telecoms, OEM app stores).</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">India market thesis (medical & allied education)</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Persistent faculty/resource gaps and expanding seat counts make standardized digital content valuable to universities.</li>
                  <li>Exam-prep remains counter-cyclical and sticky; medical tracks (MBBS→PG→SS) support long LTV via staged offerings.</li>
                  <li>CBME adoption and OSCE/OSPE-style assessments create demand for competency-oriented modules and checklists.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Problem (universities, learners, hospitals)</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Universities: uneven faculty bandwidth; inconsistent content quality; compliance with competency frameworks is operationally heavy.</li>
                  <li>Learners: fragmented resources across MBBS and PG/SS entrance tracks; limited structured feedback.</li>
                  <li>Hospitals: CME/skills refresh and onboarding are ad-hoc; poor completion visibility.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">MediSys solution — the LearningOS for healthcare education</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Institutional packages: curriculum-based, peer-reviewed modules; rapid deployment; outcomes tracking for admins.</li>
                  <li>Learner app (DocTutorials): live classes, quick-revision programs, exam-oriented question banks and mentoring across MBBS → NEET PG/FMGE/INI CET/NEET SS.</li>
                  <li>Services & admin: course operations, proctoring support, analytics and reporting for compliance.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Product stack</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Content library: MBBS/BDS/Nursing/Allied modules mapped to competencies; revision programs for PG/SS exams.</li>
                  <li>Platforms: web + Android/iOS apps (distribution for B2C; portals for B2B).</li>
                  <li>Faculty & QA: specialist-led content; peer review and curriculum alignment.</li>
                  <li>Analytics: usage/completion, assessment outcomes, and cohort-level insights for institutions.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Business model & monetization levers</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>B2B licensing (annual/semester) to universities, nursing colleges and allied-health programs.</li>
                  <li>B2C subscriptions for DocTutorials exam tracks (monthly/annual, add-on revision, live).</li>
                  <li>CME/CPD for hospital groups (module packs, completion dashboards).</li>
                  <li>Ancillary: potential distribution partnerships (telco/OEM storefronts), institutional implementation services.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Traction & proof points (qualitative)</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Operating brand(s): MediSys (institutional) + DocTutorials (student-facing).</li>
                  <li>App distribution live: Google Play + App Store presence for DocTutorials; MediSys learning app available on Play.</li>
                  <li>Institutional focus: positioning explicitly targets colleges and allied-health programs.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Value-creation themes (3)</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>University pipelines (CBME-aligned licensing): standardize core modules + OSCE/OSPE toolkits; sell to state and private universities/teaching hospitals.</li>
                  <li>Exam-prep depth (DocTutorials): tighten cohort journeys (MBBS→NEET PG/FMGE→SS), scale live/revision and app engagement to raise retention.</li>
                  <li>Hospital workforce upskilling/CME: package skills refresh + compliance dashboards for hospital groups and nursing networks (on MediSys platform).</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">GTM — partner motions</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Academia: deans/HoDs; pilot 2–3 core subjects; publish completion & pass-rate deltas to expand department-wide.</li>
                  <li>Student channels: campus ambassadors, alumni groups, internship-season cohorts; calendar around MBBS exams/NEET PG/FMGE windows.</li>
                  <li>Hospitals: HR/medical education; CME credit packs + onboarding bundles; monthly completion reports.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">12-month execution roadmap</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>0–90 days: finalize 1–2 university pilots (MBBS core), ship DocTutorials "term planner" journeys, define CME pack for one hospital group.</li>
                  <li>90–180 days: publish pilot readouts; scale to multi-department contracts; expand DocTutorials revision and Q-bank depth.</li>
                  <li>6–12 months: replicate university wins state-by-state; launch 2nd hospital network; add nursing/allied-health packs to cross-sell.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Key risks & mitigation</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Policy/assessment shifts: keep content modular; maintain rapid update cadences per exam calendar.</li>
                  <li>Content quality/piracy: watermarking, controlled access, frequent refresh; highlight faculty credentials and QA process.</li>
                  <li>Institutional sales cycle: land-and-expand via pilots; price for department adoption first.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Governance & reporting upgrades</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Content QA playbook: peer-review logs; versioning and change notes (per module).</li>
                  <li>Learning analytics pack: standardized dashboards for completion, assessments, and cohort variance.</li>
                  <li>Faculty & compliance registry: credentials, CME alignment, and IP policies.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Partnership & capital options (optional)</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Academic distribution alliances (university networks, state consortia).</li>
                  <li>Hospital groups for CME contracts.</li>
                  <li>Selective channel partners (telco/OEM app storefronts) for student acquisition at low CAC.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-8 mb-4">Pilot readiness (what's on the shelf)</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Institutional package templates mapped to competencies.</li>
                  <li>DocTutorials live classes/QRP & exam tracks (deployable to cohorts quickly).</li>
                  <li>Admin/ops services for onboarding and course administration.</li>
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Opportunities Tab - Show for all companies except GOQii/Freo/MediSys on analysis tab */}
          {((company.name !== 'GOQii' && company.name !== 'Freo' && company.name !== 'MediSys Edutech') || activeTab === 'targets') && (
            <>
              {/* Thesis Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {mockData.valueCreationTheses.map((thesis) => (
              <Card
                key={thesis.id}
                onClick={() => setSelectedThesisId(thesis.id)}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg h-full flex flex-col ${
                  selectedThesisId === thesis.id ? 'ring-2 ring-blue-500 border-blue-300 shadow-lg' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl font-bold text-blue-600">#{thesis.id}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <CardTitle className="text-base flex-1">{thesis.title}</CardTitle>
                    <div className="flex items-center space-x-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-2 py-1 flex-shrink-0">
                      <svg className="w-3 h-3 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[10px] text-slate-300 font-medium whitespace-nowrap">{thesis.potentialValue}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-slate-400 line-clamp-3 mb-3">{thesis.description}</p>
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-auto">
                    <span>{thesis.timeframe}</span>
                    <span>{thesis.targets.length} opportunities</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Thesis Details */}
          {selectedThesis && (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <CardTitle className="text-xl flex-1">
                        #{selectedThesis.id}. {selectedThesis.title}
                      </CardTitle>
                      <Badge variant="primary" size="sm" className="flex-shrink-0 whitespace-nowrap">{selectedThesis.potentialValue}</Badge>
                    </div>
                    <p className="text-slate-400">{selectedThesis.description}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="primary" size="sm" className="mb-2 hidden">{selectedThesis.potentialValue}</Badge>
                    <p className="text-sm text-slate-400">{selectedThesis.timeframe}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Potential Opportunities & Contacts ({selectedThesis.targets.length})
                </h3>
                <div className="space-y-6">
                  {selectedThesis.targets.map((target, idx) => (
                    <div key={idx} className="border border-slate-700/20 rounded-lg p-5 bg-slate-800/50 backdrop-blur-sm hover:border-slate-600/50 hover:shadow-xl transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <button
                            onClick={() => handleTargetClick(target)}
                            className="text-lg font-semibold text-white mb-1 hover:text-blue-600 transition-colors cursor-pointer text-left"
                          >
                            {target.name}
                          </button>
                          <div className="flex items-center space-x-3 text-sm text-slate-400">
                            <Badge variant="default" size="sm">{target.type}</Badge>
                            <span className="flex items-center">
                              <Globe className="w-3 h-3 mr-1" />
                              {target.location}
                            </span>
                            <span className="flex items-center font-semibold text-green-600">
                              {target.dealSize}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4 p-3 bg-blue-500/10 rounded-lg">
                        <p className="text-sm font-medium text-blue-300 mb-1">Strategic Rationale:</p>
                        <p className="text-sm text-blue-400">{target.strategicRationale}</p>
                      </div>

                      <div>
                        <h5 className="text-sm font-semibold text-white mb-3 flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          Key Contacts ({target.contacts.length})
                        </h5>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-800/30">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-slate-400 uppercase">Name</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-slate-400 uppercase">Role</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-slate-400 uppercase">Email</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-slate-400 uppercase">Phone</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-slate-400 uppercase">LinkedIn</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/20">
                              {target.contacts.map((contact, cidx) => (
                                <tr key={cidx} className="hover:bg-slate-800/30">
                                  <td className="px-3 py-3 font-medium text-white">{contact.name}</td>
                                  <td className="px-3 py-3 text-slate-400">{contact.role}</td>
                                  <td className="px-3 py-3">
                                    <button
                                      onClick={() => handleEmailClick(contact, target, selectedThesis!)}
                                      className="text-blue-600 hover:text-blue-400 flex items-center cursor-pointer transition-colors"
                                    >
                                      <Mail className="w-3 h-3 mr-1" />
                                      {contact.email}
                                    </button>
                                  </td>
                                  <td className="px-3 py-3">
                                    <a href={`tel:${contact.phone}`} className="text-slate-400 hover:text-white flex items-center">
                                      <Phone className="w-3 h-3 mr-1" />
                                      {contact.phone}
                                    </a>
                                  </td>
                                  <td className="px-3 py-3">
                                    <a
                                      href={`https://${contact.linkedin}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-400 flex items-center"
                                    >
                                      <Linkedin className="w-3 h-3 mr-1" />
                                      Profile
                                    </a>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
            </>
          )}
        </div>

      </div>

      {/* Toast Notification */}
      <Toast
        isVisible={showToast}
        message={toastMessage}
        onClose={() => setShowToast(false)}
      />

      {/* Target Detail Modal */}
      <TargetDetailModal
        isOpen={showTargetModal}
        onClose={() => setShowTargetModal(false)}
        target={selectedTarget}
        thesis={selectedThesis ?? null}
        onEmailClick={handleEmailClick}
      />
    </div>
  );
}
