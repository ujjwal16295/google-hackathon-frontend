import React from 'react';
import { Users, HelpCircle, Tag } from 'lucide-react';
 const AnalysisMetadataCard = ({ metadata, analysisId }) => {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Analysis Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Processed</span>
            <span className="text-gray-900">
              {new Date(metadata.processedAt).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">AI Model</span>
            <span className="text-gray-900">{metadata.model || 'Gemini 2.0 Flash'}</span>
          </div>

        </div>
      </div>
    );
  };
  export default AnalysisMetadataCard;