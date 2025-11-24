import React from 'react';
import { CheckCircle, FileCheck } from 'lucide-react';
import VoiceButton from '../VoiceButton';
import { getSectionText } from '../../utils/sectionTextExtractor';

const SummarySection = ({ analysis, isSpeaking, speakingSection, speakText, stopSpeaking }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Document Overview</h2>
        <VoiceButton
          text={getSectionText('summary', analysis)}
          sectionName="summary"
          onSpeak={speakText}
          onStop={stopSpeaking}
          isSpeaking={isSpeaking}
          speakingSection={speakingSection}
        />
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-gray-500 mb-1">Document Type</p>
          <p className="text-xl font-semibold text-gray-900">
            {analysis.summary?.documentType || 'Legal Document'}
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm font-medium text-gray-500 mb-1">Main Purpose</p>
          <p className="text-xl font-semibold text-gray-900">
            {analysis.summary?.mainPurpose || 'Contract Agreement'}
          </p>
        </div>
      </div>
      
      {/* Key Highlights Section */}
      {analysis.summary?.keyHighlights && analysis.summary.keyHighlights.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Highlights</h3>
          <div className="space-y-2">
            {analysis.summary.keyHighlights.map((highlight, index) => (
              <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* What's Included Section - NEW */}
      {analysis.summary?.whatIsIncluded && analysis.summary.whatIsIncluded.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <FileCheck className="w-5 h-5 mr-2 text-blue-600" />
            What's Covered in This Contract
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {analysis.summary.whatIsIncluded.map((item, index) => (
              <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg border border-blue-100">
                <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contract Summary Section */}
      {analysis.summary?.contractSummary && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Contract Summary</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {analysis.summary.contractSummary}
          </p>
        </div>
      )}
    </div>
  );
};

export default SummarySection;