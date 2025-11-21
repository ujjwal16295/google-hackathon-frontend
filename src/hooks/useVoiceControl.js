import { useState, useEffect, useRef } from 'react';

export const useVoiceControl = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingSection, setSpeakingSection] = useState(null);
  const [speakingQuestionIndex, setSpeakingQuestionIndex] = useState(null);
  const currentUtteranceRef = useRef(null);

  // Initialize voices
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    
    loadVoices();
    
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    // Cleanup on unmount
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speakText = (text, sectionName = null, questionIndex = null) => {
    const cacheKey = sectionName || `question-${questionIndex}`;
    
    // If already speaking this section, stop it
    if (isSpeaking && speakingSection === cacheKey) {
      stopSpeaking();
      return;
    }
    
    // Stop any currently playing speech
    window.speechSynthesis.cancel();
    
    // Create speech utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Try to use a good English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => 
      voice.lang.startsWith('en-') && voice.name.includes('Google')
    ) || voices.find(voice => voice.lang.startsWith('en-'));
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    // Set up event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingSection(cacheKey);
      setSpeakingQuestionIndex(questionIndex);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingSection(null);
      setSpeakingQuestionIndex(null);
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      setSpeakingSection(null);
      setSpeakingQuestionIndex(null);
    };
    
    currentUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSpeakingSection(null);
    setSpeakingQuestionIndex(null);
    currentUtteranceRef.current = null;
  };

  return {
    isSpeaking,
    speakingSection,
    speakingQuestionIndex,
    speakText,
    stopSpeaking
  };
};