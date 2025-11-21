import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import VoiceButton from '../VoiceButton';
import { getSectionText } from '../../utils/sectionTextExtractor';

const RiskAssessmentSection = ({ 
  analysis, 
  isSpeaking, 
  speakingSection, 
  speakText, 
  stopSpeaking,
  getRiskColor 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Risk Assessment</h2>
        <div className="flex items-center gap-3">
          <VoiceButton
            text={getSectionText('risks', analysis)}
            sectionName="risks"
            onSpeak={speakText}
            onStop={stopSpeaking}
            isSpeaking={isSpeaking}
            speakingSection={speakingSection}
          />
          <div className={`px-4 py-2 rounded-full border ${getRiskColor(analysis.riskAssessment?.overallRisk)}`}>
            <span className="font-semibold">
              {analysis.riskAssessment?.overallRisk || 'Medium'} Risk
            </span>
          </div>
        </div>
      </div>
      
      {analysis.riskAssessment?.risks?.length > 0 ? (
        <div className="space-y-4">
          {analysis.riskAssessment.risks.map((risk, index) => (
            <div key={index} className={`p-6 rounded-lg border ${getRiskColor(risk.severity)}`}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold">{risk.type}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(risk.severity)}`}>
                  {risk.severity}
                </span>
              </div>
              <p className="text-gray-700 mb-3">{risk.description}</p>
              {risk.location && (
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Location:</strong> {risk.location}
                </p>
              )}
              <div className="bg-white/50 p-3 rounded border-l-4 border-blue-500">
                <p className="text-sm"><strong>Recommendation:</strong> {risk.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">No significant risks detected in this document.</p>
        </div>
      )}

      {/* Vague Terms */}
      {analysis.vagueTerms?.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Terms Requiring Clarification</h3>
          <div className="space-y-4">
            {analysis.vagueTerms.map((term, index) => (
              <div key={index} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">"{term.term}"</h4>
                <p className="text-yellow-700 text-sm mb-2">{term.issue}</p>
                <div className="bg-yellow-100 p-2 rounded border-l-4 border-yellow-400">
                  <p className="text-yellow-600 text-sm"><strong>Suggestion:</strong> {term.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Red Flags */}
      {analysis.redFlags?.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
            Critical Red Flags
          </h3>
          <div className="space-y-3">
            {analysis.redFlags.map((flag, index) => (
              <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg border-l-4 border-red-500">
                <p className="text-red-700 font-medium">{flag}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskAssessmentSection;