import React from 'react';
import { Shield, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const RiskScoreCard = ({ riskScore = 50 }) => {
  const getRiskLevel = (score) => {
    if (score >= 70) return { 
      text: 'Low Risk', 
      color: 'text-green-600', 
      bgColor: 'bg-green-100',
      icon: TrendingUp
    };
    if (score >= 40) return { 
      text: 'Medium Risk', 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-100',
      icon: Minus
    };
    return { 
      text: 'High Risk', 
      color: 'text-red-600', 
      bgColor: 'bg-red-100',
      icon: TrendingDown
    };
  };

  const risk = getRiskLevel(riskScore);
  const RiskIcon = risk.icon;
  const circumference = 2 * Math.PI * 32;
  const strokeDashoffset = circumference * (1 - riskScore / 100);

  const getStrokeColor = (score) => {
    if (score >= 70) return '#10B981'; // green
    if (score >= 40) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <Shield className="w-5 h-5 mr-2 text-blue-600" />
        Overall Assessment
      </h3>
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-4 relative">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="32"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="32"
              stroke={getStrokeColor(riskScore)}
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900">
              {riskScore}
            </span>
            <span className="text-xs text-gray-500">/ 100</span>
          </div>
        </div>
        
        <div className={`inline-flex items-center px-4 py-2 rounded-full ${risk.bgColor} mb-2`}>
          <RiskIcon className="w-4 h-4 mr-2" />
          <p className={`text-sm font-semibold ${risk.color}`}>
            {risk.text}
          </p>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Score Calculation</p>
          <p className="text-xs text-gray-600 leading-relaxed">
            <span className="font-medium">(Green + 0.5×Yellow) ÷ Total</span>
            <br />
            <span className="text-gray-500">scaled to 0-100</span>
          </p>
        </div>
        
        <div className="mt-3 flex justify-around text-xs">
          <div>
            <div className="text-gray-500">Best</div>
            <div className="font-semibold text-green-600">100</div>
          </div>
          <div>
            <div className="text-gray-500">Worst</div>
            <div className="font-semibold text-red-600">0</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskScoreCard;