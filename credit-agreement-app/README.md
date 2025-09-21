# Credit Agreement Analyzer

A web application for uploading and analyzing credit agreements to extract key terms and assess risks.

## Features

- **File Upload**: Support for PDF and text file uploads
- **Terms Extraction**: Automatically extract key credit terms including:
  - Loan amount and currency
  - Interest rates and payment schedules
  - Maturity dates
  - Collateral requirements
  - Default triggers
  - Financial covenants
  - Prepayment terms
- **Risk Analysis**: Comprehensive risk assessment with recommendations
- **Clean UI**: User-friendly interface with organized display of extracted information

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Either a Google Gemini API key (free tier available) OR an OpenAI API key

### Setup

1. **Configure API Keys**
   
   Edit the `.env` file and add your API key:
   ```bash
   # Choose one:
   GOOGLE_API_KEY=your-google-api-key-here
   # OR
   OPENAI_API_KEY=your-openai-api-key-here
   ```

   Get your API keys from:
   - Google Gemini: https://makersuite.google.com/app/apikey (free tier available)
   - OpenAI: https://platform.openai.com/api-keys

2. **Build and Run with Docker**
   ```bash
   docker-compose up --build
   ```

3. **Access the Application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:8080
   - API Documentation: http://localhost:8080/docs

## Usage

1. Open http://localhost:3001 in your browser
2. Click the upload area to select a credit agreement (PDF or TXT)
3. Choose either:
   - **Extract Terms**: Quick extraction of key terms
   - **Analyze & Assess Risk**: Full analysis with risk assessment
4. Click the respective button to process
5. View the extracted terms and analysis results

## Sample File

A sample credit agreement (`sample_credit_agreement.txt`) is included for testing.

## API Endpoints

- `POST /extract`: Extract terms from uploaded file
- `POST /analyze`: Extract terms and perform risk analysis
- `GET /health`: Health check endpoint

## Project Structure

```
credit-agreement-app/
├── backend/
│   ├── main.py           # FastAPI backend with extraction logic
│   ├── pyproject.toml    # Python dependencies
│   └── Dockerfile        # Backend container configuration
├── frontend/
│   ├── src/
│   │   ├── App.tsx       # Main React component
│   │   └── App.css       # Styling
│   ├── package.json      # Node dependencies
│   └── Dockerfile        # Frontend container configuration
├── docker-compose.yml    # Docker orchestration
├── .env                 # Environment configuration
└── sample_credit_agreement.txt  # Sample test file
```

## Technology Stack

- **Backend**: FastAPI, LangChain, PyPDF2
- **Frontend**: React, TypeScript, Vite
- **AI Models**: Google Gemini or OpenAI GPT
- **Deployment**: Docker, Docker Compose

## Ports

- Frontend: 3001
- Backend: 8080

## Troubleshooting

If you encounter issues:

1. **API Key Issues**: Ensure your API key is correctly set in `.env`
2. **Port Conflicts**: Check if ports 3001 or 8080 are already in use
3. **Docker Issues**: Try `docker-compose down` then `docker-compose up --build`
4. **File Upload Issues**: Ensure files are in PDF or TXT format

## Development

To modify the extraction fields or add new features:

1. Backend modifications: Edit `backend/main.py`
2. Frontend changes: Edit `frontend/src/App.tsx`
3. Rebuild containers: `docker-compose up --build`

## License

This project is based on the legal-tech-chat project and adapted for credit agreement analysis.