import { useState } from 'react';
import {
  Send,
  AlertCircle
} from 'lucide-react';
import { ReportDisplay } from '@/components/ReportDisplay';
import { ResearchProgress, ResearchPhase, ResearchQuery, ResearchSource } from '@/components/ResearchProgress';
import { startResearch, streamResearch, downloadReport } from '@/services/researchApi';
import type { ResearchSession } from '@/services/researchApi';

interface ExampleButton {
  id: string;
  label: string;
  prompt: string;
}

const exampleButtons: ExampleButton[] = [
  {
    id: 'ma-strategy',
    label: 'M&A Strategy',
    prompt: 'Create a comprehensive M&A strategy document outlining our strategic objectives, target criteria, and acquisition approach.'
  },
  {
    id: 'target-profile',
    label: 'Target Profile',
    prompt: 'Generate a detailed target company profile including financial overview, market position, and strategic fit analysis.'
  },
  {
    id: 'market-analysis',
    label: 'Market Analysis',
    prompt: 'Analyze the target market including size, growth trends, competitive landscape, and key opportunities.'
  },
  {
    id: 'investment-memo',
    label: 'Investment Memo',
    prompt: 'Create an investment memo summarizing the opportunity, financial projections, risks, and recommendation.'
  },
  {
    id: 'board-presentation',
    label: 'Board Presentation',
    prompt: 'Generate a board presentation deck covering deal rationale, valuation, synergies, and next steps.'
  },
  {
    id: 'due-diligence',
    label: 'Due Diligence',
    prompt: 'Create a due diligence checklist and initial findings report covering financial, operational, and legal aspects.'
  },
  {
    id: 'deal-thesis',
    label: 'Deal Thesis',
    prompt: 'Develop a compelling deal thesis outlining strategic rationale, value creation opportunities, and expected outcomes.'
  },
  {
    id: 'pitch-deck',
    label: 'Pitch Deck',
    prompt: 'Create a pitch deck for internal stakeholders highlighting the opportunity, financials, and recommended action.'
  }
];

