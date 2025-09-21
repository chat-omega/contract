import React, { useState } from 'react';
import './App.css';

interface CreditTerms {
  loan_amount?: number;
  currency?: string;
  interest_rate?: string;
  interest_type?: string;
  payment_frequency?: string;
  maturity_date?: string;
  collateral_required?: boolean;
  collateral_description?: string;
  prepayment_allowed?: boolean;
  prepayment_penalty?: string;
  default_triggers?: string[];
  late_payment_fee?: string;
  borrower_name?: string;
  lender_name?: string;
  loan_purpose?: string;
  financial_covenants?: string[];
  governing_law?: string;
  summary: string;
  key_risks?: string[];
}

interface ExtractionResult {
  filename: string;
  terms: CreditTerms;
  risk_analysis?: string;
  extraction_timestamp: string;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'extract' | 'analyze'>('extract');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const endpoint = activeTab === 'extract' ? '/extract' : '/analyze';
      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to process file');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'Not specified';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : 'None';
    return String(value);
  };

  return (
    <div className="container">
      <header>
        <h1>Credit Agreement Analyzer</h1>
        <p>Upload a credit agreement to extract and analyze key terms</p>
      </header>

      <div className="upload-section">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'extract' ? 'active' : ''}`}
            onClick={() => setActiveTab('extract')}
          >
            Extract Terms
          </button>
          <button
            className={`tab ${activeTab === 'analyze' ? 'active' : ''}`}
            onClick={() => setActiveTab('analyze')}
          >
            Analyze & Assess Risk
          </button>
        </div>

        <div className="upload-area">
          <input
            type="file"
            accept=".pdf,.txt,.text"
            onChange={handleFileChange}
            id="file-input"
            style={{ display: 'none' }}
          />
          <label htmlFor="file-input" className="file-label">
            <div className="upload-icon">📄</div>
            <div>{file ? file.name : 'Click to select a credit agreement'}</div>
            <div className="file-hint">Supported formats: PDF, TXT</div>
          </label>
        </div>

        <button
          className="analyze-button"
          onClick={handleSubmit}
          disabled={!file || loading}
        >
          {loading ? 'Processing...' : activeTab === 'extract' ? 'Extract Terms' : 'Analyze Agreement'}
        </button>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}
      </div>

      {result && (
        <div className="results-section">
          <h2>Extraction Results</h2>
          <div className="result-header">
            <div>File: {result.filename}</div>
            <div>Processed: {new Date(result.extraction_timestamp).toLocaleString()}</div>
          </div>

          <div className="summary-box">
            <h3>Summary</h3>
            <p>{result.terms.summary}</p>
          </div>

          <div className="terms-grid">
            <div className="term-group">
              <h3>Loan Details</h3>
              <div className="term-item">
                <span className="term-label">Loan Amount:</span>
                <span className="term-value">
                  {result.terms.loan_amount ? 
                    `${result.terms.currency || ''} ${result.terms.loan_amount.toLocaleString()}` : 
                    'Not specified'}
                </span>
              </div>
              <div className="term-item">
                <span className="term-label">Interest Rate:</span>
                <span className="term-value">{formatValue(result.terms.interest_rate)}</span>
              </div>
              <div className="term-item">
                <span className="term-label">Interest Type:</span>
                <span className="term-value">{formatValue(result.terms.interest_type)}</span>
              </div>
              <div className="term-item">
                <span className="term-label">Payment Frequency:</span>
                <span className="term-value">{formatValue(result.terms.payment_frequency)}</span>
              </div>
              <div className="term-item">
                <span className="term-label">Maturity Date:</span>
                <span className="term-value">{formatValue(result.terms.maturity_date)}</span>
              </div>
              <div className="term-item">
                <span className="term-label">Loan Purpose:</span>
                <span className="term-value">{formatValue(result.terms.loan_purpose)}</span>
              </div>
            </div>

            <div className="term-group">
              <h3>Parties</h3>
              <div className="term-item">
                <span className="term-label">Borrower:</span>
                <span className="term-value">{formatValue(result.terms.borrower_name)}</span>
              </div>
              <div className="term-item">
                <span className="term-label">Lender:</span>
                <span className="term-value">{formatValue(result.terms.lender_name)}</span>
              </div>
              <div className="term-item">
                <span className="term-label">Governing Law:</span>
                <span className="term-value">{formatValue(result.terms.governing_law)}</span>
              </div>
            </div>

            <div className="term-group">
              <h3>Collateral & Security</h3>
              <div className="term-item">
                <span className="term-label">Collateral Required:</span>
                <span className="term-value">{formatValue(result.terms.collateral_required)}</span>
              </div>
              {result.terms.collateral_description && (
                <div className="term-item">
                  <span className="term-label">Collateral Description:</span>
                  <span className="term-value">{result.terms.collateral_description}</span>
                </div>
              )}
            </div>

            <div className="term-group">
              <h3>Prepayment & Penalties</h3>
              <div className="term-item">
                <span className="term-label">Prepayment Allowed:</span>
                <span className="term-value">{formatValue(result.terms.prepayment_allowed)}</span>
              </div>
              {result.terms.prepayment_penalty && (
                <div className="term-item">
                  <span className="term-label">Prepayment Penalty:</span>
                  <span className="term-value">{result.terms.prepayment_penalty}</span>
                </div>
              )}
              <div className="term-item">
                <span className="term-label">Late Payment Fee:</span>
                <span className="term-value">{formatValue(result.terms.late_payment_fee)}</span>
              </div>
            </div>
          </div>

          {result.terms.default_triggers && result.terms.default_triggers.length > 0 && (
            <div className="list-section">
              <h3>Default Triggers</h3>
              <ul>
                {result.terms.default_triggers.map((trigger, index) => (
                  <li key={index}>{trigger}</li>
                ))}
              </ul>
            </div>
          )}

          {result.terms.financial_covenants && result.terms.financial_covenants.length > 0 && (
            <div className="list-section">
              <h3>Financial Covenants</h3>
              <ul>
                {result.terms.financial_covenants.map((covenant, index) => (
                  <li key={index}>{covenant}</li>
                ))}
              </ul>
            </div>
          )}

          {result.terms.key_risks && result.terms.key_risks.length > 0 && (
            <div className="list-section risk-section">
              <h3>Key Risks</h3>
              <ul>
                {result.terms.key_risks.map((risk, index) => (
                  <li key={index}>{risk}</li>
                ))}
              </ul>
            </div>
          )}

          {result.risk_analysis && (
            <div className="risk-analysis">
              <h3>Risk Analysis</h3>
              <pre>{result.risk_analysis}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
