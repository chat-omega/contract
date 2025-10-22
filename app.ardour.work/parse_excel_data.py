#!/usr/bin/env python3
"""
Excel Data Parser for Portfolio Companies
Extracts and transforms data from Shortlist PE.xlsx into structured JSON format
"""

import pandas as pd
import json
import re
from datetime import datetime
import uuid

def clean_company_name(name):
    """Clean company name"""
    if pd.isna(name):
        return "Unknown Company"
    return str(name).strip()

def clean_valuation(val):
    """Clean and standardize valuation strings"""
    if pd.isna(val):
        return None
    
    val_str = str(val).strip()
    if val_str == 'nan' or val_str == '':
        return None
    
    # Handle different formats like $23.00M, $1.98B, etc.
    if '$' in val_str:
        return val_str
    
    return None

def clean_date(date_val):
    """Clean and format dates"""
    if pd.isna(date_val):
        return None
    
    try:
        if isinstance(date_val, str):
            # Try parsing string dates
            parsed_date = pd.to_datetime(date_val)
        else:
            parsed_date = date_val
        
        return parsed_date.strftime('%Y-%m-%d')
    except:
        return None

def map_stage_to_standard(stage_info):
    """Map company stage information to standard stages"""
    if pd.isna(stage_info):
        return "Growth"
    
    stage_str = str(stage_info).lower()
    
    if 'profitable' in stage_str:
        return "Growth"
    elif 'generating revenue' in stage_str:
        return "Series B"
    elif 'seed' in stage_str:
        return "Seed"
    elif 'series a' in stage_str:
        return "Series A"
    elif 'series b' in stage_str:
        return "Series B"
    elif 'series c' in stage_str:
        return "Series C"
    elif 'growth' in stage_str:
        return "Growth"
    elif 'expansion' in stage_str:
        return "Growth"
    elif 'buyout' in stage_str or 'lbo' in stage_str:
        return "Buyout"
    elif 'merger' in stage_str or 'acquisition' in stage_str:
        return "Acquisition"
    else:
        return "Growth"

def map_status(stage_info):
    """Map stage info to status"""
    if pd.isna(stage_info):
        return "Active"
    
    stage_str = str(stage_info).lower()
    if 'exited' in stage_str or 'sold' in stage_str:
        return "Exited"
    elif 'ipo' in stage_str or 'public' in stage_str:
        return "IPO"
    else:
        return "Active"

def clean_sector(sector):
    """Clean and standardize sector information"""
    if pd.isna(sector):
        return "Technology"
    
    sector_str = str(sector).strip()
    
    # Map common sectors to cleaner names
    sector_mappings = {
        'business/productivity software': 'Enterprise Software',
        'financial software': 'FinTech',
        'network management software': 'Enterprise Software',
        'multimedia and design software': 'Media & Entertainment',
        'entertainment software': 'Media & Entertainment',
        'systems and information management': 'Enterprise Software',
        'discovery tools (healthcare)': 'HealthTech',
        'restaurants and bars': 'Consumer',
        'internet retail': 'E-commerce',
        'building products': 'Construction',
        'energy production': 'Energy',
        'industrial supplies and parts': 'Industrial',
        'home furnishings': 'Consumer',
        'other restaurants, hotels and leisure': 'Hospitality',
        'road': 'Infrastructure'
    }
    
    sector_lower = sector_str.lower()
    return sector_mappings.get(sector_lower, sector_str)

def generate_location():
    """Generate reasonable locations for portfolio companies"""
    locations = [
        "San Francisco, CA", "New York, NY", "London, UK", "Berlin, Germany",
        "Singapore", "Boston, MA", "Austin, TX", "Seattle, WA", "Toronto, Canada",
        "Paris, France", "Amsterdam, Netherlands", "Tel Aviv, Israel", 
        "Stockholm, Sweden", "Bangalore, India", "Sydney, Australia"
    ]
    
    import random
    return random.choice(locations)

def generate_description(sector, company_name):
    """Generate basic description from sector and company name"""
    sector_descriptions = {
        'Enterprise Software': 'Enterprise software solutions for business productivity',
        'FinTech': 'Financial technology platform and services',
        'HealthTech': 'Healthcare technology and medical solutions',
        'E-commerce': 'Online retail and e-commerce platform',
        'Media & Entertainment': 'Digital media and entertainment platform',
        'Consumer': 'Consumer products and services',
        'Industrial': 'Industrial technology and manufacturing solutions',
        'Energy': 'Energy and utilities technology platform',
        'Construction': 'Construction and building technology solutions',
        'Infrastructure': 'Infrastructure technology and services',
        'Hospitality': 'Hospitality and leisure services'
    }
    
    return sector_descriptions.get(sector, f"{sector} technology solutions")

