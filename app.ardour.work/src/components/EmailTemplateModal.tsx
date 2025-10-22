import { useState, useEffect } from 'react';
import { X, Send, Save, Edit2, ChevronDown, Check, Copy } from 'lucide-react';
import { TargetCompany, ContactDetail, EmailTemplate } from '@/types';
import { Modal } from '@/components/ui';

interface EmailTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCompany: TargetCompany;
  contact: ContactDetail;
  onSend: (template: EmailTemplate, customizedContent: string) => void;
}

export function EmailTemplateModal({
  isOpen,
  onClose,
  targetCompany,
  contact,
  onSend
}: EmailTemplateModalProps) {
  // Mock email templates
  const templates: EmailTemplate[] = [
    {
      id: '1',
      name: 'Initial Introduction',
      subject: 'Partnership Opportunity with {{companyName}}',
      body: `Dear {{contactName}},

I hope this email finds you well. I'm reaching out from [Your Firm] regarding {{targetCompany}}.

We've been following your impressive growth in the {{sector}} sector and believe there could be significant synergies between {{targetCompany}} and our portfolio companies.

I would love to schedule a brief call to discuss potential partnership opportunities that could accelerate your growth trajectory. We have extensive experience in {{sector}} and have helped similar companies achieve 3-5x growth through strategic partnerships and operational improvements.

Would you be available for a 30-minute call next week? I'm happy to work around your schedule.

Best regards,
[Your Name]
[Your Title]
[Your Firm]`,
      category: 'introduction',
      variables: ['contactName', 'targetCompany', 'companyName', 'sector']
    },
    {
      id: '2',
      name: 'Follow-Up',
      subject: 'Following up: Partnership Discussion with {{companyName}}',
      body: `Hi {{contactName}},

I wanted to follow up on my previous email regarding potential partnership opportunities between {{targetCompany}} and [Your Firm].

I understand you're busy, so I'll keep this brief. We see significant value creation potential through:

• Access to our portfolio network of {{portfolioSize}} companies
• Operational expertise in scaling {{sector}} businesses
• Strategic partnerships that could expand your market reach by 2-3x

If you're interested, I'd be happy to share a brief case study of how we helped a similar company in your space achieve remarkable growth.

Could we schedule a quick 15-minute call this week?

Best,
[Your Name]`,
      category: 'follow-up',
      variables: ['contactName', 'targetCompany', 'companyName', 'sector', 'portfolioSize']
    },
    {
      id: '3',
      name: 'Meeting Request',
      subject: 'Meeting Request: {{targetCompany}} Growth Opportunities',
      body: `Dear {{contactName}},

Thank you for your interest in exploring opportunities with [Your Firm].

Based on our initial discussions, I believe a face-to-face meeting would be valuable to dive deeper into:

1. Your current growth priorities and challenges
2. Specific areas where our portfolio synergies could accelerate your growth
3. Potential partnership structures that align with your goals

I'm planning to be in {{location}} during [dates]. Would you be available for a meeting at your offices? I'm flexible with timing and happy to work around your schedule.

Alternatively, we could arrange a video conference if that's more convenient.

Looking forward to your response.

Regards,
[Your Name]
[Your Title]`,
      category: 'meeting-request',
      variables: ['contactName', 'targetCompany', 'location']
    },
    {
      id: '4',
      name: 'Due Diligence Request',
      subject: 'Information Request - {{targetCompany}} Partnership Evaluation',
      body: `Dear {{contactName}},

Thank you for our productive discussions regarding a potential partnership with {{targetCompany}}.

To move forward with our evaluation, we would appreciate if you could share the following information:

• Financial statements for the last 3 years
• Current organizational structure and key management bios
• Customer concentration and retention metrics
• Product roadmap and technology overview
• Any existing partnerships or investor agreements

We're happy to sign an NDA before receiving any confidential information. Our legal team can provide a standard mutual NDA, or we can review yours.

We're excited about the potential of working together and look forward to learning more about {{targetCompany}}.

Best regards,
[Your Name]
[Your Title]`,
      category: 'due-diligence',
      variables: ['contactName', 'targetCompany']
    }
  ];

  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(templates[0]);
  const [customizedBody, setCustomizedBody] = useState('');
  const [customizedSubject, setCustomizedSubject] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // Replace variables in template
  const replaceVariables = (text: string): string => {
    const variables: Record<string, string> = {
      contactName: contact.name,
      targetCompany: targetCompany.name,
      companyName: targetCompany.name,
      sector: targetCompany.sector,
      location: targetCompany.location,
      portfolioSize: '25' // Mock value
    };

    let result = text;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    });

    return result;
  };

  useEffect(() => {
    if (selectedTemplate) {
      setCustomizedSubject(replaceVariables(selectedTemplate.subject));
      setCustomizedBody(replaceVariables(selectedTemplate.body));
      setIsEditing(false);
    }
  }, [selectedTemplate]);

  const handleSend = () => {
    onSend(selectedTemplate, customizedBody);
  };

  const handleCopyToClipboard = () => {
    const emailContent = `Subject: ${customizedSubject}\n\n${customizedBody}`;
    navigator.clipboard.writeText(emailContent);
    setCopiedToClipboard(true);
    setTimeout(() => setCopiedToClipboard(false), 2000);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'introduction':
        return 'bg-blue-100 text-blue-700';
      case 'follow-up':
        return 'bg-yellow-100 text-yellow-700';
      case 'meeting-request':
        return 'bg-purple-100 text-purple-700';
      case 'due-diligence':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="flex flex-col h-[80vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Email Template</h2>
              <p className="text-sm text-slate-600 mt-1">
                To: {contact.name} ({contact.role}) at {targetCompany.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Template Selector */}
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="relative">
            <button
              onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
              className="w-full flex items-center justify-between px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="font-medium">{selectedTemplate.name}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(selectedTemplate.category)}`}>
                  {selectedTemplate.category}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            {showTemplateDropdown && (
              <div className="absolute z-10 mt-2 w-full bg-white border border-slate-200 rounded-lg shadow-lg">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowTemplateDropdown(false);
                    }}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-left">{template.name}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(template.category)}`}>
                        {template.category}
                      </span>
                    </div>
                    {selectedTemplate.id === template.id && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Email Content */}
        <div className="flex-1 px-6 py-4 overflow-y-auto">
          {/* Subject */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
            <input
              type="text"
              value={customizedSubject}
              onChange={(e) => setCustomizedSubject(e.target.value)}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-lg ${
                isEditing 
                  ? 'border-blue-300 focus:ring-2 focus:ring-blue-500' 
                  : 'border-slate-200 bg-slate-50'
              }`}
            />
          </div>

          {/* Body */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">Email Body</label>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                <span>{isEditing ? 'Preview' : 'Edit'}</span>
              </button>
            </div>
            <textarea
              value={customizedBody}
              onChange={(e) => setCustomizedBody(e.target.value)}
              disabled={!isEditing}
              rows={15}
              className={`w-full px-3 py-2 border rounded-lg font-mono text-sm ${
                isEditing 
                  ? 'border-blue-300 focus:ring-2 focus:ring-blue-500 bg-white' 
                  : 'border-slate-200 bg-slate-50'
              }`}
            />
          </div>

          {/* Variables Info */}
          {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Template variables:</span> This template uses dynamic variables that have been automatically filled with the target company and contact information.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyToClipboard}
                className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span>{copiedToClipboard ? 'Copied!' : 'Copy to Clipboard'}</span>
              </button>
              <button
                className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Draft</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Send Email</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}