export function AIAnalystPage() {
  // State
  const [query, setQuery] = useState('');
  const [documentType, setDocumentType] = useState('document');
  const [selectedModel, setSelectedModel] = useState('gpt-5');
  const [isResearching, setIsResearching] = useState(false);
  const [currentReport, setCurrentReport] = useState('');
  const [currentSession, setCurrentSession] = useState<ResearchSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [phases, setPhases] = useState<ResearchPhase[]>([]);
  const [queries, setQueries] = useState<ResearchQuery[]>([]);
  const [sources, setSources] = useState<ResearchSource[]>([]);

  const handleExampleClick = (prompt: string) => {
    setQuery(prompt);
  };

  const handleSubmit = async () => {
    if (!query.trim()) return;

    setIsResearching(true);
    setCurrentReport('');
    setError(null);
    setProgressMessage('Starting research...');

    // Initialize phases
    setPhases([
      { name: 'Search', step: 'search', status: 'pending' },
      { name: 'Review', step: 'review', status: 'pending' },
      { name: 'Synthesis', step: 'synthesis', status: 'pending' }
    ]);
    setQueries([]);
    setSources([]);

    try {
      // Start research session
      const session = await startResearch({
        query: query.trim(),
        model: selectedModel
      });

      setCurrentSession(session);

      // Stream results
      for await (const event of streamResearch(session.id)) {
        if (event.type === 'progress') {
          setProgressMessage(event.data);
        } else if (event.type === 'step_started') {
          // Update phase status
          const { step } = event.data;
          setPhases(prev => prev.map(p => {
            if (p.step === step) {
              return { ...p, status: 'running', startTime: event.data.timestamp };
            }
            // Mark previous phases as completed
            const stepOrder = ['search', 'review', 'synthesis'];
            const currentIndex = stepOrder.indexOf(step);
            const phaseIndex = stepOrder.indexOf(p.step);
            if (phaseIndex < currentIndex && p.status !== 'completed') {
              return { ...p, status: 'completed', endTime: event.data.timestamp };
            }
            return p;
          }));
        } else if (event.type === 'query_added') {
          // Add query to list
          setQueries(prev => [...prev, {
            query: event.data.query,
            timestamp: event.data.timestamp
          }]);
        } else if (event.type === 'source_found') {
          // Add source to list
          setSources(prev => [...prev, {
            title: event.data.title,
            url: event.data.url,
            domain: event.data.domain,
            snippet: event.data.snippet,
            timestamp: event.data.timestamp
          }]);
        } else if (event.type === 'chunk') {
          setCurrentReport(prev => prev + event.data);
        } else if (event.type === 'complete') {
          setCurrentReport(event.data);
          setProgressMessage('');
          setIsResearching(false);
          // Mark all phases as completed
          setPhases(prev => prev.map(p => ({ ...p, status: 'completed' })));
        } else if (event.type === 'error') {
          setError(event.data);
          setProgressMessage('');
          setIsResearching(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start research');
      setProgressMessage('');
      setIsResearching(false);
    }
  };

  const handleDownload = () => {
    if (currentSession) {
      downloadReport({ ...currentSession, report: currentReport });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 pt-4 pb-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/50 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-red-400">Research Failed</h3>
                <p className="text-red-300 mt-1">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    setIsResearching(false);
                  }}
                  className="mt-3 text-sm text-red-400 hover:text-red-300 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Research Progress */}
        {isResearching && !currentReport && !error && (
          <div className="mb-6">
            <ResearchProgress
              phases={phases}
              queries={queries}
              sources={sources}
              progressMessage={progressMessage}
              isComplete={false}
            />
          </div>
        )}

        {/* Report Display */}
        {currentReport && !error && (
          <div className="mb-6">
            <ReportDisplay
              content={currentReport}
              isStreaming={isResearching}
              title={currentSession?.query}
              onDownload={handleDownload}
            />
          </div>
        )}

        {/* Chat Input - Positioned above center */}
        <div className="mt-[25vh] z-10">
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask me anything about M&A, company research, or market analysis..."
              rows={2}
              className="w-full px-6 py-5 pb-20 border-2 border-slate-700/50 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-white placeholder-slate-500 bg-slate-800/50 backdrop-blur-sm shadow-lg"
              disabled={isResearching}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSubmit();
                }
              }}
            />

            {/* Controls Inside Textarea - Bottom */}
            <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between">
              {/* Left: Model & Document Selectors */}
              <div className="flex items-center space-x-2">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="px-4 py-2 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer bg-slate-800/50 backdrop-blur-sm text-white"
                  disabled={isResearching}
                >
                  <option value="gpt-5">GPT-5</option>
                  <option value="gpt-5-mini">GPT-5 Mini</option>
                  <option value="gpt-5-nano">GPT-5 Nano</option>
                  <option value="openai/gpt-oss-120b">Cerebras GPT-OSS-120B</option>
                  <option value="gpt-4.1">GPT-4.1</option>
                  <option value="gpt-4.1-mini">GPT-4.1 Mini</option>
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                </select>

                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="px-4 py-2 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer bg-slate-800/50 backdrop-blur-sm text-white"
                  disabled={isResearching}
                >
                  <option value="document">Document</option>
                  <option value="presentation">Presentation</option>
                  <option value="spreadsheet">Spreadsheet</option>
                  <option value="report">Report</option>
                </select>
              </div>

              {/* Right: Send Button (Icon Only) */}
              <button
                onClick={handleSubmit}
                disabled={!query.trim() || isResearching}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  query.trim() && !isResearching
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-md hover:shadow-xl transform hover:scale-105'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Example Buttons Section - Only show when no research is active */}
        {!isResearching && !currentReport && !error && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wide">Try these examples</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {exampleButtons.map((example) => (
                <button
                  key={example.id}
                  onClick={() => handleExampleClick(example.prompt)}
                  className="group relative bg-gradient-to-br from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 rounded-xl p-4 text-left transition-all duration-200 hover:shadow-xl hover:scale-105 border border-slate-700/20 hover:border-purple-500/50"
                >
                  <div className="relative z-10 flex items-center justify-center text-center">
                    <span className="text-white font-semibold text-sm leading-tight">
                      {example.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
