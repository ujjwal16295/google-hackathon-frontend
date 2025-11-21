import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const VoiceButton = ({ 
  text, 
  sectionName, 
  onSpeak, 
  onStop, 
  isSpeaking, 
  speakingSection,
  className = '' 
}) => {
  const isThisSectionSpeaking = isSpeaking && speakingSection === sectionName;
  
  const handleClick = () => {
    if (isThisSectionSpeaking) {
      onStop();
    } else {
      onSpeak(text, sectionName);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        isThisSectionSpeaking
          ? 'bg-red-100 text-red-700 hover:bg-red-200'
          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
      } ${className}`}
    >
      {isThisSectionSpeaking ? (
        <>
          <VolumeX className="w-5 h-5" />
          <span>Stop</span>
        </>
      ) : (
        <>
          <Volume2 className="w-5 h-5" />
          <span>Speak</span>
        </>
      )}
    </button>
  );
};

export default VoiceButton;