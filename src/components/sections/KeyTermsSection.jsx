import React from 'react';
import { FileText, CheckCircle } from 'lucide-react';
import VoiceButton from '../VoiceButton';
import { getSectionText } from '../../utils/sectionTextExtractor';

const KeyTermsSection = ({ analysis, isSpeaking, speakingSection, speakText, stopSpeaking }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Key Terms Explained</h2>
        <VoiceButton
          text={getSectionText('terms', analysis)}
          sectionName="terms"
          onSpeak={speakText}
          onStop={stopSpeaking}
          isSpeaking={isSpeaking}
          speakingSection={speakingSection}
        />
      </div>
      
      {analysis.keyTerms?.length > 0 ? (
        <div className="space-y-4">
          {analysis.keyTerms.map((term, index) => (
            <div key={index} className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{term.category}</h3>
                  <p className="text-blue-600 font-medium">{term.term}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  term.importance === 'High' ? 'bg-red-100 text-red-700' :
                  term.importance === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {term.importance}
                </span>
              </div>
              <p className="text-gray-700">{term.explanation}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg text-gray-600">No specific key terms identified.</p>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations?.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recommendations</h3>
          <div className="grid gap-4">
            {analysis.recommendations.map((recommendation, index) => (
              <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-green-700">{recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default KeyTermsSection;