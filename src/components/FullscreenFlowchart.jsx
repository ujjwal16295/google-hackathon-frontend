import React from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { FileText, Clock, Shield, Download, AlertCircle, CheckCircle, MessageCircle, ArrowLeft } from 'lucide-react';
export const FullscreenFlowchart = ({ 
    analysis, 
    onClose,
    getNodeStyle 
  }) => {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        {/* Fullscreen Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {analysis.flowchartData?.title || 'Contract Flow Visualization'}
            </h2>
            <button
              onClick={onClose}
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
                style: getNodeStyle ? getNodeStyle(node.type) : {}
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
    );
  };
  