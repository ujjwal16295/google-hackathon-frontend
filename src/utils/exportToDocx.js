import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

export const exportToDocx = async (analysis, metadata) => {
  try {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: "Contract Analysis Report",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          
          // Document Info
          new Paragraph({
            text: `Document: ${metadata.source === 'file' ? metadata.originalFilename : 'Pasted Text'}`,
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: `Analyzed: ${new Date(metadata.processedAt).toLocaleString()}`,
            spacing: { after: 400 }
          }),

          // Overall Risk Assessment
          new Paragraph({
            text: "Overall Risk Assessment",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Risk Level: ${analysis.riskAssessment?.overallRisk || 'Medium'}`,
                bold: true
              }),
              new TextRun({
                text: ` | Risk Score: ${analysis.riskAssessment?.riskScore || 50}/100`,
                bold: true
              })
            ],
            spacing: { after: 400 }
          }),

          // Summary Section
          new Paragraph({
            text: "Document Overview",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Document Type: ", bold: true }),
              new TextRun(analysis.summary?.documentType || 'Legal Document')
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Main Purpose: ", bold: true }),
              new TextRun(analysis.summary?.mainPurpose || 'Contract Agreement')
            ],
            spacing: { after: 200 }
          }),

          // Key Highlights
          ...(analysis.summary?.keyHighlights ? [
            new Paragraph({
              text: "Key Highlights",
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 200, after: 200 }
            }),
            ...analysis.summary.keyHighlights.map(highlight => 
              new Paragraph({
                text: `✓ ${highlight}`,
                spacing: { after: 100 },
                bullet: { level: 0 }
              })
            )
          ] : []),

          // Favorable Terms (Green Risks)
          ...(analysis.riskAssessment?.greenRisks?.length > 0 ? [
            new Paragraph({
              text: "✓ Favorable Terms",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            ...analysis.riskAssessment.greenRisks.flatMap(risk => [
              new Paragraph({
                children: [
                  new TextRun({ text: `${risk.type}`, bold: true, size: 24, color: '059669' })
                ],
                spacing: { before: 200, after: 100 }
              }),
              new Paragraph({
                text: risk.description,
                spacing: { after: 100 }
              }),
              ...(risk.location ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Location: ", bold: true }),
                    new TextRun(risk.location)
                  ],
                  spacing: { after: 200 }
                })
              ] : [new Paragraph({ text: "", spacing: { after: 200 } })])
            ])
          ] : []),

          // Medium Risk Items (Yellow Risks)
          ...(analysis.riskAssessment?.yellowRisks?.length > 0 ? [
            new Paragraph({
              text: "⚠ Medium Risk Items",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            ...analysis.riskAssessment.yellowRisks.flatMap(risk => [
              new Paragraph({
                children: [
                  new TextRun({ text: `${risk.type}`, bold: true, size: 24, color: 'D97706' })
                ],
                spacing: { before: 200, after: 100 }
              }),
              new Paragraph({
                text: risk.description,
                spacing: { after: 100 }
              }),
              ...(risk.location ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Location: ", bold: true }),
                    new TextRun(risk.location)
                  ],
                  spacing: { after: 100 }
                })
              ] : []),
              ...(risk.recommendation ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Recommendation: ", bold: true }),
                    new TextRun(risk.recommendation)
                  ],
                  spacing: { after: 200 }
                })
              ] : [new Paragraph({ text: "", spacing: { after: 200 } })])
            ])
          ] : []),

          // Critical Issues (Red Risks)
          ...(analysis.riskAssessment?.redRisks?.length > 0 ? [
            new Paragraph({
              text: "🚨 Critical Issues",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            ...analysis.riskAssessment.redRisks.flatMap(risk => [
              new Paragraph({
                children: [
                  new TextRun({ text: `${risk.type}`, bold: true, size: 24, color: 'DC2626' })
                ],
                spacing: { before: 200, after: 100 }
              }),
              new Paragraph({
                text: risk.description,
                spacing: { after: 100 }
              }),
              ...(risk.location ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Location: ", bold: true }),
                    new TextRun(risk.location)
                  ],
                  spacing: { after: 100 }
                })
              ] : []),
              ...(risk.recommendation ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Urgent Action: ", bold: true }),
                    new TextRun(risk.recommendation)
                  ],
                  spacing: { after: 200 }
                })
              ] : [new Paragraph({ text: "", spacing: { after: 200 } })])
            ])
          ] : []),

          // Legal References
          ...(analysis.legalReferences?.length > 0 ? [
            new Paragraph({
              text: "Legal References",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            ...analysis.legalReferences.flatMap(ref => [
              new Paragraph({
                children: [
                  new TextRun({ text: `${ref.reference}`, bold: true, size: 24 }),
                  new TextRun({ 
                    text: ` [${ref.relevance} Relevance]`,
                    color: ref.relevance === 'High' ? 'DC2626' : ref.relevance === 'Medium' ? 'D97706' : '059669'
                  })
                ],
                spacing: { before: 200, after: 100 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Context: ", bold: true }),
                  new TextRun(ref.context)
                ],
                spacing: { after: 100 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Explanation: ", bold: true }),
                  new TextRun(ref.shortExplanation)
                ],
                spacing: { after: 200 }
              })
            ])
          ] : []),

          // Red Flags
          ...(analysis.redFlags?.length > 0 ? [
            new Paragraph({
              text: "🚩 Critical Red Flags",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            ...analysis.redFlags.map(flag => 
              new Paragraph({
                text: `⚠ ${flag}`,
                spacing: { after: 100 }
              })
            )
          ] : []),

          // Vague Terms
          ...(analysis.vagueTerms?.length > 0 ? [
            new Paragraph({
              text: "Terms Requiring Clarification",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            ...analysis.vagueTerms.flatMap(term => [
              new Paragraph({
                children: [
                  new TextRun({ text: `"${term.term}"`, bold: true, italics: true })
                ],
                spacing: { before: 200, after: 100 }
              }),
              new Paragraph({
                text: `Issue: ${term.issue}`,
                spacing: { after: 100 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Suggestion: ", bold: true }),
                  new TextRun(term.suggestion)
                ],
                spacing: { after: 200 }
              })
            ])
          ] : []),

          // Key Terms
          ...(analysis.keyTerms?.length > 0 ? [
            new Paragraph({
              text: "Key Terms Explained",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            ...analysis.keyTerms.flatMap(term => [
              new Paragraph({
                children: [
                  new TextRun({ text: `${term.term}`, bold: true, size: 24 }),
                  new TextRun({ text: ` [${term.category}] `, italics: true }),
                  new TextRun({ 
                    text: `[${term.importance} Importance]`,
                    color: term.importance === 'High' ? 'DC2626' : term.importance === 'Medium' ? 'D97706' : '059669'
                  })
                ],
                spacing: { before: 200, after: 100 }
              }),
              new Paragraph({
                text: term.explanation,
                spacing: { after: 200 }
              })
            ])
          ] : []),

          // Recommendations
          ...(analysis.recommendations?.length > 0 ? [
            new Paragraph({
              text: "Recommendations",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            ...analysis.recommendations.map(rec => 
              new Paragraph({
                text: `✓ ${rec}`,
                spacing: { after: 100 },
                bullet: { level: 0 }
              })
            )
          ] : []),

          // Footer
          new Paragraph({
            text: "---",
            alignment: AlignmentType.CENTER,
            spacing: { before: 600, after: 200 }
          }),
          new Paragraph({
            text: "Report generated by LegalClear AI",
            alignment: AlignmentType.CENTER,
            italics: true
          }),
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    const filename = `Contract_Analysis_${metadata.originalFilename || 'Report'}_${new Date().toISOString().split('T')[0]}.docx`;
    saveAs(blob, filename);
    
  } catch (error) {
    console.error('Error generating document:', error);
    alert('Failed to generate report. Please try again.');
  }
};