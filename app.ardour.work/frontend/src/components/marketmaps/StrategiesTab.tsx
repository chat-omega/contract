import { useState } from 'react';
import {
  Grid,
  ChevronUp,
  ChevronDown,
  DollarSign,
  TrendingUp,
  Settings,
  ArrowRight,
  AlertTriangle,
  X,
  Search,
  List,
} from 'lucide-react';

interface AcquisitionCard {
  title: string;
  fit: string;
  fitColor: string;
  revenue: string;
  growth: string;
  capabilities: string;
}

interface TransformationStory {
  title: string;
  fit: string;
  fitColor: string;
  currentState: string;
  acquire: string;
  acquirePrice: string;
  futureState: string;
  newOfferings: string;
  financialImpact: string;
  integrationTime: string;
  keyConsiderations: string;
}

interface NotRecommendedItem {
  title: string;
  description: string;
}

export function StrategiesTab() {
  const [currentStateExpanded, setCurrentStateExpanded] = useState(true);
  const [notRecommendedExpanded, setNotRecommendedExpanded] = useState(false);

  const acquisitionCards: AcquisitionCard[] = [
    {
      title: 'Wearable Device Manufacturers for Fitness',
      fit: '60% Fit',
      fitColor: 'bg-amber-500/20 text-amber-400',
      revenue: '$2M-$100M',
      growth: 'Low to high, hardware cyclicality; premium sensor firms have low but strategic growth, app-focused OEMs moderate',
      capabilities: 'Sensor innovation, hardware supply chains, potential proprietary biosensor IP, some fitness/wellness app integration',
    },
    {
      title: 'Mobile Fitness Tracking App Developers',
      fit: '70% Fit',
      fitColor: 'bg-amber-500/20 text-amber-400',
      revenue: '$1M-$30M',
      growth: 'Moderate, app-based recurring revenue, high churn risk',
      capabilities: 'Mobile UX, data engagement, gamification, some health coaching, broad user data sets',
    },
    {
      title: 'AI-driven Health Analytics Startups',
      fit: '90% Fit',
      fitColor: 'bg-green-500/20 text-green-400',
      revenue: '$3M-$40M',
      growth: 'High, especially with regulatory clearance; limited commercial scale but fast clinical adoption',
      capabilities: 'Proprietary AI/ML models, certified clinical algorithms (e.g., diabetes, cardiovascular), data science teams, some payer relationships',
    },
  ];

  const transformationStories: TransformationStory[] = [
    {
      title: 'AI Analytics Leapfrog',
      fit: '90% Fit',
      fitColor: 'bg-green-500/20 text-green-400',
      currentState: 'Goqii as a leading Indian digital health/wearables/coaching player with moderate AI capabilities and limited clinical credibility outside India.',
      acquire: 'A sub-$50M revenue AI-driven health analytics firm with FDA-cleared algorithms in diabetes/cardiovascular prediction (e.g., Cardiogram, DarioHealth AI division).',
      acquirePrice: '$30M-$60M',
      futureState: 'Goqii as a clinically validated digital health platform with proprietary, regulator-approved predictive health analytics, enabling deeper insurance partnerships and international B2B2C expansion.',
      newOfferings: 'Clinically validated risk prediction and remote monitoring modules; improved B2B insurance/enterprise sales pitch; upgraded chronic disease management suite.',
      financialImpact: 'Short-term: integration costs, limited immediate revenue; medium-term: unlocks higher-value enterprise contracts (insurance, corporate), supports premium pricing, improves gross margin mix.',
      integrationTime: '12-18 months',
      keyConsiderations: 'Integration of data/AI teams; regulatory alignment (India vs. US/EU); clinical validation in new markets; cultural mismatch in product/engineering; overpaying for unproven monetization.',
    },
    {
      title: 'Enterprise Wellness Scale-Up',
      fit: '88% Fit',
      fitColor: 'bg-green-500/20 text-green-400',
      currentState: 'Goqii as a dominant Indian B2B2C wellness provider with limited US/EMEA enterprise sales reach and moderate product-market fit outside India.',
      acquire: 'A US/EMEA employee wellness engagement platform with $20-50M ARR, flat growth, but strong client roster and enterprise salesforce (e.g., Virgin Pulse competitor, regional SaaS player).',
      acquirePrice: '$40M-$80M',
      futureState: 'Goqii as a multinational B2B2C wellness leader, rapidly scaling outside India by layering its coaching/gamification/IP onto acquired enterprise distribution, revitalizing underperforming platform.',
      newOfferings: 'Combined cross-market wellness programs; new digital health coaching modules for existing enterprise clients; metaverse/gamification upgrades.',
      financialImpact: 'Immediate revenue uplift; access to recurring SaaS revenue; improved valuation multiple (global reach); cross-sell opportunities; higher customer LTV.',
      integrationTime: '9-15 months',
      keyConsiderations: 'Integration of sales/culture; risk of customer churn in mature platform; technology stack mismatch; margin dilution if cost base not optimized; distraction from Indian core.',
    },
    {
      title: 'Proprietary Biosensor Platform',
      fit: '80% Fit',
      fitColor: 'bg-green-500/20 text-green-400',
      currentState: 'Goqii as a wearable health platform primarily reliant on OEM hardware with limited proprietary biomarker differentiation.',
      acquire: 'A specialized wearable biosensor company (e.g., non-invasive glucose, advanced heart rate) with strong IP but weak commercial traction, $5-20M revenue.',
      acquirePrice: '$25M-$50M',
      futureState: 'Goqii as a next-gen wearable platform with exclusive biomarker tracking, supporting chronic disease management and opening new clinical/research partnerships.',
      newOfferings: 'New hardware SKUs with unique biosensors; bundled chronic condition management programs; enhanced data/IP for insurance/clinical sales.',
      financialImpact: 'Short-term: increased R&D/hardware costs; medium-term: margin expansion via IP moat, premium pricing, reduced OEM dependency, supports global product differentiation.',
      integrationTime: '18-24 months',
      keyConsiderations: 'Execution risk (hardware integration, regulatory clearance); capital intensity; IP litigation; time to market; uncertain user adoption of new sensors.',
    },
  ];

  const notRecommendedItems: NotRecommendedItem[] = [
    {
      title: 'Acquire large-scale hardware-only fitness tracker OEMs',
      description: 'Goqii lacks global hardware supply chain and margin discipline for pure hardware plays; such acquisitions would dilute focus, add operational complexity, and erode margins without advancing proprietary technology or recurring revenue streams.',
    },
    {
      title: 'Buy pure-play consumer fitness/wellness apps with no clinical/data/IP differentiation',
      description: 'Consumer wellness app space is saturated, low-margin, and highly competitive; such acquisitions offer limited defensible value, do not enhance enterprise/insurance positioning, and would not support Goqii\'s ambition to build a clinically credible, high-valuation platform.',
    },
  ];

  return (
    <div className="p-6 overflow-y-auto h-full bg-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Your Current State Section */}
        <div>
          <button
            onClick={() => setCurrentStateExpanded(!currentStateExpanded)}
            className="w-full flex items-center gap-3 mb-4 group"
          >
            <Grid className="w-5 h-5 text-blue-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Your Current State</h3>
            {currentStateExpanded ? (
              <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
            )}
          </button>

          {currentStateExpanded && (
            <div className="bg-slate-800/60 rounded-lg p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Current Offerings:</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Wearable fitness tracking devices; AI-driven health engagement platform with personalized coaching; subscription-based corporate wellness programs (primary revenue stream); chronic disease management solutions (diabetes, cholesterol, weight); early-stage health metaverse initiative (blockchain, gamification).
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Core Capabilities:</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Behavioral health change technology; integration of human coaching and digital engagement; strong B2B2C operations for Indian corporates; partnerships with insurance companies; proven ability to scale in Indian digital health market; early-stage AI/ML data analytics (not proprietary); moderate hardware (wearables) product management; rapid product iteration.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Current Trajectory:</h4>
                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      Continued dominance in Indian preventive health/corporate wellness; modest international expansion (without major enterprise traction); gradual rollout of health metaverse; incremental improvement in AI/ML capabilities (not industry-leading); risk of plateauing as Indian market matures; limited defensible technology/IP outside India; high execution risk for global/tech pivot without M&A.
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Key Assets:</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Large corporate and consumer user base in India; proprietary behavioral rewards platform (GOQii Cash); AI-driven engagement algorithms; relationships with Indian corporates and insurance; wearable device ecosystem (mostly OEM-based); some health data IP; $130M+ funding; strong founder leadership; limited international enterprise sales infrastructure.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Financial Profile:</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Estimated $25-50M revenue (primarily India, B2B2C focus); high double-digit growth (25-40% YoY); uncertain gross margins (wearables likely low, coaching higher); negative or breakeven EBITDA (assumed for growth stage); recent $10M funding for metaverse; no public profitability; limited US/EU revenue.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* What's Available to Acquire Section */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4">What's Available to Acquire</h3>
          <div className="space-y-4">
            {acquisitionCards.map((card, index) => (
              <div
                key={index}
                className="bg-slate-800/50 border border-blue-500/50 rounded-lg p-5"
              >
                <div className="mb-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">{card.title}</h4>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${card.fitColor}`}>
                    {card.fit}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2">
                    <DollarSign className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-slate-300 leading-relaxed">{card.revenue}</p>
                  </div>

                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-slate-300 leading-relaxed">{card.growth}</p>
                  </div>

                  <div className="flex items-start gap-2">
                    <Settings className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-slate-300 leading-relaxed">{card.capabilities}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors">
                    <Search className="w-3.5 h-3.5" />
                    Explore
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors">
                    <List className="w-3.5 h-3.5" />
                    Find Companies
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transformation Stories Section */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4">Transformation Stories</h3>
          <div className="space-y-4">
            {transformationStories.map((story, index) => (
              <div key={index} className="bg-slate-800/50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">{story.title}</h4>
                  <span className={`px-2.5 py-1 rounded text-xs font-medium ${story.fitColor}`}>
                    {story.fit}
                  </span>
                </div>

                {/* Main Flow */}
                <div className="grid grid-cols-3 gap-4 mb-5">
                  <div className="bg-slate-700/40 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-300">CURRENT STATE</h5>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{story.currentState}</p>
                  </div>

                  <div className="bg-slate-700/40 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowRight className="w-4 h-4 text-green-400" />
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-300">ACQUIRE</h5>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">{story.acquire}</p>
                    <div className="inline-block px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">
                      {story.acquirePrice}
                    </div>
                  </div>

                  <div className="bg-slate-700/40 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-300">FUTURE STATE</h5>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{story.futureState}</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">New Offerings</h5>
                    <p className="text-xs text-slate-300 leading-relaxed">{story.newOfferings}</p>
                  </div>

                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Financial Impact</h5>
                    <p className="text-xs text-slate-300 leading-relaxed">{story.financialImpact}</p>
                  </div>

                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Integration Time</h5>
                    <p className="text-xs text-slate-300 leading-relaxed">{story.integrationTime}</p>
                  </div>

                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Key Considerations</h5>
                    <p className="text-xs text-slate-300 leading-relaxed">{story.keyConsiderations}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Not Recommended Section */}
        <div className="border border-red-500/50 rounded-lg">
          <button
            onClick={() => setNotRecommendedExpanded(!notRecommendedExpanded)}
            className="w-full flex items-center gap-3 p-4 group"
          >
            <X className="w-5 h-5 text-red-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Not Recommended</h3>
            {notRecommendedExpanded ? (
              <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
            )}
          </button>

          {notRecommendedExpanded && (
            <div className="p-4 pt-0 space-y-4">
              {notRecommendedItems.map((item, index) => (
                <div key={index} className="bg-slate-800/50 rounded-lg p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">{item.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
