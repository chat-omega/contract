import { useState } from 'react';
import { FileSearch, Sparkles, History, Settings, AlertCircle } from 'lucide-react';
import { ReportDisplay } from '@/components/ReportDisplay';
import { ResearchProgress, ResearchPhase, ResearchQuery, ResearchSource } from '@/components/ResearchProgress';
import { startResearch, streamResearch, downloadReport } from '@/services/researchApi';
import type { ResearchSession } from '@/services/researchApi';

export function ResearchPage() {
  const [query, setQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-5');
  const [isResearching, setIsResearching] = useState(false);
  const [currentReport, setCurrentReport] = useState('');
  const [currentSession, setCurrentSession] = useState<ResearchSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>('');

  // New state for enhanced streaming
  const [phases, setPhases] = useState<ResearchPhase[]>([]);
  const [queries, setQueries] = useState<ResearchQuery[]>([]);
  const [sources, setSources] = useState<ResearchSource[]>([]);

  const handleSearch = async () => {
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
          const { step, phase } = event.data;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                <FileSearch className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  AI Research
                </h1>
                <p className="text-sm text-gray-600">Deep research powered by advanced AI</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <History className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Search Interface */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Sparkles className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">What would you like to research?</h2>
              </div>

              <div className="space-y-4">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter your research question or topic... (e.g., 'What are the latest trends in AI-powered healthcare solutions?')"
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
                  disabled={isResearching}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleSearch();
                    }
                  }}
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isResearching}
                    >
                      <option value="gpt-5">GPT-5 (Latest)</option>
                      <option value="gpt-5-mini">GPT-5 Mini</option>
                      <option value="gpt-5-nano">GPT-5 Nano</option>
                      <option value="gpt-4.1">GPT-4.1</option>
                      <option value="gpt-4.1-mini">GPT-4.1 Mini</option>
                      <option value="gpt-4o">GPT-4o</option>
                      <option value="gpt-4o-mini">GPT-4o Mini</option>
                    </select>
                    <span className="text-sm text-gray-500">Model</span>
                  </div>

                  <button
                    onClick={handleSearch}
                    disabled={!query.trim() || isResearching}
                    className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center space-x-2 ${
                      !query.trim() || isResearching
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:scale-105'
                    }`}
                  >
                    <FileSearch className="w-5 h-5" />
                    <span>{isResearching ? 'Researching...' : 'Start Research'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900">Research Failed</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                  <button
                    onClick={() => {
                      setError(null);
                      setIsResearching(false);
                    }}
                    className="mt-3 text-sm text-red-600 hover:text-red-700 underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Research Progress / Report Display - Same Location */}
          {(isResearching || currentReport) && !error && (
            <div className="mt-8">
              {/* Show progress while researching, report when complete */}
              {!currentReport && isResearching ? (
                <ResearchProgress
                  phases={phases}
                  queries={queries}
                  sources={sources}
                  progressMessage={progressMessage}
                  isComplete={false}
                />
              ) : currentReport ? (
                <ReportDisplay
                  content={currentReport}
                  isStreaming={isResearching}
                  title={currentSession?.query}
                  onDownload={handleDownload}
                />
              ) : null}
            </div>
          )}

          {/* Example Queries */}
          {!isResearching && !currentReport && !error && (
            <div className="mt-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Example Research Topics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Latest developments in renewable energy technology',
                  'Market analysis of AI startups in healthcare',
                  'Competitive landscape of fintech companies in India',
                  'Investment opportunities in sustainable agriculture'
                ].map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(example)}
                    className="text-left p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all"
                  >
                    <p className="text-sm text-gray-700">{example}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
