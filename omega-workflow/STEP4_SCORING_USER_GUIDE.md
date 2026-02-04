# Step 4: Scoring Configuration - User Guide

## What is Confidence Scoring?

Confidence scoring is an optional feature that helps you assess the reliability of data extracted from documents. When enabled, our AI assigns confidence scores (0-100%) to each extracted field value, helping you identify which results may need human review.

## How to Use Step 4

### 1. Enable or Disable Scoring

When you reach Step 4 in the workflow wizard, you'll see a checkbox:

```
☑ Enable confidence scoring for this workflow
```

**If you don't need scoring:**
- Leave it unchecked
- Click "Next" to proceed to Step 5
- Scoring is completely optional

**If you want scoring:**
- Check the box
- The configuration options will appear below

### 2. Choose a Scoring Profile

After enabling scoring, you'll see four profile options:

#### Standard Profile (Recommended)
**Best for:** Most document types and general workflows

**Thresholds:**
- 🟢 High Confidence: 90% or higher
- 🟡 Medium Confidence: 70% - 89%
- 🔴 Low Confidence: Below 50%

**Use when:** You want balanced confidence requirements that work well for most situations.

#### Conservative Profile
**Best for:** Critical legal or financial documents

**Thresholds:**
- 🟢 High Confidence: 95% or higher
- 🟡 Medium Confidence: 80% - 94%
- 🔴 Low Confidence: Below 60%

**Use when:** Accuracy is paramount and you prefer stricter confidence requirements.

#### Aggressive Profile
**Best for:** High-volume processing where data capture is priority

**Thresholds:**
- 🟢 High Confidence: 85% or higher
- 🟡 Medium Confidence: 60% - 84%
- 🔴 Low Confidence: Below 40%

**Use when:** You want to maximize data capture and are willing to review more results.

#### Custom Profile
**Best for:** Advanced users with specific requirements

**Features:**
- Set your own confidence thresholds
- Three slider controls:
  - High Confidence Threshold (80-100%)
  - Medium Confidence Threshold (50-80%)
  - Low Confidence Threshold (0-50%)
- Real-time preview of threshold ranges

**Use when:** None of the preset profiles match your specific needs.

### 3. Understanding Confidence Levels

#### 🟢 High Confidence (e.g., 90%+)
**What it means:** The AI is very certain about this extraction.

**Your action:**
- Minimal or no review needed
- High reliability
- Can often be used directly

**Example:** "Invoice Number: 12345" extracted with 95% confidence from a clear, typed invoice.

#### 🟡 Medium Confidence (e.g., 70-89%)
**What it means:** The AI is fairly certain but recommends quick verification.

**Your action:**
- Quick review recommended
- Generally accurate but double-check
- Prioritize over low-confidence items

**Example:** "Amount: $1,234.56" extracted with 75% confidence from a slightly blurry document.

#### 🔴 Low Confidence (e.g., <70%)
**What it means:** The AI is uncertain and recommends careful review.

**Your action:**
- Requires careful verification
- May need manual correction
- Check against source document

**Example:** "Date: 01/15/2023" extracted with 45% confidence from handwritten text.

## Benefits of Using Scoring

### 1. Quality Assurance
Quickly identify which extractions need human review. Focus your attention where it matters most.

### 2. Prioritization
Review low-confidence extractions first. High-confidence data can often be used immediately.

### 3. Workflow Optimization
Track confidence patterns over time to identify:
- Fields that consistently have low confidence
- Document types that need better quality
- Areas where field definitions can be improved

### 4. Compliance & Audit Trails
Document confidence levels for:
- Regulatory compliance
- Quality management systems
- Audit requirements
- Process validation

## Step-by-Step Example

### Scenario: Creating a workflow for processing invoices

**Step 1: Enable Scoring**
```
✓ Enable confidence scoring for this workflow
```

**Step 2: Select Profile**
For invoices, you want good accuracy but also want to capture as much data as possible:
- Select: "Standard Profile (Recommended)"

**Step 3: Review in Step 5**
When you reach the Review step, you'll see:
```
Scoring Configuration
Status: ✓ Enabled
Profile: Standard Profile
  High Confidence: 90%+
  Medium Confidence: 70% - 89%
  Low Confidence: <50%
```

**Step 4: Save Workflow**
Your scoring configuration is saved with the workflow and will be applied to all documents processed with this workflow.

## When Scoring is Applied

After you create the workflow:

1. **Upload a document** and run it through this workflow
2. **AI extracts fields** and assigns confidence scores
3. **Results are classified** based on your thresholds:
   - Fields with 90%+ confidence → Tagged as "High Confidence"
   - Fields with 70-89% confidence → Tagged as "Medium Confidence"
   - Fields below 50% → Tagged as "Low Confidence"
