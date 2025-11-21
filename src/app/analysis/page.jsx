"use client"
import React, { useState, useEffect, useRef } from 'react';
import 'reactflow/dist/style.css';
import {  ArrowLeft, CheckCircle } from 'lucide-react';
import { useVoiceControl } from '../../hooks/useVoiceControl';
import VoiceButton from '../../components/VoiceButton';
import { exportToDocx } from '../../utils/exportToDocx';
import SummarySection from '../../components/sections/SummarySection';
import RiskAssessmentSection from '../../components/sections/RiskAssessmentSection';
import KeyTermsSection from '../../components/sections/KeyTermsSection';
import FlowchartSection from '../../components/sections/FlowchartSection';
import QASection from '../../components/sections/QASection';
import RiskScoreCard from '@/components/sidebars/RiskScoreCard';
import DocumentStatsCard from '@/components/sidebars/DocumentStatsCard';
import QuickQuestionsCard from '@/components/sidebars/QuickQuestionsCard';
import ContractPartiesCard from '@/components/sidebars/ContractPartiesCard';
import AnalysisMetadataCard from '@/components/sidebars/AnalysisMetadataCard';
import { PageHeader } from '@/components/PageHeader';
import { SectionNavigation } from '@/components/SectionNavigation';
import { FullscreenFlowchart } from '@/components/FullscreenFlowchart';
import { QAPopup } from '@/components/QAPopup';
import { ChatHistoryPanel } from '@/components/ChatHistoryPanel';
import { createClient } from '@supabase/supabase-js';
import LegalReferencesSection from '@/components/sections/LegalReferences';

const supabaseUrl = 'https://mnbluphajxxwlmzqmpnm.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);



const AnalysisResultsPage = () => {
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isLoadedFromSave, setIsLoadedFromSave] = useState(false);


  const [userEmail, setUserEmail] = useState(null);
const [isSaving, setIsSaving] = useState(false);
const [checkingAuth, setCheckingAuth] = useState(true);
const [chatCounter, setChatCounter] = useState(1);
const [analysisResults, setAnalysisResults] = useState(null);
const [activeSection, setActiveSection] = useState('summary');
const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
const [isFullscreenFlow, setIsFullscreenFlow] = useState(false);
const [viewingSuggestedQA, setViewingSuggestedQA] = useState(null);
  // Add this new state near your other useState declarations
const [showQAPopup, setShowQAPopup] = useState(false);
const [popupQuestionInput, setPopupQuestionInput] = useState(''); // NEW - separate state for popup
const [chatSessions, setChatSessions] = useState([]); // Store all chat sessions
const [showChatHistory, setShowChatHistory] = useState(false); // Toggle chat history view
const [activeChat, setActiveChat] = useState(null); // Current active chat with its messages
// Add these new states near your other useState declarations
useEffect(() => {
  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // User is not logged in, redirect to home
        window.location.href = '/';
        return;
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      window.location.href = '/';
      return;
    } finally {
      setCheckingAuth(false);
    }
  };

  checkAuth();
}, []);
useEffect(() => {
  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUserEmail(session.user.email);
    } else {
      // Fallback to localStorage
      const storedSession = localStorage.getItem('supabase_session');
      if (storedSession) {
        try {
          const parsedSession = JSON.parse(storedSession);
          setUserEmail(parsedSession.user.email);
        } catch (e) {
          console.error('Error parsing stored session:', e);
        }
      }
    }
  };
  
  checkUser();
}, []);
const { isSpeaking, speakingSection, speakText, stopSpeaking } = useVoiceControl();

  const getNodeStyle = (nodeType) => {
    const styles = {
      start: { background: '#10B981', color: 'white', borderRadius: '8px' },
      party: { background: '#3B82F6', color: 'white', borderRadius: '8px' },
      process: { background: '#F3F4F6', color: '#1F2937', border: '2px solid #6B7280' },
      decision: { background: '#FEF3C7', color: '#92400E', border: '2px solid #F59E0B' },
      end: { background: '#EF4444', color: 'white', borderRadius: '8px' }
    };
    return styles[nodeType] || styles.process;
  };
// In your Analysis page component, replace the useEffect that loads analysisResults
useEffect(() => {
  const savedResults = sessionStorage.getItem('analysisResults');
  
  if (!savedResults) {
    console.error('No analysis results found in session storage');
    window.location.href = '/docupload';
    return;
  }
  
  try {
    const parsed = JSON.parse(savedResults);
    console.log('Loaded analysis from session:', parsed);
    
    // Critical validation
    if (!parsed.analysis) {
      throw new Error('Missing analysis object');
    }
    
    // Ensure all required nested objects exist
    parsed.analysis = {
      summary: parsed.analysis.summary || {
        documentType: 'Legal Document',
        mainPurpose: 'Analysis',
        keyHighlights: [],
        whatIsIncluded: [],
        contractSummary: '',
        wordCount: 0,
        estimatedReadingTime: '5 minutes'
      },
      riskAssessment: parsed.analysis.riskAssessment || {
        overallRisk: 'Medium',
        riskScore: 50,
        greenPoints: 0,
        yellowPoints: 0,
        redPoints: 0,
        risks: []
      },
      keyTerms: parsed.analysis.keyTerms || [],
      vagueTerms: parsed.analysis.vagueTerms || [],
      legalReferences: parsed.analysis.legalReferences || [],
      recommendations: parsed.analysis.recommendations || [],
      redFlags: parsed.analysis.redFlags || [],
      suggestedQuestions: parsed.analysis.suggestedQuestions || [],
      flowchartData: parsed.analysis.flowchartData || null,
      metadata: parsed.analysis.metadata || {}
    };
    
    // Ensure metadata exists
    if (!parsed.metadata) {
      parsed.metadata = {
        source: 'unknown',
        processedAt: new Date().toISOString(),
        contentLength: 0,
        model: 'gemini-2.5-flash',
        parties: {}
      };
    }
    
    // Set the analysis results
    setAnalysisResults(parsed);
    
    // Check if loaded from saved data
    if (parsed.isLoadedFromSave) {
      setIsLoadedFromSave(true);
      console.log('Analysis loaded from saved data, serial:', parsed.savedSerial);
    }
    
    // Load chat sessions
    try {
      const sessions = JSON.parse(sessionStorage.getItem('chatSessions') || '[]');
      setChatSessions(Array.isArray(sessions) ? sessions : []);
    } catch (e) {
      console.warn('Failed to load chat sessions:', e);
      setChatSessions([]);
    }
    
    // Load chat counter
    try {
      const savedCounter = sessionStorage.getItem('chatCounter');
      if (savedCounter) {
        setChatCounter(parseInt(savedCounter, 10) || 1);
      }
    } catch (e) {
      console.warn('Failed to load chat counter:', e);
      setChatCounter(1);
    }
    
    console.log('Analysis page loaded successfully');
    
  } catch (error) {
    console.error('Error parsing analysis results:', error);
    console.error('Raw data:', savedResults);
    alert('Failed to load analysis data. The data may be corrupted.\n\nError: ' + error.message);
    window.location.href = '/docupload';
  }
}, []);
  const startNewAnalysis = () => {
    // Stop any speaking
    window.speechSynthesis.cancel();
    
    sessionStorage.removeItem('analysisResults');
    sessionStorage.removeItem('chatSessions');
    sessionStorage.removeItem('chatCounter');
    
    window.location.href = '/docupload';
  };
  const deleteChatSession = (chatId, e) => {
    e.stopPropagation();
    const updatedSessions = chatSessions.filter(s => s.id !== chatId);
    setChatSessions(updatedSessions);
    sessionStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Payment': 'bg-blue-100 text-blue-800',
      'Termination': 'bg-red-100 text-red-800',
      'Liability': 'bg-yellow-100 text-yellow-800',
      'Obligations': 'bg-green-100 text-green-800',
      'General': 'bg-gray-100 text-gray-800',
      'Performance': 'bg-purple-100 text-purple-800',
      'Intellectual Property': 'bg-indigo-100 text-indigo-800',
      'Confidentiality': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };
  const handleSaveAnalysis = async () => {
    if (!userEmail) {
      alert('Please log in to save analysis.');
      return;
    }
  
    setIsSaving(true);
    
    try {
      // Determine the serial number to use
      let serialToUse;
      if (isLoadedFromSave && analysisResults.savedSerial) {
        // This is an update to existing saved data
        serialToUse = analysisResults.savedSerial;
      } else {
        // This is a new save
        serialToUse = analysisResults?.userInfo?.nextSerial || 1;
      }
      
      // Prepare complete data including Q&A sessions
      const completeAnalysisData = {
        analysis: analysisResults.analysis,
        metadata: analysisResults.metadata,
        originalText: analysisResults.originalText,
        chatSessions: chatSessions,
        chatCounter: chatCounter,
        savedAt: new Date().toISOString(),
      };
      
      const response = await fetch('https://googel-hackathon-backend.onrender.com/api/save-user-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          serial: serialToUse,
          data: completeAnalysisData
        }),
      });
  
      const result = await response.json();
      
      if (result.success) {
        setShowSaveSuccess(true);
        setIsLoadedFromSave(true); // Mark as saved
        
        // Update the saved serial in analysisResults
        setAnalysisResults(prev => ({
          ...prev,
          isLoadedFromSave: true,
          savedSerial: serialToUse
        }));
        
        setTimeout(() => setShowSaveSuccess(false), 3000);
      } else {
        throw new Error(result.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving analysis:', error);
      alert('Failed to save analysis: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleQuestionSubmit = async (isFirstQuestion = false, questionText = '') => {
    const currentQuestion = questionText.trim();
    
    if (!currentQuestion) return;
  
    // Add user message to active chat immediately
    const userMessage = {
      role: 'user',
      content: currentQuestion,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setActiveChat(prev => ({
      ...prev,
      messages: [...(prev?.messages || []), userMessage]
    }));
    
    // Only clear popup input if it's NOT the first question
    if (!isFirstQuestion) {
      setPopupQuestionInput('');
    }
    
    setIsLoadingQuestion(true);
  
    try {
      // Send conversation history for follow-ups
      const conversationHistory = activeChat?.messages || [];
      
      const response = await fetch('https://googel-hackathon-backend.onrender.com/api/ask-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: currentQuestion,
          analysisId: analysisResults?.analysis?.metadata?.analysisId,
          context: analysisResults?.analysis,
          originalText: analysisResults?.originalText,
          conversationHistory: conversationHistory
        }),
      });
  
      const result = await response.json();
      
      if (result.success) {
        const aiMessage = {
          role: 'assistant',
          content: result.answer,
          timestamp: new Date().toLocaleTimeString()
        };
        
        setActiveChat(prev => ({
          ...prev,
          messages: [...prev.messages, aiMessage]
        }));
        
      } else {
        alert('Failed to get answer: ' + result.error);
        // Remove the user message if failed
        setActiveChat(prev => ({
          ...prev,
          messages: prev.messages.slice(0, -1)
        }));
      }
    } catch (error) {
      console.error('Error asking question:', error);
      alert('Error processing question. Please try again.');
      // Remove the user message if failed
      setActiveChat(prev => ({
        ...prev,
        messages: prev.messages.slice(0, -1)
      }));
    } finally {
      setIsLoadingQuestion(false);
    }
  };
  const startNewChat = (initialQuestion, initialAnswer = null) => {
    stopSpeaking(); // Stop any playing audio
    
    const newChat = {
      id: chatCounter,
      title: `Chat ${chatCounter}`,
      createdAt: new Date().toISOString(),
      messages: initialAnswer ? [
        {
          role: 'user',
          content: initialQuestion,
          timestamp: new Date().toLocaleTimeString()
        },
        {
          role: 'assistant',
          content: initialAnswer,
          timestamp: new Date().toLocaleTimeString()
        }
      ] : []
    };
    
    setActiveChat(newChat);
    setShowQAPopup(true);
    
    const newCounter = chatCounter + 1;
    setChatCounter(newCounter);
    sessionStorage.setItem('chatCounter', newCounter.toString());
    
    // Only submit question if there's an initial question and no answer
    if (initialQuestion && !initialAnswer) {
      handleQuestionSubmit(true, initialQuestion);
    }
    // If empty initial question, popup opens with empty chat ready for user input
  };
  const openChatFromHistory = (chatId) => {
    stopSpeaking(); // Stop any playing audio
    const chat = chatSessions.find(s => s.id === chatId);
    if (chat) {
      setActiveChat({ ...chat, isViewOnly: true });
      setShowQAPopup(true);
      setShowChatHistory(false);
    }
  };
  const closeAndSaveChat = () => {
    if (activeChat && activeChat.messages.length > 0 && !activeChat.isViewOnly) {
      // Only save if it's not a view-only chat (from history)
      const updatedSessions = [...chatSessions, activeChat];
      setChatSessions(updatedSessions);
      sessionStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
    }
    
    // Clear active chat
    setActiveChat(null);
    setShowQAPopup(false);
    setPopupQuestionInput('');
  };
  const handleSuggestedQuestion = (suggestedQA) => {
    stopSpeaking(); // Add this line to stop any playing audio
    setViewingSuggestedQA(suggestedQA);
  };
  if (checkingAuth || !analysisResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  const { analysis, metadata } = analysisResults;


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LC</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                LegalClear
              </span>
            </div>
            <button 
              onClick={startNewAnalysis}
              className="text-gray-600 hover:text-blue-600 transition-colors flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              New Analysis
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <PageHeader
  metadata={metadata}
  analysis={analysis}
  onExport={() => exportToDocx(analysis, metadata)}
  onNewAnalysis={startNewAnalysis}
  onSave={handleSaveAnalysis}  
  isSaving={isSaving}
  isLoadedFromSave={isLoadedFromSave} 
/>

<SectionNavigation
  activeSection={activeSection}
  onSectionChange={setActiveSection}
  onStopSpeaking={stopSpeaking}
/>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            
{/* Summary Section */}
{activeSection === 'summary' && (
  <SummarySection
    analysis={analysis}
    isSpeaking={isSpeaking}
    speakingSection={speakingSection}
    speakText={speakText}
    stopSpeaking={stopSpeaking}
  />
)}

{/* Risk Assessment Section */}
{activeSection === 'risks' && (
  <RiskAssessmentSection
    analysis={analysis}
    isSpeaking={isSpeaking}
    speakingSection={speakingSection}
    speakText={speakText}
    stopSpeaking={stopSpeaking}
    getRiskColor={getRiskColor}
  />
)}

{/* Key Terms Section */}
{activeSection === 'terms' && (
  <KeyTermsSection
    analysis={analysis}
    isSpeaking={isSpeaking}
    speakingSection={speakingSection}
    speakText={speakText}
    stopSpeaking={stopSpeaking}
  />
)}
{activeSection === 'legal' && (
  <LegalReferencesSection
    analysis={analysis}
    isSpeaking={isSpeaking}
    speakingSection={speakingSection}
    speakText={speakText}
    stopSpeaking={stopSpeaking}
  />
)}
{/* Flowchart Section */}
{activeSection === 'flowchart' && !isFullscreenFlow && (
  <FlowchartSection
    analysis={analysis}
    setIsFullscreenFlow={setIsFullscreenFlow}
  />
)}

{/* Q&A Section */}
{activeSection === 'qna' && (
  <QASection
    analysis={analysis}
    viewingSuggestedQA={viewingSuggestedQA}
    setViewingSuggestedQA={setViewingSuggestedQA}
    handleSuggestedQuestion={handleSuggestedQuestion}
    startNewChat={startNewChat}
    chatSessions={chatSessions}
    setShowChatHistory={setShowChatHistory}
    getCategoryColor={getCategoryColor}
    isSpeaking={isSpeaking}
    speakingSection={speakingSection}
    speakText={speakText}
    stopSpeaking={stopSpeaking}
  />
)}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
  <RiskScoreCard riskScore={analysis.riskAssessment?.riskScore} />
  
  <DocumentStatsCard stats={{
    wordCount: analysis.summary?.wordCount,
    risksCount: analysis.riskAssessment?.risks?.length,
    vagueTermsCount: analysis.vagueTerms?.length,
    keyTermsCount: analysis.keyTerms?.length,
    suggestedQuestionsCount: analysis.suggestedQuestions?.length
  }} />
  
  <QuickQuestionsCard
    questions={analysis.suggestedQuestions}
    onQuestionClick={(qa) => {
      setActiveSection('qna');
      setTimeout(() => setViewingSuggestedQA(qa), 100);
    }}
    onViewAll={() => setActiveSection('qna')}
    getCategoryColor={getCategoryColor}
    activeSection={activeSection}
  />
  
  <ContractPartiesCard parties={metadata.parties} />
  
  <AnalysisMetadataCard
    metadata={metadata}
    analysisId={analysis.metadata?.analysisId}
  />
</div>
        </div>
               {/* Fullscreen Flowchart */}
               {isFullscreenFlow && (
  <FullscreenFlowchart
    analysis={analysis}
    onClose={() => setIsFullscreenFlow(false)}
    getNodeStyle={getNodeStyle}
  />
)}
      </div>
      {/* Add this just before the final closing </div> in your return statement */}
      {showChatHistory && (
  <ChatHistoryPanel
    chatSessions={chatSessions}
    onClose={() => setShowChatHistory(false)}
    onOpenChat={openChatFromHistory}
    onDeleteChat={deleteChatSession}
  />
)}

{showQAPopup && (
  <QAPopup
    activeChat={activeChat}
    popupQuestionInput={popupQuestionInput}
    setPopupQuestionInput={setPopupQuestionInput}
    isLoadingQuestion={isLoadingQuestion}
    onClose={() => {
      stopSpeaking();
      closeAndSaveChat();
    }}
    onSubmitQuestion={handleQuestionSubmit}
    VoiceButtonComponent={VoiceButton}
    isSpeaking={isSpeaking}
    speakingSection={speakingSection}
    speakText={speakText}
    stopSpeaking={stopSpeaking}
  />
)}
{/* Save Success Popup */}
{showSaveSuccess && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-4 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Analysis Saved!</h3>
      <p className="text-gray-600 mb-4">
        Your analysis has been saved successfully
        {chatSessions.length > 0 && (
          <span className="block mt-1 text-sm">
            (including {chatSessions.length} chat session{chatSessions.length > 1 ? 's' : ''})
          </span>
        )}
      </p>
      <button
        onClick={() => setShowSaveSuccess(false)}
        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
      >
        Close
      </button>
    </div>
  </div>
)}
  </div>
  );
};

export default AnalysisResultsPage;