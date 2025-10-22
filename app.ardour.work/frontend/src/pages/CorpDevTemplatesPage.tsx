import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, ChevronLeft, FileStack, Grid, List } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  type: 'Live Document';
  lastModified: string;
  created: string;
}

const sampleTemplates: Template[] = [
  {
    id: '1',
    name: 'New Document',
    type: 'Live Document',
    lastModified: '15 hours ago',
    created: '15 hours ago',
  },
];

export function CorpDevTemplatesPage() {
  const navigate = useNavigate();
  const [templates] = useState<Template[]>(sampleTemplates);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Top Bar */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <FileStack className="w-6 h-6 text-slate-400" />
              <h1 className="text-2xl font-bold">Templates</h1>
            </div>
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-slate-700/50 rounded-lg p-1">
                <button className="p-2 rounded text-slate-400 hover:text-white">
                  <Grid className="w-4 h-4" />
                </button>
                <button className="p-2 rounded bg-slate-600 text-white">
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Recent Dropdown */}
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm hover:bg-slate-600/50 transition-colors">
                <span>Recent</span>
              </button>

              {/* Back to Documents */}
              <button
                onClick={() => navigate('/corp-dev/documents')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm hover:bg-slate-600/50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Documents</span>
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-900/50 border-b border-slate-700/50">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Last Modified
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {templates.map((template) => (
                  <tr
                    key={template.id}
                    className="hover:bg-slate-700/30 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                        <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                          {template.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                        {template.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {template.lastModified}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {template.created}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
