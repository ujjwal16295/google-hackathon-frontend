import React from 'react';
import { MessageCircle, HelpCircle, Clock, ArrowLeft } from 'lucide-react';
import VoiceButton from '../VoiceButton';

const QASection = ({ 
  analysis,
  viewingSuggestedQA,
  setViewingSuggestedQA,
  handleSuggestedQuestion,
  startNewChat,
  chatSessions,
  setShowChatHistory,
  getCategoryColor,
  isSpeaking,
  speakingSection,
  speakText,
  stopSpeaking
}) => {
  return (
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
            <VoiceButton
              text={viewingSuggestedQA.answer}
              sectionName={`suggested-qa-${analysis.suggestedQuestions.findIndex(q => q.question === viewingSuggestedQA.question)}`}
              onSpeak={speakText}
              onStop={stopSpeaking}
              isSpeaking={isSpeaking}
              speakingSection={speakingSection}
            />
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
  );
};

export default QASection;