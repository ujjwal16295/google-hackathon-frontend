"use client"
import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Shield, ArrowLeft, FileText, Users, Clock, Download, MessageCircle } from 'lucide-react';

const AnalysisResultsPage = () => {
  const [analysisResults, setAnalysisResults] = useState(null);
  const [activeSection, setActiveSection] = useState('summary');
  const [questionInput, setQuestionInput] = useState('');
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [qnaHistory, setQnaHistory] = useState([]);

  useEffect(() => {
    // Load results from session storage
    const savedResults = sessionStorage.getItem('analysisResults');
    if (savedResults) {
      try {
        const parsed = JSON.parse(savedResults);
        setAnalysisResults(parsed);
      } catch (error) {
        console.error('Error loading saved results:', error);
        // Redirect back to upload if no valid data
        window.location.href = '/docupload';
      }
    } else {
      // No results found, redirect to upload
      window.location.href = '/docupload';
    }
  }, []);

  const startNewAnalysis = () => {
    sessionStorage.removeItem('analysisResults');
    window.location.href = '/docupload';
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleQuestionSubmit = async () => {
    if (!questionInput.trim()) return;

    setIsLoadingQuestion(true);
    try {
      const response = await fetch('http://localhost:3001/api/ask-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: questionInput,
          analysisId: analysisResults?.analysis?.metadata?.analysisId,
          context: analysisResults?.analysis
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setQnaHistory([...qnaHistory, {
          question: questionInput,
          answer: result.answer,
          timestamp: new Date().toLocaleTimeString()
        }]);
        setQuestionInput('');
      } else {
        alert('Failed to get answer: ' + result.error);
      }
    } catch (error) {
      console.error('Error asking question:', error);
      alert('Error processing question. Please try again.');
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  if (!analysisResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  const { analysis, metadata } = analysisResults;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LC</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                LegalClear
              </span>
            </div>
            <button 
              onClick={startNewAnalysis}
              className="text-gray-600 hover:text-blue-600 transition-colors flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              New Analysis
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
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
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
              <button
                onClick={startNewAnalysis}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Analyze New Document
              </button>
            </div>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="flex overflow-x-auto">
            {[
              { id: 'summary', label: 'Summary', icon: FileText },
              { id: 'risks', label: 'Risk Assessment', icon: AlertCircle },
              { id: 'terms', label: 'Key Terms', icon: CheckCircle },
              { id: 'qna', label: 'Q&A', icon: MessageCircle }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
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

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Summary Section */}
            {activeSection === 'summary' && (
              <>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Document Overview</h2>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-500 mb-1">Document Type</p>
                      <p className="text-xl font-semibold text-gray-900">{analysis.summary?.documentType || 'Legal Document'}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-500 mb-1">Main Purpose</p>
                      <p className="text-xl font-semibold text-gray-900">{analysis.summary?.mainPurpose || 'Contract Agreement'}</p>
                    </div>
                  </div>
                  
                  {analysis.summary?.keyHighlights && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Highlights</h3>
                      <div className="space-y-2">
                        {analysis.summary.keyHighlights.map((highlight, index) => (
                          <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Risk Assessment Section */}
            {activeSection === 'risks' && (
              <>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Risk Assessment</h2>
                    <div className={`px-4 py-2 rounded-full border ${getRiskColor(analysis.riskAssessment?.overallRisk)}`}>
                      <span className="font-semibold">
                        {analysis.riskAssessment?.overallRisk || 'Medium'} Risk
                      </span>
                    </div>
                  </div>
                  
                  {analysis.riskAssessment?.risks?.length > 0 ? (
                    <div className="space-y-4">
                      {analysis.riskAssessment.risks.map((risk, index) => (
                        <div key={index} className={`p-6 rounded-lg border ${getRiskColor(risk.severity)}`}>
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-semibold">{risk.type}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(risk.severity)}`}>
                              {risk.severity}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-3">{risk.description}</p>
                          {risk.location && (
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Location:</strong> {risk.location}
                            </p>
                          )}
                          <div className="bg-white/50 p-3 rounded border-l-4 border-blue-500">
                            <p className="text-sm"><strong>Recommendation:</strong> {risk.recommendation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                      <p className="text-lg text-gray-600">No significant risks detected in this document.</p>
                    </div>
                  )}

                  {/* Vague Terms */}
                  {analysis.vagueTerms?.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Terms Requiring Clarification</h3>
                      <div className="space-y-4">
                        {analysis.vagueTerms.map((term, index) => (
                          <div key={index} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h4 className="font-semibold text-yellow-800 mb-2">"{term.term}"</h4>
                            <p className="text-yellow-700 text-sm mb-2">{term.issue}</p>
                            <div className="bg-yellow-100 p-2 rounded border-l-4 border-yellow-400">
                              <p className="text-yellow-600 text-sm"><strong>Suggestion:</strong> {term.suggestion}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Red Flags */}
                  {analysis.redFlags?.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
                        Critical Red Flags
                      </h3>
                      <div className="space-y-3">
                        {analysis.redFlags.map((flag, index) => (
                          <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg border-l-4 border-red-500">
                            <p className="text-red-700 font-medium">{flag}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Key Terms Section */}
            {activeSection === 'terms' && (
              <>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Terms Explained</h2>
                  
                  {analysis.keyTerms?.length > 0 ? (
                    <div className="space-y-4">
                      {analysis.keyTerms.map((term, index) => (
                        <div key={index} className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{term.category}</h3>
                              <p className="text-blue-600 font-medium">{term.term}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              term.importance === 'High' ? 'bg-red-100 text-red-700' :
                              term.importance === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {term.importance}
                            </span>
                          </div>
                          <p className="text-gray-700">{term.explanation}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg text-gray-600">No specific key terms identified.</p>
                    </div>
                  )}

                  {/* Recommendations */}
                  {analysis.recommendations?.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Recommendations</h3>
                      <div className="grid gap-4">
                        {analysis.recommendations.map((recommendation, index) => (
                          <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-start">
                              <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                              <p className="text-green-700">{recommendation}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Q&A Section */}
            {activeSection === 'qna' && (
              <>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Ask Questions About Your Contract</h2>
                  
                  {/* Question Input */}
                  <div className="mb-6">
                    <div className="flex gap-3 text-black">
                      <input
                        type="text"
                        value={questionInput}
                        onChange={(e) => setQuestionInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleQuestionSubmit()}
                        placeholder="Ask about payment terms, termination clauses, liability, etc."
                        className="flex-1 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoadingQuestion}
                      />
                      <button
                        onClick={handleQuestionSubmit}
                        disabled={!questionInput.trim() || isLoadingQuestion}
                        className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {isLoadingQuestion ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          'Ask'
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Q&A History */}
                  {qnaHistory.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Previous Questions</h3>
                      {qnaHistory.map((qa, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="bg-blue-50 p-3 rounded-lg mb-3">
                            <p className="font-medium text-blue-900">Q: {qa.question}</p>
                            <p className="text-xs text-blue-600 mt-1">{qa.timestamp}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-gray-800">{qa.answer}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {qnaHistory.length === 0 && (
                    <div className="text-center py-8">
                      <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg text-gray-600 mb-2">No questions asked yet</p>
                      <p className="text-gray-500">Ask specific questions about your contract terms, clauses, or obligations.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Overall Risk Score */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Overall Assessment</h3>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 relative">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="#e5e7eb"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="#3b82f6"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${2 * Math.PI * 32 * (1 - (analysis.riskAssessment?.riskScore || 5) / 10)}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">
                      {analysis.riskAssessment?.riskScore || 5}/10
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Risk Score</p>
                <p className={`text-sm font-medium mt-1 ${
                  (analysis.riskAssessment?.riskScore || 5) > 7 ? 'text-red-600' :
                  (analysis.riskAssessment?.riskScore || 5) > 4 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {(analysis.riskAssessment?.riskScore || 5) > 7 ? 'High Risk' :
                   (analysis.riskAssessment?.riskScore || 5) > 4 ? 'Medium Risk' : 'Low Risk'}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Document Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Word Count</span>
                  <span className="font-semibold text-black">{analysis.summary?.wordCount?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Risks Found</span>
                  <span className="font-semibold text-black">{analysis.riskAssessment?.risks?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vague Terms</span>
                  <span className="font-semibold text-black">{analysis.vagueTerms?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Key Terms</span>
                  <span className="font-semibold text-black">{analysis.keyTerms?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Parties Information */}
            {(metadata.parties?.party1 || metadata.parties?.party2) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Contract Parties
                </h3>
                <div className="space-y-2">
                  {metadata.parties.party1 && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Party 1</p>
                      <p className="font-semibold text-gray-900">{metadata.parties.party1}</p>
                    </div>
                  )}
                  {metadata.parties.party2 && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Party 2</p>
                      <p className="font-semibold text-gray-900">{metadata.parties.party2}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analysis Metadata */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Analysis Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Processed</span>
                  <span className="text-gray-900">{new Date(metadata.processedAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">AI Model</span>
                  <span className="text-gray-900">{metadata.model || 'Gemini 2.0 Flash'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Analysis ID</span>
                  <span className="text-gray-900 font-mono text-xs">{analysis.metadata?.analysisId?.slice(0, 8)}...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResultsPage;