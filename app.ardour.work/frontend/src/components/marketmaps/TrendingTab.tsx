import { RefreshCw } from 'lucide-react';

export function TrendingTab() {
  const trends = [
    {
      title: "Convergence of Health Data Ecosystems:",
      description: "The market is shifting rapidly toward platforms that seamlessly integrate wearable data with electronic health records, insurance systems, and clinical workflows. Companies enabling frictionless, secure, and actionable data exchange between consumers, providers, and payers are positioned to unlock powerful network effects and become indispensable across the healthcare value chain."
    },
    {
      title: "Personalized Preventive Care at Scale:",
      description: "Advances in AI-driven analytics and longitudinal data collection are fueling the rise of hyper-personalized, preventive health solutions. Targets with capabilities in real-time health risk assessment, behavioral nudging, and adaptive intervention are increasingly attractive, as they align with payer and employer demands for demonstrable ROI and reduced long-term healthcare costs."
    },
    {
      title: "Expansion into Chronic Disease Management:",
      description: "There is accelerated interest in digital health assets that move beyond wellness tracking to address continuous monitoring, remote care coordination, and validated clinical outcomes for chronic conditions such as diabetes, hypertension, and cardiovascular disease. Platforms offering continuous monitoring, remote care coordination, and validated clinical outcomes are commanding significant premiums as healthcare systems pivot toward value-based care."
    },
    {
      title: "Integration of Gamification and Community:",
      description: "Offerings that blend social engagement, gamification, and behavioral economics are seeing outsized user retention and clinical relevance. Companies that successfully combine hardware, software, and a vibrant community create differentiated user experiences that foster habit formation and brand loyalty—key drivers of long-term growth and defensibility."
    },
    {
      title: "Global Regulatory and Interoperability Readiness:",
      description: "Strategic alignment with evolving data privacy regulations (e.g., GDPR, HIPAA, India's Digital Health Mission) and international interoperability standards are increasingly favored by strategic acquirers with global ambitions. Scalable compliance frameworks and modular architectures that allow for rapid cross-market expansion are becoming a defining feature of future winners."
    },
    {
      title: "Value-Added Partnerships and Ecosystem Play:",
      description: "Companies forging deep partnerships with insurers, pharmaceuticals, telehealth, and fitness brands are accelerating growth through bundled offerings and multi-channel distribution. The ability to embed value-added services—such as digital therapeutics, coaching, and physician-led ecosystems—into broader health and wellness platforms is becoming a defining feature of future winners."
    },
    {
      title: "Advances in Sensor Technology and Non-Invasive Monitoring:",
      description: "The next wave of innovation is coming from targets that leverage cutting-edge sensor technology, including non-invasive glucose monitoring, hydration tracking, and advanced biometrics. These capabilities dramatically expand addressable use cases and open new revenue streams in both consumer and clinical markets."
    }
  ];

  return (
    <div className="p-6 overflow-y-auto h-full bg-slate-900">
      <div className="max-w-4xl">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-6">
          Key Trends for the M&A Target Market: Digital Health, Wellness, and Connected Wearables
        </h2>

        <div className="space-y-4 mb-8">
          {trends.map((trend, index) => (
            <div key={index} className="flex gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              </div>
              <div>
                <span className="text-xs text-blue-400 font-medium">{trend.title}</span>
                <span className="text-xs text-slate-300 leading-relaxed"> {trend.description}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <RefreshCw className="w-4 h-4" />
          <span>Updated 1 hour ago</span>
        </div>
      </div>
    </div>
  );
}
