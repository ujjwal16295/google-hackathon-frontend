import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, FileQuestion } from 'lucide-react';
import VoiceButton from '../VoiceButton';
import { getSectionText } from '../../utils/sectionTextExtractor';

const RiskAssessmentSection = ({ 
  analysis, 
  isSpeaking, 
  speakingSection, 
  speakText, 
  stopSpeaking 
}) => {
  const riskAssessment = analysis.riskAssessment || {};
  const greenRisks = riskAssessment.greenRisks || [];
  const yellowRisks = riskAssessment.yellowRisks || [];
  const redRisks = riskAssessment.redRisks || [];
  const vagueTerms = analysis.vagueTerms || [];

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
          <div className={`px-4 py-2 rounded-full border ${
            riskAssessment.overallRisk === 'High' ? 'text-red-600 bg-red-50 border-red-200' :
            riskAssessment.overallRisk === 'Low' ? 'text-green-600 bg-green-50 border-green-200' :
            'text-yellow-600 bg-yellow-50 border-yellow-200'
          }`}>
            <span className="font-semibold">
              {riskAssessment.overallRisk || 'Medium'} Risk
            </span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{greenRisks.length}</div>
          <div className="text-sm text-green-700 mt-1">Favorable Terms</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-yellow-600">{yellowRisks.length}</div>
          <div className="text-sm text-yellow-700 mt-1">Medium Risk</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-red-600">{redRisks.length}</div>
          <div className="text-sm text-red-700 mt-1">High Risk</div>
        </div>
      </div>
      
      {/* Green Risks - Favorable Terms */}
      {greenRisks.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
            Favorable Terms ({greenRisks.length})
          </h3>
          <div className="space-y-4">
            {greenRisks.map((risk, index) => (
              <div key={index} className="p-6 rounded-lg border border-green-200 bg-green-50">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-semibold text-green-900">{risk.type}</h4>
                  <div className="flex items-center px-3 py-1 rounded-full bg-green-100">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-sm font-medium text-green-700">Low Risk</span>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{risk.description}</p>
                {risk.location && (
                  <p className="text-sm text-gray-600">
                    <strong>Location:</strong> {risk.location}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Yellow Risks - Medium Risk */}
      {yellowRisks.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mr-2" />
            Medium Risk Items ({yellowRisks.length})
          </h3>
          <div className="space-y-4">
            {yellowRisks.map((risk, index) => (
              <div key={index} className="p-6 rounded-lg border border-yellow-200 bg-yellow-50">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-semibold text-yellow-900">{risk.type}</h4>
                  <div className="flex items-center px-3 py-1 rounded-full bg-yellow-100">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mr-1" />
                    <span className="text-sm font-medium text-yellow-700">Medium Risk</span>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{risk.description}</p>
                {risk.location && (
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Location:</strong> {risk.location}
                  </p>
                )}
                {risk.recommendation && (
                  <div className="bg-white/70 p-3 rounded border-l-4 border-yellow-500 text-black">
                    <p className="text-sm"><strong>Recommendation:</strong> {risk.recommendation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Red Risks - High Risk */}
      {redRisks.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
            Critical Issues ({redRisks.length})
          </h3>
          <div className="space-y-4">
            {redRisks.map((risk, index) => (
              <div key={index} className="p-6 rounded-lg border border-red-200 bg-red-50">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-semibold text-red-900">{risk.type}</h4>
                  <div className="flex items-center px-3 py-1 rounded-full bg-red-100">
                    <AlertCircle className="w-4 h-4 text-red-600 mr-1" />
                    <span className="text-sm font-medium text-red-700">High Risk</span>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{risk.description}</p>
                {risk.location && (
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Location:</strong> {risk.location}
                  </p>
                )}
                {risk.recommendation && (
                  <div className="bg-white/70 p-3 rounded border-l-4 border-red-500 text-black">
                    <p className="text-sm"><strong>Urgent Action:</strong> {risk.recommendation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vague Terms Section - NEW */}
      {vagueTerms.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <FileQuestion className="w-6 h-6 text-purple-600 mr-2" />
            Vague or Unclear Terms ({vagueTerms.length})
          </h3>
          <div className="space-y-4">
            {vagueTerms.map((vagueTerm, index) => (
              <div key={index} className="p-6 rounded-lg border border-purple-200 bg-purple-50">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-semibold text-purple-900">{vagueTerm.term}</h4>
                  <div className="flex items-center px-3 py-1 rounded-full bg-purple-100">
                    <FileQuestion className="w-4 h-4 text-purple-600 mr-1" />
                    <span className="text-sm font-medium text-purple-700">Needs Clarification</span>
                  </div>
                </div>
                
                {vagueTerm.context && (
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Context:</p>
                    <p className="text-gray-600 italic">"{vagueTerm.context}"</p>
                  </div>
                )}
                
                {vagueTerm.issue && (
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Issue:</p>
                    <p className="text-gray-700">{vagueTerm.issue}</p>
                  </div>
                )}
                
                {vagueTerm.suggestion && (
                  <div className="bg-white/70 p-3 rounded border-l-4 border-purple-500">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Suggestion:</p>
                    <p className="text-sm text-gray-700">{vagueTerm.suggestion}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Risks Found */}
      {greenRisks.length === 0 && yellowRisks.length === 0 && redRisks.length === 0 && vagueTerms.length === 0 && (
        <div className="text-center py-8">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg text-gray-600">No risk assessment data available.</p>
        </div>
      )}
    </div>
  );
};

export default RiskAssessmentSection;