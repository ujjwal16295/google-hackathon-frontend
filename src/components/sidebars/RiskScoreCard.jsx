import React from 'react';
import { Shield } from 'lucide-react';

const RiskScoreCard = ({ riskScore = 50 }) => {  // CHANGED: Default to 50
  const getRiskLevel = (score) => {
    if (score >= 70) return { text: 'Low Risk', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (score >= 40) return { text: 'Medium Risk', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { text: 'High Risk', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const risk = getRiskLevel(riskScore);
  const circumference = 2 * Math.PI * 32;
  const strokeDashoffset = circumference * (1 - riskScore / 100);  // CHANGED: Divide by 100

  // CHANGED: Color based on risk level
  const getStrokeColor = (score) => {
    if (score >= 70) return '#10B981'; // green
    if (score >= 40) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Overall Assessment</h3>
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-4 relative">  {/* CHANGED: Made larger */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="32"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="48"
              cy="48"
              r="32"
              stroke={getStrokeColor(riskScore)}  // CHANGED: Dynamic color
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"  // ADDED: Rounded ends
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">  {/* CHANGED: Larger text */}
              {riskScore}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-1">Risk Score</p>
        <div className={`inline-flex items-center px-3 py-1 rounded-full ${risk.bgColor}`}>  {/* CHANGED: Added background */}
          <Shield className="w-4 h-4 mr-1" />
          <p className={`text-sm font-medium ${risk.color}`}>
            {risk.text}
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-2">0 = Highest Risk, 100 = Lowest Risk</p>  {/* ADDED: Scale explanation */}
      </div>
    </div>
  );
};

export default RiskScoreCard;