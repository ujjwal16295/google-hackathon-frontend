"use client"
import React, { useState, useEffect, useRef } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { CheckCircle, AlertCircle, Shield, ArrowLeft, FileText, Users, Clock, Download, MessageCircle, HelpCircle, Tag, X, Volume2, VolumeX } from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableCell, TableRow, WidthType } from 'docx';
import { saveAs } from 'file-saver';



const AnalysisResultsPage = () => {

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
const [isSpeaking, setIsSpeaking] = useState(false);
const [currentAudio, setCurrentAudio] = useState(null);
const [speakingSection, setSpeakingSection] = useState(null);
const [speakingQuestionIndex, setSpeakingQuestionIndex] = useState(null);
// Add these new states near your other useState declarations

const inputCursorPos = useRef(null);
const messagesContainerRef = useRef(null);



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
  utterance.rate = 0.9; // Slightly slower for clarity
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
  
  // Speak
  window.speechSynthesis.speak(utterance);
};

// Function to stop speaking
const stopSpeaking = () => {
  window.speechSynthesis.cancel();
  setIsSpeaking(false);
  setSpeakingSection(null);
  setSpeakingQuestionIndex(null);
  setCurrentAudio(null);
};

useEffect(() => {
  // Load voices (needed for some browsers)
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

// Function to get section text content
const getSectionText = (section) => {
  switch(section) {
    case 'summary':
      return `Document Type: ${analysis.summary?.documentType}. Main Purpose: ${analysis.summary?.mainPurpose}. Key Highlights: ${analysis.summary?.keyHighlights?.join('. ')}`;
    
    case 'risks':
      const risksText = analysis.riskAssessment?.risks?.map(r => 
        `${r.type}. ${r.description}. Recommendation: ${r.recommendation}`
      ).join('. ');
      return `Overall Risk: ${analysis.riskAssessment?.overallRisk}. ${risksText}`;
    
    case 'terms':
      const termsText = analysis.keyTerms?.map(t => 
        `${t.term}. ${t.explanation}`
      ).join('. ');
      return termsText;
    
    default:
      return '';
  }
};

const exportToDocx = async () => {
  try {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: "Contract Analysis Report",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          
          // Document Info
          new Paragraph({
            text: `Document: ${metadata.source === 'file' ? metadata.originalFilename : 'Pasted Text'}`,
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: `Analyzed: ${new Date(metadata.processedAt).toLocaleString()}`,
            spacing: { after: 400 }
          }),

          // Overall Risk Assessment
          new Paragraph({
            text: "Overall Risk Assessment",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Risk Level: ${analysis.riskAssessment?.overallRisk || 'Medium'}`,
                bold: true
              }),
              new TextRun({
                text: ` | Risk Score: ${analysis.riskAssessment?.riskScore || 5}/10`,
                bold: true
              })
            ],
            spacing: { after: 400 }
          }),

          // Summary Section
          new Paragraph({
            text: "Document Overview",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Document Type: ", bold: true }),
              new TextRun(analysis.summary?.documentType || 'Legal Document')
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Main Purpose: ", bold: true }),
              new TextRun(analysis.summary?.mainPurpose || 'Contract Agreement')
            ],
            spacing: { after: 200 }
          }),

          // Key Highlights
          ...(analysis.summary?.keyHighlights ? [
            new Paragraph({
              text: "Key Highlights",
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 200, after: 200 }
            }),
            ...analysis.summary.keyHighlights.map(highlight => 
              new Paragraph({
                text: `✓ ${highlight}`,
                spacing: { after: 100 },
                bullet: { level: 0 }
              })
            )
          ] : []),

          // Risk Assessment Details
          ...(analysis.riskAssessment?.risks?.length > 0 ? [
            new Paragraph({
              text: "Identified Risks",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            ...analysis.riskAssessment.risks.flatMap(risk => [
              new Paragraph({
                children: [
                  new TextRun({ text: `${risk.type} `, bold: true, size: 24 }),
                  new TextRun({ 
                    text: `[${risk.severity} Risk]`, 
                    bold: true,
                    color: risk.severity === 'High' ? 'DC2626' : risk.severity === 'Medium' ? 'D97706' : '059669'
                  })
                ],
                spacing: { before: 200, after: 100 }
              }),
              new Paragraph({
                text: risk.description,
                spacing: { after: 100 }
              }),
              ...(risk.location ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Location: ", bold: true }),
                    new TextRun(risk.location)
                  ],
                  spacing: { after: 100 }
                })
              ] : []),
              new Paragraph({
                children: [
                  new TextRun({ text: "Recommendation: ", bold: true }),
                  new TextRun(risk.recommendation)
                ],
                spacing: { after: 200 }
              })
            ])
          ] : []),

          // Red Flags
          ...(analysis.redFlags?.length > 0 ? [
            new Paragraph({
              text: "🚩 Critical Red Flags",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            ...analysis.redFlags.map(flag => 
              new Paragraph({
                text: `⚠ ${flag}`,
                spacing: { after: 100 }
              })
            )
          ] : []),

          // Vague Terms
          ...(analysis.vagueTerms?.length > 0 ? [
            new Paragraph({
              text: "Terms Requiring Clarification",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            ...analysis.vagueTerms.flatMap(term => [
              new Paragraph({
                children: [
                  new TextRun({ text: `"${term.term}"`, bold: true, italics: true })
                ],
                spacing: { before: 200, after: 100 }
              }),
              new Paragraph({
                text: `Issue: ${term.issue}`,
                spacing: { after: 100 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Suggestion: ", bold: true }),
                  new TextRun(term.suggestion)
                ],
                spacing: { after: 200 }
              })
            ])
          ] : []),

          // Key Terms
          ...(analysis.keyTerms?.length > 0 ? [
            new Paragraph({
              text: "Key Terms Explained",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            ...analysis.keyTerms.flatMap(term => [
              new Paragraph({
                children: [
                  new TextRun({ text: `${term.term}`, bold: true, size: 24 }),
                  new TextRun({ text: ` [${term.category}] `, italics: true }),
                  new TextRun({ 
                    text: `[${term.importance} Importance]`,
                    color: term.importance === 'High' ? 'DC2626' : term.importance === 'Medium' ? 'D97706' : '059669'
                  })
                ],
                spacing: { before: 200, after: 100 }
              }),
              new Paragraph({
                text: term.explanation,
                spacing: { after: 200 }
              })
            ])
          ] : []),

          // Recommendations
          ...(analysis.recommendations?.length > 0 ? [
            new Paragraph({
              text: "Recommendations",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            ...analysis.recommendations.map(rec => 
              new Paragraph({
                text: `✓ ${rec}`,
                spacing: { after: 100 },
                bullet: { level: 0 }
              })
            )
          ] : []),



          // Footer
          new Paragraph({
            text: "---",
            alignment: AlignmentType.CENTER,
            spacing: { before: 600, after: 200 }
          }),
          new Paragraph({
            text: "Report generated by LegalClear AI",
            alignment: AlignmentType.CENTER,
            italics: true
          }),

        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    const filename = `Contract_Analysis_${metadata.originalFilename || 'Report'}_${new Date().toISOString().split('T')[0]}.docx`;
    saveAs(blob, filename);
    
  } catch (error) {
    console.error('Error generating document:', error);
    alert('Failed to generate report. Please try again.');
  }
};

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
  useEffect(() => {
    const savedResults = sessionStorage.getItem('analysisResults');
    if (savedResults) {
      try {
        const parsed = JSON.parse(savedResults);
        setAnalysisResults(parsed);
        
        // Load all chat sessions
        const sessions = JSON.parse(sessionStorage.getItem('chatSessions') || '[]');
        setChatSessions(sessions);
        
        // Load chat counter
        const savedCounter = sessionStorage.getItem('chatCounter');
        if (savedCounter) {
          setChatCounter(parseInt(savedCounter));
        }
        
      } catch (error) {
        console.error('Error loading saved results:', error);
        window.location.href = '/docupload';
      }
    } else {
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
  if (!analysisResults) {
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

  const ChatHistoryPanel = () => {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
          <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">Chat History</h3>
            <button
              onClick={() => setShowChatHistory(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
  
          <div className="flex-1 overflow-y-auto p-6">
            {chatSessions.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600">No chat history yet</p>
                <p className="text-gray-500 mt-2">Start asking questions about your contract</p>
              </div>
            ) : (
              <div className="space-y-3">
                {chatSessions.slice().reverse().map((session) => (
                  <div
                    key={session.id}
                    onClick={() => openChatFromHistory(session.id)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 mb-2">
                          {session.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {session.messages.length / 2} exchanges
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(session.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => deleteChatSession(session.id, e)}
                        className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
// Q&A Popup Component
const QAPopup = () => {
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isViewOnly = activeChat?.isViewOnly;
  
  // Add useEffect to restore cursor position
  useEffect(() => {
    if (inputRef.current && inputCursorPos.current !== null) {
      inputRef.current.setSelectionRange(inputCursorPos.current, inputCursorPos.current);
      inputCursorPos.current = null;
    }
  }, [popupQuestionInput]);

  const prevMessageCountRef = useRef(0);

useEffect(() => {
  const currentMessageCount = activeChat?.messages.length || 0;
  
  // Only scroll if a new message was added
  if (currentMessageCount > prevMessageCountRef.current) {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }
  
  prevMessageCountRef.current = currentMessageCount;
}, [activeChat?.messages]);
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Contract Q&A</h3>
            {isViewOnly && (
              <p className="text-sm text-gray-500 mt-1">View Only - This conversation is closed</p>
            )}
          </div>
          <button
            onClick={() => {
              stopSpeaking();
              closeAndSaveChat();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                  {activeChat?.messages.map((message, index) => (
            <div
              key={`msg-${index}`}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex flex-col max-w-[80%]">
                <div
                  className={`rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <p
                    className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp}
                  </p>
                </div>
                
                {message.role === 'assistant' && (
                  <button
                    onClick={() => {
                      const cacheKey = `chat-message-${activeChat.id}-${index}`;
                      if (isSpeaking && speakingSection === cacheKey) {
                        stopSpeaking();
                      } else {
                        speakText(message.content, cacheKey);
                      }
                    }}
                    className={`self-start mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
        isSpeaking && speakingSection === `chat-message-${activeChat.id}-${index}`
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isSpeaking && speakingSection === `chat-message-${activeChat.id}-${index}` ? (
                      <>
                        <VolumeX className="w-4 h-4" />
                        <span className="text-xs">Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" />
                        <span className="text-xs">Listen</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {isLoadingQuestion && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  <span className="text-gray-600">Analyzing your question...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {!isViewOnly && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={popupQuestionInput}
                onChange={(e) => {
  const scrollPos = messagesContainerRef.current?.scrollTop;
  inputCursorPos.current = e.target.selectionStart;
  setPopupQuestionInput(e.target.value);
  
  // Restore scroll position after state update
  requestAnimationFrame(() => {
    if (messagesContainerRef.current && scrollPos !== undefined) {
      messagesContainerRef.current.scrollTop = scrollPos;
    }
  });
}}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleQuestionSubmit(false, popupQuestionInput);
                    setPopupQuestionInput('');
                  }
                }}
                placeholder="Ask a question about your contract..."
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                disabled={isLoadingQuestion}
                autoFocus
              />
              <button
                onClick={() => {
                  handleQuestionSubmit(false, popupQuestionInput);
                  setPopupQuestionInput('');
                }}
                disabled={!popupQuestionInput.trim() || isLoadingQuestion}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoadingQuestion ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Ask
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send • This conversation maintains context
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
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
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Contract Analysis Results</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  {metadata.source === 'file' ? metadata.originalFilename : 'Pasted Text'}
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {analysis.summary?.estimatedReadingTime || '5 minutes'} read
                </span>
                <span className="flex items-center">
                  <Shield className="w-4 h-4 mr-1" />
                  {metadata.contentLength?.toLocaleString()} characters
                </span>
              </div>
            </div>
            <div className="flex gap-3">
            <button 
  onClick={exportToDocx}
  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
>
  <Download className="w-4 h-4 mr-2" />
  Export Report
</button>
              <button
                onClick={startNewAnalysis}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Analyze New Document
              </button>
            </div>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="flex overflow-x-auto">
            {[
              { id: 'summary', label: 'Summary', icon: FileText },
              { id: 'risks', label: 'Risk Assessment', icon: AlertCircle },
              { id: 'terms', label: 'Key Terms', icon: CheckCircle },
              { id: 'qna', label: 'Q&A', icon: MessageCircle },
              { id: 'flowchart', label: 'Contract Flow', icon: FileText }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
  stopSpeaking(); // Add this line
  setActiveSection(id);
}}                className={`flex items-center px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                  activeSection === id
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Summary Section */}
            {activeSection === 'summary' && (
  <>
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Document Overview</h2>
        <button
  onClick={() => {
    if (isSpeaking && speakingSection === 'summary') {
      stopSpeaking();
    } else {
      speakText(getSectionText('summary'), 'summary');
    }
  }}
  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
    isSpeaking && speakingSection === 'summary'
      ? 'bg-red-100 text-red-700 hover:bg-red-200'
      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
  }`}
>
  {isSpeaking && speakingSection === 'summary' ? (
    <>
      <VolumeX className="w-5 h-5" />
      Stop
    </>
  ) : (
    <>
      <Volume2 className="w-5 h-5" />
      Speak
    </>
  )}
</button>
      </div>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-500 mb-1">Document Type</p>
                      <p className="text-xl font-semibold text-gray-900">{analysis.summary?.documentType || 'Legal Document'}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-500 mb-1">Main Purpose</p>
                      <p className="text-xl font-semibold text-gray-900">{analysis.summary?.mainPurpose || 'Contract Agreement'}</p>
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
              </>
            )}

            {/* Risk Assessment Section */}
            {activeSection === 'risks' && (
  <>
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Risk Assessment</h2>
        <div className="flex items-center gap-3">
        <button
  onClick={() => {
    if (isSpeaking && speakingSection === 'risks') {
      stopSpeaking();
    } else {
      speakText(getSectionText('risks'), 'risks');
    }
  }}
  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
isSpeaking && speakingSection === 'risks'
      ? 'bg-red-100 text-red-700 hover:bg-red-200'
      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
  } `}
>
  {isSpeaking && speakingSection === 'risks' ? (
    <>
      <VolumeX className="w-5 h-5" />
      Stop
    </>
  ) : (
    <>
      <Volume2 className="w-5 h-5" />
      Speak
    </>
  )}
</button>
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
              </>
            )}

            {/* Key Terms Section */}
            {activeSection === 'terms' && (
  <>
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Key Terms Explained</h2>
        <button
  onClick={() => {
    if (isSpeaking && speakingSection === 'terms') {
      stopSpeaking();
    } else {
      speakText(getSectionText('terms'), 'terms');
    }
  }}
  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
   isSpeaking && speakingSection === 'terms'
      ? 'bg-red-100 text-red-700 hover:bg-red-200'
      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
  } `}
>
  { isSpeaking && speakingSection === 'terms' ? (
    <>
      <VolumeX className="w-5 h-5" />
      Stop
    </>
  ) : (
    <>
      <Volume2 className="w-5 h-5" />
      Speak
    </>
  )}
</button>
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
              </>
            )}

{/* Flowchart Section */}
{activeSection === 'flowchart' && !isFullscreenFlow && (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Contract Flow Visualization</h2>
      {analysis.flowchartData && (
        <button
          onClick={() => setIsFullscreenFlow(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Fullscreen
        </button>
      )}
    </div>
    
    {analysis.flowchartData ? (
      <div className="h-64 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center">
        <button
          onClick={() => setIsFullscreenFlow(true)}
          className="text-blue-600 hover:text-blue-700 text-center"
        >
          <FileText className="w-12 h-12 mx-auto mb-2" />
          <p>Click to view interactive flowchart</p>
        </button>
      </div>
    ) : (
      <div className="text-center py-8">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-lg text-gray-600">No flowchart data available</p>
      </div>
    )}
  </div>
)}

{/* Q&A Section */}
{activeSection === 'qna' && (
  <>
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Back button when viewing a suggested Q&A */}
      {viewingSuggestedQA && (
        <button
          onClick={() => setViewingSuggestedQA(null)}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Suggested Questions
        </button>
      )}

{/* Show individual suggested Q&A */}
{viewingSuggestedQA ? (
  <div>
    <div className="mb-4 flex items-center justify-between">
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(viewingSuggestedQA.category)}`}>
        {viewingSuggestedQA.category}
      </span>
      {/* Add voice button here when viewing the full answer */}
      <button
        onClick={() => {
          const cacheKey = `suggested-qa-${analysis.suggestedQuestions.findIndex(q => q.question === viewingSuggestedQA.question)}`;
          if (isSpeaking && speakingSection === cacheKey) {
            stopSpeaking();
          } else {
            speakText(viewingSuggestedQA.answer, cacheKey);
          }
        }}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
      isSpeaking && speakingSection === `suggested-qa-${analysis.suggestedQuestions.findIndex(q => q.question === viewingSuggestedQA.question)}`
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        }`}
      >
        {isSpeaking && speakingSection === `suggested-qa-${analysis.suggestedQuestions.findIndex(q => q.question === viewingSuggestedQA.question)}` ? (
          <>
            <VolumeX className="w-5 h-5" />
            Stop
          </>
        ) : (
          <>
            <Volume2 className="w-5 h-5" />
            Speak
          </>
        )}
      </button>
    </div>
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-sm font-medium text-gray-500 mb-2">Question</p>
        <p className="text-gray-900 font-medium">{viewingSuggestedQA.question}</p>
      </div>
      <div className="p-4 bg-green-50 rounded-lg">
        <p className="text-sm font-medium text-gray-500 mb-2">Answer</p>
        <p className="text-gray-900">{viewingSuggestedQA.answer}</p>
      </div>
    </div>
  </div>
) : (
        <>
          {/* Original Q&A interface */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Ask Questions About Your Contract</h2>
            <button
              onClick={() => setShowChatHistory(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Clock className="w-4 h-4" />
              View History ({chatSessions.length})
            </button>
          </div>
   
          <div className="mb-6">
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
    <p className="text-blue-800 text-sm">
      <strong>How it works:</strong> Click "Ask Question" to open a chat window. Ask follow-ups in the popup, 
      and when you close it, the entire chat is saved to history. Each chat is independent.
    </p>
  </div>
  
  <button
    onClick={() => startNewChat('')}
    className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-lg font-semibold"
  >
    <MessageCircle className="w-6 h-6 mr-3" />
    Ask Question
  </button>
</div>
{/* Suggested Questions */}
{analysis.suggestedQuestions && analysis.suggestedQuestions.length > 0 && (
  <div className="mb-8">
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
      <HelpCircle className="w-5 h-5 mr-2" />
      Suggested Questions (Click to view)
    </h3>
    <div className="grid gap-3">
      {analysis.suggestedQuestions.map((qa, index) => (
        <div
          key={index}
          onClick={() => handleSuggestedQuestion(qa)}
          className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group relative cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <p className="font-medium text-gray-900 group-hover:text-blue-700">{qa.question}</p>
              <p className="text-sm text-gray-600 mt-1">{qa.answer.slice(0, 100)}...</p>
            </div>
            <div className="flex flex-col gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(qa.category)}`}>
                {qa.category}
              </span>
              {/* Removed the voice button from here */}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

          {/* Empty State */}
          {chatSessions.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600 mb-2">No questions asked yet</p>
              <p className="text-gray-500">Ask questions above or click a suggested question to view answers</p>
            </div>
          )}
        </>
      )}
    </div>
  </>
)}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Overall Risk Score */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Overall Assessment</h3>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 relative">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="#e5e7eb"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="#3b82f6"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${2 * Math.PI * 32 * (1 - (analysis.riskAssessment?.riskScore || 5) / 10)}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">
                      {analysis.riskAssessment?.riskScore || 5}/10
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Risk Score</p>
                <p className={`text-sm font-medium mt-1 ${
                  (analysis.riskAssessment?.riskScore || 5) > 7 ? 'text-red-600' :
                  (analysis.riskAssessment?.riskScore || 5) > 4 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {(analysis.riskAssessment?.riskScore || 5) > 7 ? 'High Risk' :
                   (analysis.riskAssessment?.riskScore || 5) > 4 ? 'Medium Risk' : 'Low Risk'}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Document Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Word Count</span>
                  <span className="font-semibold text-gray-900">{analysis.summary?.wordCount?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Risks Found</span>
                  <span className="font-semibold text-gray-900">{analysis.riskAssessment?.risks?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vague Terms</span>
                  <span className="font-semibold text-gray-900">{analysis.vagueTerms?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Key Terms</span>
                  <span className="font-semibold text-gray-900">{analysis.keyTerms?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Suggested Q&As</span>
                  <span className="font-semibold text-gray-900">{analysis.suggestedQuestions?.length || 0}</span>
                </div>
              </div>
            </div>

{/* Quick Access to Suggested Questions in Sidebar */}
{analysis.suggestedQuestions && analysis.suggestedQuestions.length > 0 && activeSection !== 'qna' && (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
      <HelpCircle className="w-5 h-5 mr-2" />
      Quick Questions
    </h3>
    <div className="space-y-2">
      {analysis.suggestedQuestions.slice(0, 3).map((qa, index) => (
        <button
          key={index}
          onClick={() => {
            setActiveSection('qna');
            setTimeout(() => setViewingSuggestedQA(qa), 100);
          }}
          className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-gray-900">{qa.question}</span>
            <Tag className="w-3 h-3 text-gray-400" />
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(qa.category)}`}>
            {qa.category}
          </span>
        </button>
      ))}
      {analysis.suggestedQuestions.length > 3 && (
        <button
          onClick={() => setActiveSection('qna')}
          className="w-full text-center p-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          View all {analysis.suggestedQuestions.length} questions →
        </button>
      )}
    </div>
  </div>
)}

            {/* Parties Information */}
            {(metadata.parties?.party1 || metadata.parties?.party2) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Contract Parties
                </h3>
                <div className="space-y-2">
                  {metadata.parties.party1 && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Party 1</p>
                      <p className="font-semibold text-gray-900">{metadata.parties.party1}</p>
                    </div>
                  )}
                  {metadata.parties.party2 && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Party 2</p>
                      <p className="font-semibold text-gray-900">{metadata.parties.party2}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analysis Metadata */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Analysis Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Processed</span>
                  <span className="text-gray-900">{new Date(metadata.processedAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">AI Model</span>
                  <span className="text-gray-900">{metadata.model || 'Gemini 2.0 Flash'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Analysis ID</span>
                  <span className="text-gray-900 font-mono text-xs">{analysis.metadata?.analysisId?.slice(0, 8)}...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
               {/* Fullscreen Flowchart */}
               {isFullscreenFlow && (
          <div className="fixed inset-0 bg-white z-50 flex flex-col">
            {/* Fullscreen Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {analysis.flowchartData?.title || 'Contract Flow Visualization'}
                </h2>
                <button
                  onClick={() => setIsFullscreenFlow(false)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Analysis
                </button>
              </div>
            </div>
            
            {/* Fullscreen Flowchart */}
            <div className="flex-1 bg-gray-50">
              {analysis.flowchartData ? (
                <ReactFlow
                  nodes={analysis.flowchartData.nodes.map(node => ({
                    ...node,
                    data: { label: node.label, description: node.description },
                    style: getNodeStyle(node.type)
                  }))}
                  edges={analysis.flowchartData.edges}
                  fitView
                  attributionPosition="bottom-left"
                >
                  <Background />
                  <Controls />
                  <MiniMap />
                </ReactFlow>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No flowchart data available</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Add this just before the final closing </div> in your return statement */}
      {showChatHistory && <ChatHistoryPanel />}
{showQAPopup && <QAPopup />}
  </div>
  );
};

export default AnalysisResultsPage;