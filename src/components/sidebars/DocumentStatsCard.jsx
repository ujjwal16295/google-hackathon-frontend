import React from 'react';
import { Users, HelpCircle, Tag } from 'lucide-react';
 const DocumentStatsCard = ({ stats }) => {
    const {
      wordCount = 'N/A',
      risksCount = 0,
      vagueTermsCount = 0,
      keyTermsCount = 0,
      suggestedQuestionsCount = 0
    } = stats;
  
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Document Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Word Count</span>
            <span className="font-semibold text-gray-900">
              {typeof wordCount === 'number' ? wordCount.toLocaleString() : wordCount}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Risks Found</span>
            <span className="font-semibold text-gray-900">{risksCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Vague Terms</span>
            <span className="font-semibold text-gray-900">{vagueTermsCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Key Terms</span>
            <span className="font-semibold text-gray-900">{keyTermsCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Suggested Q&As</span>
            <span className="font-semibold text-gray-900">{suggestedQuestionsCount}</span>
          </div>
        </div>
      </div>
    );
  };
  export default DocumentStatsCard;