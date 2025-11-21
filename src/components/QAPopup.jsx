import React, { useRef, useEffect } from 'react';
import { X, MessageCircle } from 'lucide-react';

export const QAPopup = ({
    activeChat,
    popupQuestionInput,
    setPopupQuestionInput,
    isLoadingQuestion,
    onClose,
    onSubmitQuestion,
    VoiceButtonComponent,
    isSpeaking,
    speakingSection,
    speakText,
    stopSpeaking
  }) => {
    const inputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const inputCursorPos = useRef(null);
    const prevMessageCountRef = useRef(0);
    const isViewOnly = activeChat?.isViewOnly;
  
    // Restore cursor position
    useEffect(() => {
      if (inputRef.current && inputCursorPos.current !== null) {
        inputRef.current.setSelectionRange(inputCursorPos.current, inputCursorPos.current);
        inputCursorPos.current = null;
      }
    }, [popupQuestionInput]);
  
    // Auto-scroll on new messages
    useEffect(() => {
      const currentMessageCount = activeChat?.messages.length || 0;
      
      if (currentMessageCount > prevMessageCountRef.current) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
      
      prevMessageCountRef.current = currentMessageCount;
    }, [activeChat?.messages]);
  
    const handleInputChange = (e) => {
      const scrollPos = messagesContainerRef.current?.scrollTop;
      inputCursorPos.current = e.target.selectionStart;
      setPopupQuestionInput(e.target.value);
      
      // Restore scroll position after state update
      requestAnimationFrame(() => {
        if (messagesContainerRef.current && scrollPos !== undefined) {
          messagesContainerRef.current.scrollTop = scrollPos;
        }
      });
    };
  
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSubmitQuestion(false, popupQuestionInput);
        setPopupQuestionInput('');
      }
    };
  
    const handleSubmit = () => {
      onSubmitQuestion(false, popupQuestionInput);
      setPopupQuestionInput('');
    };
  
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
              onClick={onClose}
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
                  
                  {message.role === 'assistant' && VoiceButtonComponent && (
                    <VoiceButtonComponent
                      text={message.content}
                      sectionName={`chat-message-${activeChat.id}-${index}`}
                      onSpeak={speakText}
                      onStop={stopSpeaking}
                      isSpeaking={isSpeaking}
                      speakingSection={speakingSection}
                      size="small"
                      className="self-start mt-2"
                    />
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
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question about your contract..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  disabled={isLoadingQuestion}
                  autoFocus
                />
                <button
                  onClick={handleSubmit}
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