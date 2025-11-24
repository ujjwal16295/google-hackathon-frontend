import React from 'react';
import { CheckCircle } from 'lucide-react';
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
            {analysis.summary?.contractSummary || 'Contract Agreement'}
          </p>
        </div>
      </div>
      
      {analysis.summary?.keyHighlights && (
        <div>
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
    </div>
  );
};

export default SummarySection;