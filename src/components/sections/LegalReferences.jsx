import React from 'react';
import { Scale, BookOpen } from 'lucide-react';
import VoiceButton from '../VoiceButton';
import { getSectionText } from '../../utils/sectionTextExtractor';

const LegalReferencesSection = ({ analysis, isSpeaking, speakingSection, speakText, stopSpeaking }) => {


  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Legal References</h2>
        <VoiceButton
          text={getSectionText('legal', analysis)}
          sectionName="legal"
          onSpeak={speakText}
          onStop={stopSpeaking}
          isSpeaking={isSpeaking}
          speakingSection={speakingSection}
        />
      </div>
      
      {analysis.legalReferences?.length > 0 ? (
        <div className="space-y-4">
          {analysis.legalReferences.map((ref, index) => (
            <div key={index} className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start">
                  <Scale className="w-5 h-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{ref.reference}</h3>
                    <p className="text-sm text-gray-600 mt-1">{ref.context}</p>
                  </div>
                </div>

              </div>
              <div className="ml-8 mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-gray-700 text-sm">{ref.shortExplanation}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg text-gray-600">No legal references found in this document.</p>
        </div>
      )}
    </div>
  );
};

export default LegalReferencesSection;