export const getSectionText = (section, analysis) => {
  switch(section) {
    case 'summary':
      return `Document Type: ${analysis.summary?.documentType}. Main Purpose: ${analysis.summary?.mainPurpose}. Key Highlights: ${analysis.summary?.keyHighlights?.join('. ')}. Contract Summary: ${analysis.summary?.contractSummary}`;
    
    case 'risks':
      const risksText = analysis.riskAssessment?.risks?.map(r => 
        `${r.type}. ${r.description}. Recommendation: ${r.recommendation}`
      ).join('. ');
      return `Overall Risk: ${analysis.riskAssessment?.overallRisk}. Risk Score: ${analysis.riskAssessment?.riskScore} out of 100. ${risksText}`;
    
    case 'terms':
      const termsText = analysis.keyTerms?.map(t => 
        `${t.term}. ${t.explanation}`
      ).join('. ');
      return `Key Terms Section. ${termsText || 'No key terms identified.'}`;
    
    case 'legal':
      const legalText = analysis.legalReferences?.map((ref, i) => 
        `Legal Reference ${i + 1}: ${ref.reference}. Context: ${ref.context}. Explanation: ${ref.shortExplanation}. Relevance: ${ref.relevance}`
      ).join('. ');
      return `Legal References Section. ${legalText || 'No legal references found in this document.'}`;
    
    default:
      return '';
  }
};