import React from 'react';
import { Users, HelpCircle, Tag } from 'lucide-react';
 const ContractPartiesCard = ({ parties }) => {
    if (!parties || (!parties.party1 && !parties.party2)) {
      return null;
    }
  
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Contract Parties
        </h3>
        <div className="space-y-2">
          {parties.party1 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Party 1</p>
              <p className="font-semibold text-gray-900">{parties.party1}</p>
            </div>
          )}
          {parties.party2 && (
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Party 2</p>
              <p className="font-semibold text-gray-900">{parties.party2}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  export default ContractPartiesCard;