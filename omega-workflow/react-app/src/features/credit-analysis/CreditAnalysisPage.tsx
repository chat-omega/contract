/**
 * CreditAnalysisPage Component
 * Credit analysis with AI chat interface
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { PaperAirplaneIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import { cn } from '@/utils/cn';
import { useCreditAnalysisStore } from '@/stores/creditAnalysisStore';
import {
  uploadCreditDocument,
  queryCreditAnalysis,
  pollForResults,
} from '@/services/creditAnalysisService';
import {
  ChatMessage,
  SampleQuestionCard,
  CreditReportView,
} from './components';

// Sample questions for the chat interface
const SAMPLE_QUESTIONS = [
  'Perform Credit Analysis on First Brands',
  'What is the Credit Rating of SpaceX',
  'How is the credit quality of OpenAI',
  "Analyze Anthropic's creditworthiness",
];

// Dummy data for demo queries (when no document is uploaded)
const DUMMY_CREDIT_REPORTS: Record<string, any> = {
  'first brands': {
    company: {
      name: 'First Brands Group, LLC',
      rating: 'B+',
      sector: 'Consumer Products',
      coverage: 'Based on credit agreement analysis',
    },
    outlook: {
      outlook: 'Stable',
      description: 'Credit profile supported by established brand portfolio and steady cash flows from automotive aftermarket products',
    },
    pod: {
      value: '2.15%',
      horizon: '1-year',
      change: '+0.12%',
      timeSeries: {
        labels: ['11/2021', '04/2022', '09/2022', '02/2023', '07/2023', '12/2023', '05/2024', '08/2024', '10/2024', '11/2024', '12/2024'],
        values: [1.2, 1.4, 1.6, 1.8, 1.9, 2.0, 2.05, 2.08, 2.10, 2.12, 2.15],
      },
    },
    spread: {
      value: '8.45%',
      horizon: '5 year loan',
      change: '+0.25%',
      timeSeries: {
        labels: ['11/2021', '04/2022', '09/2022', '02/2023', '07/2023', '12/2023', '05/2024', '08/2024', '10/2024', '11/2024', '12/2024'],
        values: [5.5, 6.0, 6.5, 7.0, 7.3, 7.6, 7.9, 8.1, 8.25, 8.35, 8.45],
      },
    },
    analysis: {
      html: `<h2>Credit Analysis: First Brands Group, LLC</h2>
<h3>Executive Summary</h3>
<p>First Brands Group demonstrates a <strong>B+ credit profile</strong> with stable outlook. The company benefits from diversified revenue streams across automotive aftermarket products, including well-known brands in the car care and maintenance segments.</p>

<h3>Key Strengths</h3>
<ul>
<li>Established brand portfolio with strong market recognition</li>
<li>Recurring revenue from consumable automotive products</li>
<li>Diversified distribution channels including retail and B2B</li>
<li>Stable cash flow generation supporting debt service</li>
</ul>

<h3>Risk Factors</h3>
<ul>
<li>Exposure to automotive market cyclicality</li>
<li>Competition from private label alternatives</li>
<li>Raw material cost volatility</li>
</ul>

<h3>Financial Covenants</h3>
<p>The credit facility includes standard financial maintenance covenants with adequate headroom under current projections.</p>

<p class="text-sm text-gray-500 mt-4"><em>Analysis generated for demonstration purposes - December 2024</em></p>`,
    },
  },
  'spacex': {
    company: {
      name: 'Space Exploration Technologies Corp.',
      rating: 'BB+',
      sector: 'Aerospace & Defense',
      coverage: 'Based on credit agreement analysis',
    },
    outlook: {
      outlook: 'Positive',
      description: 'Strong growth trajectory supported by Starlink revenue expansion and government contracts',
    },
    pod: {
      value: '1.85%',
      horizon: '1-year',
      change: '-0.15%',
      timeSeries: {
        labels: ['11/2021', '04/2022', '09/2022', '02/2023', '07/2023', '12/2023', '05/2024', '08/2024', '10/2024', '11/2024', '12/2024'],
        values: [2.8, 2.6, 2.4, 2.3, 2.2, 2.1, 2.0, 1.95, 1.90, 1.87, 1.85],
      },
    },
    spread: {
      value: '6.25%',
      horizon: '5 year loan',
      change: '-0.35%',
      timeSeries: {
        labels: ['11/2021', '04/2022', '09/2022', '02/2023', '07/2023', '12/2023', '05/2024', '08/2024', '10/2024', '11/2024', '12/2024'],
        values: [8.0, 7.6, 7.3, 7.0, 6.8, 6.7, 6.5, 6.4, 6.35, 6.30, 6.25],
      },
    },
    analysis: {
      html: `<h2>Credit Analysis: SpaceX</h2>
<h3>Executive Summary</h3>
<p>SpaceX exhibits a <strong>BB+ credit profile</strong> with positive outlook driven by strong revenue growth from Starlink satellite internet services and continued success in launch services.</p>

<h3>Key Strengths</h3>
<ul>
<li>Market leader in commercial launch services</li>
<li>Rapidly growing Starlink revenue stream</li>
<li>Strong government contract backlog (NASA, DoD)</li>
<li>Technological moat with reusable rocket technology</li>
</ul>

<h3>Risk Factors</h3>
<ul>
<li>High capital expenditure requirements</li>
<li>Regulatory and licensing dependencies</li>
<li>Execution risk on Starship development</li>
</ul>

<p class="text-sm text-gray-500 mt-4"><em>Analysis generated for demonstration purposes - December 2024</em></p>`,
    },
  },
  'openai': {
    company: {
      name: 'OpenAI, Inc.',
      rating: 'B',
      sector: 'Technology - AI/ML',
      coverage: 'Based on credit agreement analysis',
    },
    outlook: {
      outlook: 'Developing',
      description: 'Rapid revenue growth offset by significant operating losses and high compute costs',
    },
    pod: {
      value: '3.45%',
      horizon: '1-year',
      change: '+0.20%',
      timeSeries: {
        labels: ['11/2021', '04/2022', '09/2022', '02/2023', '07/2023', '12/2023', '05/2024', '08/2024', '10/2024', '11/2024', '12/2024'],
        values: [4.5, 4.2, 4.0, 3.8, 3.6, 3.5, 3.4, 3.35, 3.40, 3.42, 3.45],
      },
    },
    spread: {
      value: '10.75%',
      horizon: '5 year loan',
      change: '+0.45%',
      timeSeries: {
        labels: ['11/2021', '04/2022', '09/2022', '02/2023', '07/2023', '12/2023', '05/2024', '08/2024', '10/2024', '11/2024', '12/2024'],
        values: [12.0, 11.5, 11.0, 10.8, 10.5, 10.3, 10.2, 10.4, 10.55, 10.65, 10.75],
      },
    },
    analysis: {
      html: `<h2>Credit Analysis: OpenAI</h2>
<h3>Executive Summary</h3>
<p>OpenAI presents a <strong>B credit profile</strong> reflecting the balance between explosive revenue growth and significant operating losses typical of high-growth AI companies.</p>

<h3>Key Strengths</h3>
<ul>
<li>Market leader in generative AI with ChatGPT</li>
<li>Strong enterprise adoption of API services</li>
<li>Strategic partnership with Microsoft</li>
<li>Rapidly growing revenue base ($3B+ ARR)</li>
</ul>

<h3>Risk Factors</h3>
<ul>
<li>High operating losses and cash burn</li>
<li>Significant compute infrastructure costs</li>
<li>Intense competition from Google, Anthropic, Meta</li>
<li>Regulatory uncertainty around AI</li>
</ul>

<p class="text-sm text-gray-500 mt-4"><em>Analysis generated for demonstration purposes - December 2024</em></p>`,
    },
  },
  'anthropic': {
    company: {
      name: 'Anthropic PBC',
      rating: 'B',
      sector: 'Technology - AI/ML',
      coverage: 'Based on credit agreement analysis',
    },
    outlook: {
      outlook: 'Stable',
      description: 'Strong investor backing and growing enterprise revenue from Claude AI platform',
    },
    pod: {
      value: '3.25%',
      horizon: '1-year',
      change: '-0.10%',
      timeSeries: {
        labels: ['11/2021', '04/2022', '09/2022', '02/2023', '07/2023', '12/2023', '05/2024', '08/2024', '10/2024', '11/2024', '12/2024'],
        values: [5.0, 4.5, 4.2, 4.0, 3.8, 3.6, 3.5, 3.4, 3.35, 3.30, 3.25],
      },
    },
    spread: {
      value: '9.85%',
      horizon: '5 year loan',
      change: '-0.30%',
      timeSeries: {
        labels: ['11/2021', '04/2022', '09/2022', '02/2023', '07/2023', '12/2023', '05/2024', '08/2024', '10/2024', '11/2024', '12/2024'],
        values: [12.5, 12.0, 11.5, 11.0, 10.7, 10.5, 10.3, 10.1, 10.0, 9.90, 9.85],
      },
    },
    analysis: {
      html: `<h2>Credit Analysis: Anthropic</h2>
<h3>Executive Summary</h3>
<p>Anthropic demonstrates a <strong>B credit profile</strong> with stable outlook supported by strong investor backing from Google and Amazon, and growing enterprise adoption of Claude.</p>

<h3>Key Strengths</h3>
<ul>
<li>Leading AI safety research organization</li>
<li>Strong enterprise partnerships (Amazon, Google)</li>
<li>Growing API revenue from Claude</li>
<li>Substantial funding runway ($6B+ raised)</li>
</ul>

<h3>Risk Factors</h3>
<ul>
<li>Operating losses and cash burn</li>
<li>Competition from OpenAI, Google, Meta</li>
<li>High compute costs</li>
<li>Regulatory uncertainty</li>
</ul>

<p class="text-sm text-gray-500 mt-4"><em>Analysis generated for demonstration purposes - December 2024</em></p>`,
    },
  },
};

// Helper function to find matching dummy data
const findDummyReport = (query: string): any | null => {
  const lowerQuery = query.toLowerCase();
  for (const [key, report] of Object.entries(DUMMY_CREDIT_REPORTS)) {
    if (lowerQuery.includes(key)) {
      return report;
    }
  }
  return null;
};

export const CreditAnalysisPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = React.useState('');

  const {
    messages,
    activeTab,
    isLoading,
    showReport,
    creditReport,
    pollingStatus,
    isPolling,
    addMessage,
    updateMessage,
    setActiveTab,
    setIsLoading,
    setCurrentDocument,
    setPollingStatus,
    setCreditReport,
    setShowReport,
  } = useCreditAnalysisStore();

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Add user message
    addMessage({
      role: 'user',
      content: userMessage,
    });

    // Add loading assistant message
    const loadingMsg = addMessage({
      role: 'assistant',
      content: '',
      isLoading: true,
    });

    setIsLoading(true);

    // Check for dummy data match first (for demo purposes)
    const dummyReport = findDummyReport(userMessage);
    if (dummyReport) {
      // Simulate a brief loading delay for realism
      await new Promise(resolve => setTimeout(resolve, 1500));

      updateMessage(loadingMsg.id, {
        content: 'Analysis complete! Displaying credit report...',
        isLoading: false,
      });

      setCreditReport(dummyReport);
      setShowReport(true);
      setIsLoading(false);
      return;
    }

    // If no dummy data match, try the real API
    try {
      const response = await queryCreditAnalysis(userMessage);

      if (response.success && response.status === 'complete') {
        // Update with full response and show report
        updateMessage(loadingMsg.id, {
          content: 'Analysis complete! Displaying credit report...',
          isLoading: false,
        });

        setCreditReport(response as any);
        setShowReport(true);
      } else if (response.suggestions && response.suggestions.length > 0) {
        // Show suggestions if no complete analysis
        updateMessage(loadingMsg.id, {
          content: response.message + '\n\n' + response.suggestions.join('\n'),
          isLoading: false,
        });
      } else {
        updateMessage(loadingMsg.id, {
          content: response.message || 'I received your query. Please upload a credit document for full analysis.',
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Query error:', error);
      // For queries that don't match dummy data and API fails, show helpful message
      updateMessage(loadingMsg.id, {
        content: 'To analyze this company, please upload their credit agreement document using the Upload button below. For demo purposes, try one of the sample questions: First Brands, SpaceX, OpenAI, or Anthropic.',
        isLoading: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      addMessage({
        role: 'system',
        content: 'Please upload a PDF file only.',
      });
      return;
    }

    // Add file upload message
    addMessage({
      role: 'user',
      content: `Uploading ${file.name} for analysis...`,
      isFileUpload: true,
      fileName: file.name,
      fileSize: file.size,
    });

    // Add system message
    addMessage({
      role: 'system',
      content: 'Uploading and starting analysis...',
    });

    setIsLoading(true);

    try {
      const uploadResponse = await uploadCreditDocument(file);

      if (uploadResponse.success) {
        setCurrentDocument(uploadResponse.document_id, uploadResponse.extraction_id);

        addMessage({
          role: 'assistant',
          content: 'Document uploaded successfully. Starting credit analysis...',
        });

        // Start polling for results
        setPollingStatus(true, 'Processing document...');

        const results = await pollForResults(
          uploadResponse.document_id,
          (status) => setPollingStatus(true, status),
          60,
          5000
        );

        setPollingStatus(false);

        if (results && results.status === 'complete') {
          addMessage({
            role: 'assistant',
            content: 'Analysis complete! Displaying credit report...',
          });
          setCreditReport(results);
          setShowReport(true);
        } else {
          addMessage({
            role: 'assistant',
            content: 'Analysis is taking longer than expected. Please check back later or try uploading again.',
          });
        }
      } else {
        addMessage({
          role: 'assistant',
          content: 'Failed to upload document. Please try again.',
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      addMessage({
        role: 'assistant',
        content: 'Error uploading document. Please check your connection and try again.',
      });
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle sample question click
  const handleSampleQuestionClick = (question: string) => {
    setInputValue(question);
  };

  // Handle follow-up question from report view
  const handleFollowUp = (question: string) => {
    setShowReport(false);
    setInputValue(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  // Handle key press in input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Show report view if report is available and showReport is true
  if (showReport && creditReport) {
    return (
      <div className="h-[calc(100vh-8rem)]">
        <CreditReportView
          report={creditReport}
          onBack={() => setShowReport(false)}
          onFollowUp={handleFollowUp}
        />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-light text-[#212121]">
          Your Corporate Credit{' '}
          <span className="text-[#6366f1] font-semibold">Research Assistant</span>
        </h1>
        <p className="mt-2 text-[#616161]">
          Unlimited answers and analysis powered by the world's broadest and fastest risk engine
        </p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-white rounded-lg border border-[#e0e0e0] shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-[#e0e0e0]">
          <button
            onClick={() => setActiveTab('fast')}
            className={cn(
              'px-6 py-3 text-sm font-medium transition-colors relative',
              activeTab === 'fast'
                ? 'text-[#6366f1]'
                : 'text-[#757575] hover:text-[#424242]'
            )}
          >
            Fast Research
            {activeTab === 'fast' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6366f1]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('deep')}
            className={cn(
              'px-6 py-3 text-sm font-medium transition-colors relative',
              activeTab === 'deep'
                ? 'text-[#6366f1]'
                : 'text-[#757575] hover:text-[#424242]'
            )}
          >
            Deep Research
            {activeTab === 'deep' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6366f1]" />
            )}
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            // Sample Questions Grid
            <div className="h-full flex flex-col justify-center">
              <p className="text-center text-[#757575] mb-6">
                Start by asking a question or upload a credit document
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {SAMPLE_QUESTIONS.map((question, idx) => (
                  <SampleQuestionCard
                    key={idx}
                    question={question}
                    onClick={handleSampleQuestionClick}
                  />
                ))}
              </div>
            </div>
          ) : (
            // Chat Messages
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isPolling && (
                <div className="flex justify-center">
                  <div className="bg-[#f5f5f5] text-[#757575] text-sm px-4 py-2 rounded-full flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
                    {pollingStatus}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-[#e0e0e0] p-4">
          <div className="flex gap-3">
            {/* File Upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 border border-[#e0e0e0] rounded-lg text-[#424242] hover:bg-[#fafafa] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <DocumentArrowUpIcon className="w-5 h-5" />
              <span className="text-sm">Upload</span>
              <span className="text-xs bg-[#6366f1] text-white px-1.5 py-0.5 rounded">
                NEW
              </span>
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about credit ratings, analysis, or upload a document..."
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-[#e0e0e0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            />

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="px-4 py-2 bg-[#6366f1] text-white rounded-lg hover:bg-[#4f46e5] disabled:bg-[#e0e0e0] disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditAnalysisPage;
