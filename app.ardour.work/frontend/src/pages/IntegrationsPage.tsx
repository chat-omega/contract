import { Plug } from 'lucide-react';

export function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
            <Plug className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Integrations</h1>
            <p className="text-slate-400">Connect external tools and services</p>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700/50 p-12 text-center">
          <Plug className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Coming Soon</h2>
          <p className="text-slate-400">Integration management features will be available here</p>
        </div>
      </div>
    </div>
  );
}
