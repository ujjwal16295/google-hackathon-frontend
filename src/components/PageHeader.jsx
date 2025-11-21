import React from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { FileText, Clock, Shield, Download, AlertCircle, CheckCircle, MessageCircle, ArrowLeft } from 'lucide-react';

// 1. Page Header Component
export const PageHeader = ({ 
  metadata, 
  analysis, 
  onExport, 
  onNewAnalysis ,
  onSave, 
  isSaving,
  isLoadedFromSave
}) => {
  return (
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
  onClick={onSave}
  disabled={isSaving}
  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
>
  {isSaving ? (
    <>
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
      {isLoadedFromSave ? 'Updating...' : 'Saving...'}
    </>
  ) : (
    <>
      <Shield className="w-4 h-4 mr-2" />
      {isLoadedFromSave ? 'Update Analysis' : 'Save Analysis'}
    </>
  )}
</button>
          <button 
            onClick={onExport}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
          <button
            onClick={onNewAnalysis}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Analyze New Document
          </button>
        </div>
      </div>
    </div>
  );
};