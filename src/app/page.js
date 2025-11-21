"use client"
import React, { useState, useEffect } from 'react';
import { Upload, Shield, MessageCircle, GitBranch, CheckCircle, ArrowRight, FileText, LogOut, User } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { createClient } from '@supabase/supabase-js';

// Supabase initialization
const supabaseUrl = 'https://mnbluphajxxwlmzqmpnm.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const LegalAIHomepage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 4);
    }, 3000);
    
    // Check for existing session and handle OAuth callback
    const checkUser = async () => {
      console.log('Checking for user session...'); // Debug log
      
      // First, check if there's a hash fragment (OAuth callback)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      
      if (accessToken) {
        console.log('✅ OAuth callback detected, access token found'); // Debug log
        // Clean the URL hash
        window.history.replaceState(null, '', window.location.pathname);
      }
      
      // Get the current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      console.log('Session Data:', session); // Debug log
      console.log('Session Error:', error); // Debug log
      console.log('User Data:', session?.user); // Debug log
      
      if (session?.user) {
        console.log('✅ User is logged in:', session.user.email); // Debug log
        console.log('Auth provider:', session.user.app_metadata.provider); // Debug log
        setUser(session.user);
        
        // Store session in localStorage for persistence
        localStorage.setItem('supabase_session', JSON.stringify(session));
      } else {
        console.log('❌ No user logged in'); // Debug log
        
        // Check localStorage as fallback
        const storedSession = localStorage.getItem('supabase_session');
        if (storedSession) {
          console.log('Found session in localStorage'); // Debug log
          try {
            const parsedSession = JSON.parse(storedSession);
            setUser(parsedSession.user);
          } catch (e) {
            console.error('Error parsing stored session:', e);
            localStorage.removeItem('supabase_session');
          }
        }
      }
    };
    
    checkUser();
  
    // Listen for auth changes (crucial for OAuth)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('🔄 Auth state changed:', _event); // Debug log
      console.log('New session:', session); // Debug log
      
      if (session?.user) {
        console.log('✅ User logged in via', _event, ':', session.user.email);
        console.log('Provider:', session.user.app_metadata.provider);
        setUser(session.user);
        
        // Store session
        localStorage.setItem('supabase_session', JSON.stringify(session));
      } else {
        console.log('❌ User logged out');
        setUser(null);
        localStorage.removeItem('supabase_session');
      }
    });
  
    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, []);


  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('supabase_session');
    setShowUserMenu(false);
    window.location.reload();
  };

  const features = [
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Plain Language Translation",
      description: "Transform complex legal jargon into clear, understandable language"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Smart Risk Detection",
      description: "AI-powered analysis highlights risky clauses and vague terms"
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Interactive Q&A",
      description: "Ask direct questions about your contract and get instant answers"
    },
    {
      icon: <GitBranch className="w-8 h-8" />,
      title: "Decision Flowcharts",
      description: "Visual guidance showing possible outcomes and decision paths"
    }
  ];

  const benefits = [
    "Save thousands on legal fees",
    "Understand contracts in minutes, not hours",
    "Identify risks before signing",
    "Make informed decisions with confidence"
  ];

  // Smooth scroll function
  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation - UPDATED WITH AUTH */}
      <nav className="relative z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center py-4">
      <div className="flex items-center space-x-2">

        <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LC</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                LegalClear
              </span>
            </div>
      </div>
      <div className="hidden md:flex items-center space-x-8">
        <a 
          href="#features" 
          onClick={(e) => scrollToSection(e, 'features')}
          className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
        >
          Features
        </a>
        <a 
          href="#how-it-works" 
          onClick={(e) => scrollToSection(e, 'how-it-works')}
          className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
        >
          How It Works
        </a>
        
        {/* Auth Section - Shows Login or User Menu */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => {
                console.log('User menu toggled, current user:', user); // Debug log
                setShowUserMenu(!showUserMenu);
              }}
              className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transition-all duration-300"
            >
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">{user.email}</span>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs text-gray-500">Signed in as</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                </div>
                <a 
                  href="/dashboard" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Dashboard
                </a>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {console.log('No user, showing login button')}
            <a 
              href='/login' 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Login
            </a>
          </>
        )}
      </div>
    </div>
  </div>
</nav>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Turn Complex
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Legal Contracts</span>
                <br />Into Clear Insights
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Our AI-powered platform transforms confusing legal documents into plain English, 
                highlights risks, and guides your decisions with interactive analysis.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a href='/docupload' className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center">
                  Upload Your Contract
                  <Upload className="ml-2 w-5 h-5" />
                </a>
              </div>
              <div className="flex flex-wrap gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                  <div className="flex items-center mb-6">
                    <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                      <Shield className="w-6 h-6 text-red-500 mr-3" />
                      <div>
                        <p className="font-semibold text-red-700">High Risk Clause Detected</p>
                        <p className="text-sm text-red-600">Unlimited liability clause found</p>
                      </div>
                    </div>
                    <div className="flex items-center p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                      <MessageCircle className="w-6 h-6 text-yellow-500 mr-3" />
                      <div>
                        <p className="font-semibold text-yellow-700">Vague Term Identified</p>
                        <p className="text-sm text-yellow-600">"Reasonable efforts" needs clarification</p>
                      </div>
                    </div>
                    <div className="flex items-center p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                      <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                      <div>
                        <p className="font-semibold text-green-700">Key Term Simplified</p>
                        <p className="text-sm text-green-600">Payment terms clearly defined</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/50 backdrop-blur-sm scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Smart Legal Analysis
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI combines advanced natural language processing with legal expertise 
              to deliver comprehensive contract analysis in seconds.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`p-8 rounded-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer ${
                  currentFeature === index 
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-xl' 
                    : 'bg-white border border-gray-100 shadow-lg hover:shadow-xl'
                }`}
              >
                <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center ${
                  currentFeature === index 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How LegalClear Works</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Get instant legal insights in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Upload Your Contract",
                description: "Simply drag and drop your legal document or paste the text directly into our secure platform."
              },
              {
                step: "02", 
                title: "AI Analysis",
                description: "Our advanced AI processes your document, identifying key clauses, risks, and opportunities for clarification."
              },
              {
                step: "03",
                title: "Get Insights",
                description: "Receive a clear summary, risk assessment, and interactive guidance to make informed decisions."
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                  {step.step}
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-blue-100 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Understand Your Contracts?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of individuals and small businesses who trust LegalClear 
            for their contract analysis needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href='/docupload' className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center">
              Start Free Analysis
              <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer/>
    </div>
  );
};

// Simple Scale icon component since it's not in lucide-react
const Scale = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9l-5 4.87L18.18 21L12 17.77L5.82 21L7 13.87L2 9l6.91-.74L12 2z"/>
  </svg>
);

export default LegalAIHomepage;