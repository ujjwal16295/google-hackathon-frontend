"use client"
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  FileText, 
  Trash2, 
  LogOut, 
  User, 
  Calendar, 
  AlertCircle,
  CheckCircle,
  Eye,
  Search,
  Filter,
  Loader2
} from 'lucide-react';

const supabaseUrl = 'https://mnbluphajxxwlmzqmpnm.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const DashboardPage = () => {
  const [userEmail, setUserEmail] = useState(null);
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/';
        return;
      }
      
      setUserEmail(session.user.email);
      await loadUserData(session.user.email);
    } catch (error) {
      console.error('Error checking auth:', error);
      window.location.href = '/';
    }
  };

  const loadUserData = async (email) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://googel-hackathon-backend.onrender.com/api/get-user-data/${email}`);
      const result = await response.json();
      
      if (result.success) {
        setSavedAnalyses(result.data);
      } else {
        setSavedAnalyses([]);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      alert('Failed to load saved analyses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      sessionStorage.clear();
      localStorage.clear();
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to logout');
    }
  };

  const handleDelete = async (serial, e) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this analysis? This action cannot be undone.')) {
      return;
    }

    setDeletingId(serial);
    try {
      const response = await fetch(
        `https://googel-hackathon-backend.onrender.com/api/delete-user-data/${userEmail}/${serial}`,
        { method: 'DELETE' }
      );
      
      const result = await response.json();
      
      if (result.success) {
        setSavedAnalyses(prev => prev.filter(item => item.serial !== serial));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error deleting analysis:', error);
      alert('Failed to delete analysis: ' + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewAnalysis = (analysisData) => {
    try {
      // Clear any existing session data first
      sessionStorage.removeItem('analysisResults');
      sessionStorage.removeItem('chatSessions');
      sessionStorage.removeItem('chatCounter');
      
      // Prepare the complete analysis data structure
      const analysisResults = {
        analysis: analysisData.data.analysis,
        metadata: analysisData.data.metadata,
        originalText: analysisData.data.originalText,
        // Mark this as loaded from saved data
        isLoadedFromSave: true,
        savedSerial: analysisData.serial,
        savedAt: analysisData.created_at
      };
      
      // Store in sessionStorage
      sessionStorage.setItem('analysisResults', JSON.stringify(analysisResults));
      
      // Restore chat sessions if they exist
      if (analysisData.data.chatSessions) {
        sessionStorage.setItem('chatSessions', JSON.stringify(analysisData.data.chatSessions));
      }
      
      // Restore chat counter if it exists
      if (analysisData.data.chatCounter) {
        sessionStorage.setItem('chatCounter', analysisData.data.chatCounter.toString());
      }
      
      // Redirect to analysis page
      window.location.href = '/analysis';
    } catch (error) {
      console.error('Error viewing analysis:', error);
      alert('Failed to load analysis. Please try again.');
    }
  };

  const getRiskColor = (riskScore) => {
    if (riskScore >= 70) return 'text-green-600 bg-green-50';
    if (riskScore >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getRiskText = (riskScore) => {
    if (riskScore >= 70) return 'Low Risk';
    if (riskScore >= 40) return 'Medium Risk';
    return 'High Risk';
  };

  const getDocumentTitle = (data) => {
    return data?.data?.analysis?.summary?.documentType || 'Legal Document';
  };

  const filteredAnalyses = savedAnalyses.filter(item => {
    const matchesSearch = searchQuery === '' || 
      getDocumentTitle(item).toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.data?.analysis?.summary?.mainPurpose?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const riskScore = item.data?.analysis?.riskAssessment?.riskScore || 0;
    const matchesFilter = filterRisk === 'all' ||
      (filterRisk === 'low' && riskScore >= 70) ||
      (filterRisk === 'medium' && riskScore >= 40 && riskScore < 70) ||
      (filterRisk === 'high' && riskScore < 40);
    
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

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
            
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-blue-50 px-4 py-2 rounded-lg">
                <User className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm text-gray-700 font-medium">{userEmail}</span>
              </div>
              
              <a 
                href="/docupload"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <FileText className="w-4 h-4 mr-2" />
                New Analysis
              </a>
              
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 transition-colors flex items-center"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Dashboard</h1>
          <p className="text-xl text-gray-600">
            View and manage your saved contract analyses
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Analyses</p>
                <p className="text-3xl font-bold text-gray-900">{savedAnalyses.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">High Risk Documents</p>
                <p className="text-3xl font-bold text-red-600">
                  {savedAnalyses.filter(a => a.data?.analysis?.riskAssessment?.riskScore < 40).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Low Risk Documents</p>
                <p className="text-3xl font-bold text-green-600">
                  {savedAnalyses.filter(a => a.data?.analysis?.riskAssessment?.riskScore >= 70).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by document type or purpose..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="all">All Risk Levels</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>
          </div>
        </div>

        {/* Analyses List */}
        {filteredAnalyses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {savedAnalyses.length === 0 ? 'No Saved Analyses Yet' : 'No Results Found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {savedAnalyses.length === 0 
                ? 'Start by analyzing your first legal document'
                : 'Try adjusting your search or filter criteria'}
            </p>
            {savedAnalyses.length === 0 && (
              <a
                href="/docupload"
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileText className="w-5 h-5 mr-2" />
                Analyze Your First Document
              </a>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredAnalyses.map((item) => {
              const riskScore = item.data?.analysis?.riskAssessment?.riskScore || 0;
              const summary = item.data?.analysis?.summary;
              const createdDate = new Date(item.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
              const chatCount = item.data?.chatSessions?.length || 0;

              return (
                <div
                  key={item.serial}
                  onClick={() => handleViewAnalysis(item)}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-300"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            {getDocumentTitle(item)}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(riskScore)}`}>
                            {getRiskText(riskScore)} ({riskScore}/100)
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {summary?.mainPurpose || 'No description available'}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {createdDate}
                          </span>
                          <span className="flex items-center">
                            <FileText className="w-4 h-4 mr-1" />
                            Serial: {item.serial}
                          </span>
                          {chatCount > 0 && (
                            <span className="flex items-center text-blue-600">
                              <Eye className="w-4 h-4 mr-1" />
                              {chatCount} Q&A session{chatCount > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewAnalysis(item);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Full Analysis"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(item.serial, e)}
                          disabled={deletingId === item.serial}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete Analysis"
                        >
                          {deletingId === item.serial ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Key Highlights */}
                    {summary?.keyHighlights && summary.keyHighlights.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Key Highlights:</p>
                        <div className="flex flex-wrap gap-2">
                          {summary.keyHighlights.slice(0, 3).map((highlight, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                            >
                              {highlight}
                            </span>
                          ))}
                          {summary.keyHighlights.length > 3 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                              +{summary.keyHighlights.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;