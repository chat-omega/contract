import json
import os
from typing import Optional, List
from datetime import datetime
import tempfile

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import PyPDF2
from io import BytesIO

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class CreditTerms(BaseModel):
    """Extracted credit agreement terms"""
    
    loan_amount: Optional[float] = Field(None, description="Principal loan amount")
    currency: Optional[str] = Field(None, description="Currency of the loan")
    interest_rate: Optional[str] = Field(None, description="Interest rate (e.g., '5.5%', 'LIBOR + 2%')")
    interest_type: Optional[str] = Field(None, description="Fixed or Variable")
    payment_frequency: Optional[str] = Field(None, description="Payment frequency (monthly, quarterly, etc.)")
    maturity_date: Optional[str] = Field(None, description="Loan maturity date in YYYY-MM-DD format")
    
    collateral_required: Optional[bool] = Field(None, description="Whether collateral is required")
    collateral_description: Optional[str] = Field(None, description="Description of collateral if required")
    
    prepayment_allowed: Optional[bool] = Field(None, description="Whether prepayment is allowed")
    prepayment_penalty: Optional[str] = Field(None, description="Prepayment penalty terms if applicable")
    
    default_triggers: Optional[List[str]] = Field(None, description="List of events that trigger default")
    late_payment_fee: Optional[str] = Field(None, description="Late payment fee structure")
    
    borrower_name: Optional[str] = Field(None, description="Name of the borrower")
    lender_name: Optional[str] = Field(None, description="Name of the lender")
    
    loan_purpose: Optional[str] = Field(None, description="Purpose of the loan")
    
    financial_covenants: Optional[List[str]] = Field(None, description="List of financial covenants")
    
    governing_law: Optional[str] = Field(None, description="Governing law jurisdiction")
    
    summary: str = Field(..., description="Brief summary of the credit agreement")
    
    key_risks: Optional[List[str]] = Field(None, description="Key risks identified in the agreement")

def get_llm():
    """Get the configured LLM instance"""
    if os.getenv("GOOGLE_API_KEY"):
        return ChatGoogleGenerativeAI(model="gemini-2.0-flash-exp", temperature=0)
    elif os.getenv("OPENAI_API_KEY"):
        return ChatOpenAI(model="gpt-4o-mini", temperature=0)
    else:
        raise ValueError("No API key found. Please set GOOGLE_API_KEY or OPENAI_API_KEY")

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file"""
    try:
        pdf_file = BytesIO(file_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        text = ""
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text += page.extract_text()
        
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(e)}")

def extract_text_from_file(file: UploadFile) -> str:
    """Extract text from uploaded file based on file type"""
    content = file.file.read()
    
    if file.filename.lower().endswith('.pdf'):
        return extract_text_from_pdf(content)
    elif file.filename.lower().endswith(('.txt', '.text')):
        return content.decode('utf-8')
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type. Please upload PDF or TXT files.")

@app.get("/")
async def root():
    return {"status": "OK", "message": "Credit Agreement Analyzer API"}

@app.post("/extract")
async def extract_terms(file: UploadFile = File(...)):
    """Extract credit terms from uploaded agreement"""
    try:
        # Extract text from file
        text = extract_text_from_file(file)
        
        if len(text) < 100:
            raise HTTPException(status_code=400, detail="File appears to be empty or too short")
        
        # Truncate text if too long (for demo purposes)
        max_chars = 50000
        if len(text) > max_chars:
            text = text[:max_chars] + "... [truncated]"
        
        # Get LLM and extract structured data
        llm = get_llm()
        
        prompt = f"""Analyze the following credit agreement and extract all relevant terms. 
        Focus on financial terms, payment structures, and risk factors.
        
        Credit Agreement Text:
        {text}
        """
        
        # Extract structured data
        structured_llm = llm.with_structured_output(CreditTerms)
        extracted_terms = structured_llm.invoke(prompt)
        
        return JSONResponse(
            status_code=200,
            content={
                "filename": file.filename,
                "terms": extracted_terms.model_dump(),
                "extraction_timestamp": datetime.now().isoformat()
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.post("/analyze")
async def analyze_agreement(file: UploadFile = File(...)):
    """Analyze credit agreement and provide risk assessment"""
    try:
        # Extract text from file
        text = extract_text_from_file(file)
        
        # Truncate if needed
        max_chars = 50000
        if len(text) > max_chars:
            text = text[:max_chars] + "... [truncated]"
        
        # Get LLM
        llm = get_llm()
        
        # Extract terms first
        structured_llm = llm.with_structured_output(CreditTerms)
        extracted_terms = structured_llm.invoke(f"Extract credit terms from: {text}")
        
        # Perform risk analysis
        risk_prompt = f"""Based on these credit terms, provide a risk assessment:
        {extracted_terms.model_dump_json()}
        
        Provide:
        1. Overall risk level (Low/Medium/High)
        2. Key risk factors
        3. Recommendations for the borrower
        4. Any red flags or concerns
        """
        
        risk_analysis = llm.invoke(risk_prompt).content
        
        return JSONResponse(
            status_code=200,
            content={
                "filename": file.filename,
                "terms": extracted_terms.model_dump(),
                "risk_analysis": risk_analysis,
                "extraction_timestamp": datetime.now().isoformat()
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing file: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        llm = get_llm()
        return {"status": "healthy", "llm_configured": True}
    except:
        return {"status": "unhealthy", "llm_configured": False}