4. **Review interface** shows color-coded confidence badges
5. **You can filter** by confidence level to prioritize review

## Tips for Choosing Thresholds

### Start with Standard
If you're unsure, start with the Standard profile. You can always edit the workflow later to adjust thresholds.

### Consider Your Use Case

**High-stakes documents** (contracts, legal, financial):
- Use Conservative profile
- Better to have more items flagged for review than miss errors

**High-volume processing** (receipts, forms, surveys):
- Use Aggressive profile
- Accept more risk in exchange for faster processing

**Mixed document types**:
- Use Standard profile
- Good balance for most situations

### Adjust Based on Results

After processing some documents:
1. Review the confidence distribution
2. Check accuracy of high-confidence extractions
3. Adjust thresholds if needed
4. Edit workflow to update scoring profile

## Custom Thresholds - Advanced

If you select the Custom profile, you'll see three sliders:

### High Confidence Threshold
**Range:** 80-100%
**Default:** 90%

**Set higher (e.g., 95%) if:**
- You want only the most certain extractions marked as "high"
- You have very strict quality requirements
- Documents are complex or varied

**Set lower (e.g., 85%) if:**
- You trust the AI more
- Documents are simple and consistent
- You want more items marked as "high confidence"

### Medium Confidence Threshold
**Range:** 50-80%
**Default:** 70%

**Set higher (e.g., 75%) if:**
- You want a narrower "medium" range
- You prefer more items flagged as "low confidence"

**Set lower (e.g., 60%) if:**
- You want a wider "medium" range
- You trust medium-confidence extractions more

### Low Confidence Threshold
**Range:** 0-50%
**Default:** 50%

**Set higher (e.g., 60%) if:**
- You want to catch more uncertain extractions
- Better to over-flag than under-flag

**Set lower (e.g., 40%) if:**
- You only want truly uncertain items flagged as "low"
- You're comfortable with more risk

## Frequently Asked Questions

### Q: Is scoring required?
**A:** No, scoring is completely optional. You can skip Step 4 or leave scoring disabled.

### Q: Can I change the scoring profile later?
**A:** Yes, you can edit the workflow at any time to change the scoring configuration.

### Q: Does scoring slow down extraction?
**A:** No, confidence scores are generated automatically during extraction with no additional processing time.

### Q: What if I'm not sure which profile to use?
**A:** Start with the Standard profile. It's designed to work well for most use cases, and you can always adjust later.

### Q: Can I have different scoring for different fields?
**A:** In the current version, scoring applies to all fields in the workflow. Field-specific thresholds may be added in future updates.

### Q: What happens if I disable scoring after using it?
**A:** Previously extracted data keeps its confidence scores, but new extractions won't be scored. You can re-enable scoring at any time.

### Q: Are confidence scores visible to end users?
**A:** That depends on your system configuration. Typically, confidence levels are shown in the review interface to help with validation.

## Best Practices

### 1. Start Simple
- Begin with Standard profile
- Don't customize until you understand your needs
- Review results before adjusting

### 2. Document Your Choices
- Note why you chose a particular profile
- Record any custom threshold decisions
- Helps with troubleshooting and training

### 3. Review Periodically
- Check if scoring is working as expected
- Adjust thresholds based on actual accuracy
- Consider document quality changes

### 4. Train Your Team
- Explain what confidence levels mean
- Provide guidelines for reviewing each level
- Share examples of good/bad confidence assignments

### 5. Use Consistently
- Apply similar scoring to similar workflows
- Makes comparison and analysis easier
- Reduces confusion for reviewers

## Troubleshooting

### Issue: Too many low-confidence results
**Solution:**
- Check document quality (scan resolution, clarity)
- Review field definitions (may be too complex)
- Consider Aggressive profile for this document type
- May need better source documents

### Issue: Everything is high confidence but results are wrong
**Solution:**
- This is rare but can happen with consistent formatting
- The AI may be confidently wrong
- Use Conservative profile to catch more items
- Review field definitions for clarity

### Issue: Not sure if scoring is helping
**Solution:**
- Track review time before and after
- Compare error rates
- Survey your review team
- A/B test with and without scoring

## Summary

Confidence scoring is a powerful tool for:
- ✅ Quality assurance
- ✅ Prioritizing review efforts
- ✅ Optimizing workflows
- ✅ Compliance documentation

Choose a profile that matches your needs:
- **Standard** - Good for most cases (recommended)
- **Conservative** - For critical documents
- **Aggressive** - For high-volume processing
- **Custom** - For specific requirements

Remember: Scoring is optional and can be adjusted at any time!
