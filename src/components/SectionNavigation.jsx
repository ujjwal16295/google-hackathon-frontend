import React from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { FileText, Clock, Shield, Download, AlertCircle, CheckCircle, MessageCircle, ArrowLeft, Scale } from 'lucide-react';
export const SectionNavigation = ({ 
    activeSection, 
    onSectionChange,
    onStopSpeaking 
  }) => {
    const sections = [
      { id: 'summary', label: 'Summary', icon: FileText },
      { id: 'risks', label: 'Risk Assessment', icon: AlertCircle },
      { id: 'terms', label: 'Key Terms', icon: CheckCircle },
      { id: 'legal', label: 'Legal References', icon: Scale },
      { id: 'qna', label: 'Q&A', icon: MessageCircle },
      { id: 'flowchart', label: 'Contract Flow', icon: FileText }
    ];
  
    const handleSectionClick = (sectionId) => {
      if (onStopSpeaking) {
        onStopSpeaking();
      }
      onSectionChange(sectionId);
    };
  
    return (
      <div className="bg-white rounded-xl shadow-lg mb-8">
        <div className="flex overflow-x-auto">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleSectionClick(id)}
              className={`flex items-center px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
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
    );
  };
  