import React from 'react';
import { Users, HelpCircle, Tag } from 'lucide-react';
 const QuickQuestionsCard = ({ 
    questions = [], 
    onQuestionClick,
    onViewAll,
    getCategoryColor,
    activeSection 
  }) => {
    if (!questions || questions.length === 0 || activeSection === 'qna') {
      return null;
    }
  
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <HelpCircle className="w-5 h-5 mr-2" />
          Quick Questions
        </h3>
        <div className="space-y-2">
          {questions.slice(0, 3).map((qa, index) => (
            <button
              key={index}
              onClick={() => onQuestionClick(qa)}
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
          {questions.length > 3 && (
            <button
              onClick={onViewAll}
              className="w-full text-center p-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              View all {questions.length} questions →
            </button>
          )}
        </div>
      </div>
    );
  };
  export default QuickQuestionsCard;