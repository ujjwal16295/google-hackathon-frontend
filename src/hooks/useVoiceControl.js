import { useState, useEffect, useRef } from 'react';

export const useVoiceControl = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingSection, setSpeakingSection] = useState(null);
  const [speakingQuestionIndex, setSpeakingQuestionIndex] = useState(null);
  const currentUtteranceRef = useRef(null);
  const isStoppingRef = useRef(false);

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
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopSpeaking = () => {
    return new Promise((resolve) => {
      if (isStoppingRef.current) {
        resolve();
        return;
      }

      isStoppingRef.current = true;

      try {
        // Cancel all utterances
        window.speechSynthesis.cancel();
        
        // Reset state immediately
        setIsSpeaking(false);
        setSpeakingSection(null);
        setSpeakingQuestionIndex(null);
        currentUtteranceRef.current = null;
      } catch (error) {
        console.error('Error stopping speech:', error);
      }

      // Give browser time to fully cancel
      setTimeout(() => {
        isStoppingRef.current = false;
        resolve();
      }, 100);
    });
  };

  const speakText = async (text, sectionName = null, questionIndex = null) => {
    if (!text || typeof text !== 'string') {
      console.error('Invalid text provided to speakText');
      return;
    }

    const cacheKey = sectionName || `question-${questionIndex}`;
    
    // If already speaking this section, stop it
    if (isSpeaking && speakingSection === cacheKey) {
      await stopSpeaking();
      return;
    }
    
    // Stop any currently playing speech and wait
    await stopSpeaking();
    
    // Additional safety delay for clean transition
    await new Promise(resolve => setTimeout(resolve, 150));

    try {
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
        currentUtteranceRef.current = null;
      };
      
      utterance.onerror = (event) => {
        // Only log non-interruption errors
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
          console.error('Speech synthesis error:', event.error);
        }
        setIsSpeaking(false);
        setSpeakingSection(null);
        setSpeakingQuestionIndex(null);
        currentUtteranceRef.current = null;
      };
      
      currentUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error in speakText:', error);
      setIsSpeaking(false);
      setSpeakingSection(null);
      setSpeakingQuestionIndex(null);
      currentUtteranceRef.current = null;
    }
  };

  return {
    isSpeaking,
    speakingSection,
    speakingQuestionIndex,
    speakText,
    stopSpeaking
  };
};