def parse_pitchbook_format(df, fund_name):
    """Parse standard PitchBook format data"""
    companies = []
    
    for _, row in df.iterrows():
        company_name = clean_company_name(row.get('entity-hover'))
        if company_name == "Unknown Company":
            continue
            
        valuation = clean_valuation(row.get('table__col 2'))
        investment_date = clean_date(row.get('table__col'))
        sector = clean_sector(row.get('ellipsis 3'))
        stage_info = row.get('ellipsis 2')
        stage = map_stage_to_standard(stage_info)
        status = map_status(stage_info)
        location = generate_location()
        description = generate_description(sector, company_name)
        
        company = {
            'id': str(uuid.uuid4())[:8],
            'name': company_name,
            'sector': sector,
            'stage': stage,
            'location': location,
            'investmentDate': investment_date,
            'valuation': valuation,
            'status': status,
            'description': description
        }
        
        companies.append(company)
    
    return {
        'id': fund_name.lower().replace(' ', '-'),
        'name': fund_name,
        'companies': companies
    }

def parse_edelweiss_format(df, fund_name):
    """Parse Edelweiss-specific format"""
    companies = []
    
    for _, row in df.iterrows():
        company_name = clean_company_name(row.get('Company Name'))
        if company_name == "Unknown Company":
            continue
            
        valuation = clean_valuation(row.get('Deal Size'))
        investment_date = clean_date(row.get('Deal Date'))
        sector = clean_sector(row.get('Industry'))
        stage_info = row.get('Company Stage')
        deal_type = row.get('Deal Type')
        
        # Map deal type to stage
        if pd.notna(deal_type):
            if 'growth' in str(deal_type).lower() or 'expansion' in str(deal_type).lower():
                stage = "Growth"
            elif 'buyout' in str(deal_type).lower() or 'lbo' in str(deal_type).lower():
                stage = "Buyout"
            elif 'merger' in str(deal_type).lower() or 'acquisition' in str(deal_type).lower():
                stage = "Acquisition"
            else:
                stage = "Growth"
        else:
            stage = map_stage_to_standard(stage_info)
        
        status = map_status(stage_info)
        location = generate_location()
        description = generate_description(sector, company_name)
        
        company = {
            'id': str(uuid.uuid4())[:8],
            'name': company_name,
            'sector': sector,
            'stage': stage,
            'location': location,
            'investmentDate': investment_date,
            'valuation': valuation,
            'status': status,
            'description': description
        }
        
        companies.append(company)
    
    return {
        'id': fund_name.lower().replace(' ', '-'),
        'name': fund_name,
        'companies': companies
    }

def main():
    print("🚀 Starting Excel data parsing...")
    
    excel_file = "Shortlist PE.xlsx"
    xl = pd.ExcelFile(excel_file)
    
    all_portfolios = []
    total_companies = 0
    
    print(f"📊 Found {len(xl.sheet_names)} funds to process")
    
    for sheet_name in xl.sheet_names:
        print(f"\n🔄 Processing {sheet_name}...")
        
        try:
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            
            # Determine format and parse accordingly
            if 'Company Name' in df.columns:
                # Edelweiss format
                portfolio = parse_edelweiss_format(df, sheet_name)
            else:
                # Standard PitchBook format
                portfolio = parse_pitchbook_format(df, sheet_name)
            
            companies_count = len(portfolio['companies'])
            total_companies += companies_count
            all_portfolios.append(portfolio)
            
            print(f"✅ Processed {companies_count} companies from {sheet_name}")
            
        except Exception as e:
            print(f"❌ Error processing {sheet_name}: {str(e)}")
            continue
    
    print(f"\n📈 Summary:")
    print(f"   Total funds: {len(all_portfolios)}")
    print(f"   Total companies: {total_companies}")
    
    # Save to JSON file
    output_file = "parsed_portfolio_data.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_portfolios, f, indent=2, ensure_ascii=False)
    
    print(f"💾 Data saved to {output_file}")
    
    # Print sample data for verification
    print(f"\n🔍 Sample data from first fund:")
    if all_portfolios:
        first_fund = all_portfolios[0]
        print(f"   Fund: {first_fund['name']}")
        print(f"   Companies: {len(first_fund['companies'])}")
        if first_fund['companies']:
            sample_company = first_fund['companies'][0]
            print(f"   Sample company: {sample_company['name']}")
            print(f"   Sector: {sample_company['sector']}")
            print(f"   Stage: {sample_company['stage']}")
            print(f"   Valuation: {sample_company['valuation']}")
    
    return all_portfolios

if __name__ == "__main__":
    portfolios = main()