import React from 'react';
import { FileText } from 'lucide-react';

const FlowchartSection = ({ analysis, setIsFullscreenFlow }) => {
  return (
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
  );
};

export default FlowchartSection;