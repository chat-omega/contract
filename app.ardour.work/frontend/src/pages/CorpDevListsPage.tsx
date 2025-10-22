import { ListChecks } from 'lucide-react';

export function CorpDevListsPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700/20">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <ListChecks className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Lists</h1>
                <p className="text-sm text-slate-400">Manage custom company lists and segments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-12 text-center hover:shadow-xl transition-all hover:scale-[1.02]">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600/20 to-blue-700/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ListChecks className="w-10 h-10 text-blue-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Coming Soon</h2>
            <p className="text-slate-400">List management features will be available here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
