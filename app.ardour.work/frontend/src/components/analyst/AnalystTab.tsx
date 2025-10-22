import { useState, useRef, useEffect } from 'react';
import {
  Bot,
  User,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PlanningStep {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
}

interface AnalystTabProps {
  companyName?: string;
  documentId?: string;
}

export function AnalystTab({ companyName = 'GOQii', documentId }: AnalystTabProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlanningExpanded, setIsPlanningExpanded] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Planning steps
  const [planningSteps] = useState<PlanningStep[]>([
    {
      id: 1,
      title: 'Analyzing Company Profile',
      description: 'Gathering comprehensive information about the target company including business model, products, and market position',
      status: 'completed'
    },
    {
      id: 2,
      title: 'Evaluating Strategic Fit',
      description: 'Assessing alignment with acquisition criteria and identifying synergy opportunities',
      status: 'completed'
    },
    {
      id: 3,
      title: 'Conducting Market Research',
      description: 'Researching industry trends, competitive landscape, and growth potential',
      status: 'completed'
    }
  ]);

  // Research sources count
  const [sourcesCount] = useState(47);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCreateProfile = () => {
    // Add initial AI message
    const initialMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `I'll create an ideal M&A target profile for ${companyName}. Let me analyze the company's business model, market position, financial performance, and strategic opportunities.

I'll structure this analysis to provide you with:
- Company Overview & Business Model
- Strategic Fit Assessment
- Financial Performance Analysis
- Market Outlook & Growth Potential
- Synergy Opportunities
- Risk Analysis
- Recommendation

This will help you make an informed decision about this potential acquisition target.`,
      timestamp: new Date()
    };

    setMessages([initialMessage]);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Based on your question about "${input.trim()}", I've researched the following insights:

**Key Findings:**
GOQii operates in the preventive healthcare and wearable technology space, with a unique ecosystem approach combining devices, health coaching, and gamification.

**Strategic Considerations:**
The company has strong positioning in the Indian market and has been expanding internationally, particularly in the UK healthcare sector.

**Financial Indicators:**
Revenue growth has been consistent, driven by both device sales and recurring subscription revenues from their healthcare platform.

Would you like me to dive deeper into any specific aspect?`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getStatusBadge = (status: PlanningStep['status']) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400">Done</span>;
      case 'in-progress':
        return <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-400">In Progress</span>;
      case 'pending':
        return <span className="px-2 py-1 rounded text-xs font-medium bg-slate-700/50 text-slate-400">Pending</span>;
    }
  };

  const getStatusColor = (status: PlanningStep['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-500/30 bg-green-500/5';
      case 'in-progress':
        return 'border-blue-500/30 bg-blue-500/5';
      case 'pending':
        return 'border-slate-700/30 bg-slate-800/30';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header Section */}
      <div className={messages.length === 0 ? "flex-1 flex items-center justify-center px-6" : "flex-shrink-0 px-6 pt-6 pb-4 border-b border-slate-700/20"}>
        {messages.length === 0 ? (
          <div className="max-w-3xl mx-auto space-y-4 mt-16">
            {/* Create Profile Button */}
            <button
              onClick={handleCreateProfile}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg px-6 py-4 font-semibold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 flex items-center justify-center space-x-2 group"
            >
              <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Create an Ideal M&A Target Profile for {companyName}</span>
            </button>

            <p className="text-slate-400 text-sm text-center">
              Click to start an AI-powered analysis of this acquisition target
            </p>

            {/* Try these examples */}
            <div className="mt-6">
              <p className="text-slate-400 text-xs mb-3">Try these examples:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setInput("What are the key revenue drivers for this company?")}
                  className="text-left px-3 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/20 rounded-lg text-xs text-slate-300 hover:text-white transition-all"
                >
                  What are the key revenue drivers?
                </button>
                <button
                  onClick={() => setInput("Analyze the competitive landscape")}
                  className="text-left px-3 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/20 rounded-lg text-xs text-slate-300 hover:text-white transition-all"
                >
                  Analyze competitive landscape
                </button>
                <button
                  onClick={() => setInput("What are potential integration challenges?")}
                  className="text-left px-3 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/20 rounded-lg text-xs text-slate-300 hover:text-white transition-all"
                >
                  Potential integration challenges?
                </button>
                <button
                  onClick={() => setInput("Evaluate the management team")}
                  className="text-left px-3 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/20 rounded-lg text-xs text-slate-300 hover:text-white transition-all"
                >
                  Evaluate management team
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {/* AI Analyst Message */}
            <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm mb-1">AI Analyst</h3>
                  <p className="text-slate-300 text-sm">
                    Creating comprehensive M&A target profile for {companyName}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 text-xs font-medium">Active</span>
                </div>
              </div>
            </div>

            {/* AI Planning Section */}
            <div className="bg-slate-800/50 border border-slate-700/20 rounded-lg overflow-hidden">
              <button
                onClick={() => setIsPlanningExpanded(!isPlanningExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/70 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium text-sm">AI Planning</span>
                  <span className="text-slate-400 text-xs">
                    ({planningSteps.filter(s => s.status === 'completed').length}/{planningSteps.length} steps completed)
                  </span>
                </div>
                {isPlanningExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {isPlanningExpanded && (
                <div className="px-4 pb-4 space-y-2">
                  {planningSteps.map((step) => (
                    <div
                      key={step.id}
                      className={`border rounded-lg p-3 transition-all ${getStatusColor(step.status)}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getStatusBadge(step.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-slate-400 text-xs font-medium">
                              Step {step.id}
                            </span>
                          </div>
                          <h4 className="text-white text-sm font-medium mb-1">
                            {step.title}
                          </h4>
                          <p className="text-slate-400 text-xs">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Research Conducted Section */}
            <div className="bg-slate-800/30 border border-slate-700/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium text-sm">Research Conducted</h4>
                  <p className="text-slate-400 text-xs">Analyzed multiple data sources</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    {sourcesCount}
                  </div>
                  <div className="text-slate-400 text-xs uppercase tracking-wider font-medium">
                    Sources
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Messages Area */}
      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[90%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-slate-700'
                      : 'bg-gradient-to-br from-blue-600 to-purple-600'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* Message Content */}
                <div className="flex flex-col space-y-2">
                  <div
                    className={`px-4 py-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800/70 border border-slate-700/30 text-slate-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>

                  <p className="text-xs text-slate-500 px-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[90%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="px-4 py-3 rounded-lg bg-slate-800/70 border border-slate-700/30">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                    <span className="text-sm text-slate-400">Analyzing...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Input Area */}
      {messages.length > 0 && (
        <div className="flex-shrink-0 px-6 py-4 border-t border-slate-700/20 bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question about this acquisition target..."
                rows={1}
                className="w-full bg-slate-800 text-white placeholder-slate-500 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-700/20 resize-none max-h-32"
                style={{ minHeight: '44px' }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-all shadow-lg shadow-blue-600/20"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Press Enter to send, Shift + Enter for new line
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
