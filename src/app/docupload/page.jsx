"use client"
import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Eye, Users, ArrowRight, Shield, Clock, Loader2 } from 'lucide-react';

const DocumentUploadPage = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [parties, setParties] = useState({ party1: '', party2: '' });
  const [activeTab, setActiveTab] = useState('upload');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisMessage, setAnalysisMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      alert('Please upload a PDF, DOC, DOCX, or TXT file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }

    setUploadedFile(file);
    simulateUpload();
  };

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const simulateAnalysisProgress = () => {
    const messages = [
      'Extracting text from document...',
      'Analyzing contract structure...',
      'Identifying key terms and clauses...',
      'Assessing risks and potential issues...',
      'Generating plain language explanations...',
      'Finalizing analysis report...'
    ];

    let messageIndex = 0;
    let progress = 0;

    const updateProgress = () => {
      progress += Math.random() * 15 + 5;
      if (progress > 95) progress = 95;
      
      setAnalysisProgress(progress);
      
      if (messageIndex < messages.length - 1 && progress > (messageIndex + 1) * 15) {
        messageIndex++;
        setAnalysisMessage(messages[messageIndex]);
      }
    };

    setAnalysisMessage(messages[0]);
    const interval = setInterval(updateProgress, 800);
    
    return interval;
  };

  const handleSubmit = async () => {
    if (!uploadedFile && !textInput.trim()) {
      alert('Please upload a document or paste contract text.');
      return;
    }

    // Validate text input length
    if (activeTab === 'text' && textInput.trim().length < 100) {
      alert('Please provide at least 100 characters for meaningful analysis.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    const progressInterval = simulateAnalysisProgress();

    try {
      const formData = new FormData();
      
      if (activeTab === 'upload' && uploadedFile) {
        formData.append('document', uploadedFile);
      } else if (activeTab === 'text' && textInput.trim()) {
        formData.append('text', textInput.trim());
      }
      
      // Add parties information
      formData.append('parties', JSON.stringify(parties));

      const response = await fetch('http://localhost:3001/api/analyze-document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Analysis failed');
      }

      const result = await response.json();
      
      if (result.success) {
        // Complete the progress
        clearInterval(progressInterval);
        setAnalysisProgress(100);
        setAnalysisMessage('Analysis complete! Redirecting...');
        
        // Store results in sessionStorage
        sessionStorage.setItem('analysisResults', JSON.stringify({
          analysis: result.analysis,
          metadata: {
            ...result.metadata,
            parties: parties
          }
        }));
        
        // Small delay to show completion, then redirect
        setTimeout(() => {
          window.location.href = '/analysis';
        }, 1500);
        
      } else {
        throw new Error(result.message || 'Analysis failed');
      }

    } catch (error) {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      setAnalysisMessage('');
      
      console.error('Error during analysis:', error);
      alert(`Analysis failed: ${error.message}\n\nPlease check if the backend server is running and try again.`);
    }
  };

  // Analysis overlay
  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-lg w-full mx-4 text-center">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - analysisProgress / 100)}`}
                className="transition-all duration-500"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {Math.round(analysisProgress)}%
                </div>
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
              </div>
            </div>
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Analyzing Your Document</h2>
          <p className="text-gray-600 mb-6">{analysisMessage}</p>
          
          <div className="text-sm text-gray-500 flex items-center justify-center">
            <Clock className="w-4 h-4 mr-2" />
            This usually takes 30-60 seconds
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200">
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
            <a href='/' className="text-gray-600 hover:text-blue-600 transition-colors">
              ← Back to Home
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upload Your Legal Document
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get instant AI-powered analysis of your contract. We'll identify risks, 
            clarify complex terms, and provide actionable insights.
          </p>
        </div>

        {/* Security Banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 flex items-center">
          <Shield className="w-6 h-6 text-green-600 mr-3" />
          <div>
            <p className="text-green-800 font-semibold">Secure & Confidential</p>
            <p className="text-green-700 text-sm">Your documents are encrypted and never shared. Analysis happens in real-time.</p>
          </div>
        </div>

        {/* Main Upload Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                  activeTab === 'upload' 
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Upload className="w-5 h-5 inline mr-2" />
                Upload Document
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                  activeTab === 'text' 
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <FileText className="w-5 h-5 inline mr-2" />
                Paste Text
              </button>
            </div>
          </div>

          <div className="p-8">
            {activeTab === 'upload' ? (
              <>
                {/* File Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : uploadedFile 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {uploadedFile ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-green-800">{uploadedFile.name}</p>
                        <p className="text-green-600">{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                      {isUploading && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      )}
                      <button
                        onClick={removeFile}
                        className="text-red-600 hover:text-red-800 flex items-center mx-auto"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Remove File
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto">
                        <Upload className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-gray-900 mb-2">
                          Drop your document here, or{' '}
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            browse
                          </button>
                        </p>
                        <p className="text-gray-500">
                          Supports PDF, DOC, DOCX, TXT files up to 10MB
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileInput}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Text Input Area */}
                <div className="space-y-4">
                  <label className="block text-lg font-semibold text-gray-900">
                    Paste Contract Text
                  </label>
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Copy and paste your contract text here..."
                    className="text-black w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{textInput.length} characters</span>
                    <span className={textInput.length < 100 ? 'text-orange-600' : 'text-green-600'}>
                      {textInput.length < 100 ? 'Minimum 100 characters required' : 'Ready for analysis'}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Optional Party Information */}
            <div className="mt-8 p-6 bg-gray-50 rounded-xl">
              <div className="flex items-center mb-4">
                <Users className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Party Information (Optional)
                </h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Help us personalize the analysis by specifying the parties involved
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Party 1 (e.g., Your Company)
                  </label>
                  <input
                    type="text"
                    value={parties.party1}
                    onChange={(e) => setParties({...parties, party1: e.target.value})}
                    placeholder="Enter party name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Party 2 (e.g., Client/Vendor)
                  </label>
                  <input
                    type="text"
                    value={parties.party2}
                    onChange={(e) => setParties({...parties, party2: e.target.value})}
                    placeholder="Enter party name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Analysis Options */}
            <div className="mt-8 p-6 bg-blue-50 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                What You'll Get:
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <Eye className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Plain Language Summary</p>
                    <p className="text-sm text-gray-600">Key terms explained in simple language</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <AlertCircle className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Risk Assessment</p>
                    <p className="text-sm text-gray-600">Potential risks and problematic clauses</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Interactive Q&A</p>
                    <p className="text-sm text-gray-600">Ask questions about specific clauses</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <ArrowRight className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Decision Flowchart</p>
                    <p className="text-sm text-gray-600">Visual guidance for next steps</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 text-center">
              <button
                onClick={handleSubmit}
                disabled={(activeTab === 'upload' && !uploadedFile) || (activeTab === 'text' && textInput.trim().length < 100)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-12 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center mx-auto"
              >
                <Clock className="w-5 h-5 mr-2" />
                Analyze Document
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <p className="text-gray-500 text-sm mt-3">
                Analysis typically takes 30-60 seconds
              </p>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="font-semibold text-gray-900 mb-2">Supported Formats</h3>
            <p className="text-gray-600 text-sm">PDF, DOC, DOCX, and TXT files up to 10MB</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="font-semibold text-gray-900 mb-2">Processing Time</h3>
            <p className="text-gray-600 text-sm">Most documents analyzed within 60 seconds</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-gray-600 text-sm">
              <a href="#" className="text-blue-600 hover:text-blue-800">Contact support</a> for assistance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadPage;