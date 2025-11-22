import React from 'react';
import { FileText, AlertTriangle, CheckCircle, AlertCircle, HelpCircle, Tag } from 'lucide-react';

const DocumentStatsCard = ({ stats }) => {
  const {
    wordCount = 'N/A',
    greenRisksCount = 0,
    yellowRisksCount = 0,
    redRisksCount = 0,
    keyTermsCount = 0,
    suggestedQuestionsCount = 0
  } = stats;

  const totalRisks = greenRisksCount + yellowRisksCount + redRisksCount;

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
          <span className="text-gray-600">Risks Count</span>
          <span className="font-semibold text-red-600">{redRisksCount}</span>
        </div>
        
        <div className="border-t border-gray-100 pt-3">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600 font-medium">Total Clauses</span>
            <span className="font-semibold text-gray-900">{totalRisks}</span>
          </div>
          
          <div className="flex justify-between pl-4">
            <span className="text-green-600 flex items-center text-sm">
              <CheckCircle className="w-3 h-3 mr-1" />
              Favorable
            </span>
            <span className="font-semibold text-green-600 text-sm">{greenRisksCount}</span>
          </div>
          
          <div className="flex justify-between pl-4">
            <span className="text-yellow-600 flex items-center text-sm">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Medium Risk
            </span>
            <span className="font-semibold text-yellow-600 text-sm">{yellowRisksCount}</span>
          </div>
          
          <div className="flex justify-between pl-4">
            <span className="text-red-600 flex items-center text-sm">
              <AlertCircle className="w-3 h-3 mr-1" />
              High Risk
            </span>
            <span className="font-semibold text-red-600 text-sm">{redRisksCount}</span>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-3">
          <div className="flex justify-between">
            <span className="text-gray-600 flex items-center">
              <Tag className="w-3 h-3 mr-1" />
              Key Terms
            </span>
            <span className="font-semibold text-gray-900">{keyTermsCount}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 flex items-center">
              <HelpCircle className="w-3 h-3 mr-1" />
              Suggested Q&As
            </span>
            <span className="font-semibold text-gray-900">{suggestedQuestionsCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentStatsCard;