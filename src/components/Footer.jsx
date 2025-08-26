import React from 'react'

export const Footer = () => {
  return (
    <div>

        {/* Simple Footer */}
<footer className="bg-gray-900 text-white py-8">
  <div className="max-w-7xl mx-auto px-4">
    <div className="flex flex-col md:flex-row justify-between items-center">
      <div className="flex items-center space-x-2 mb-4 md:mb-0">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold">LC</span>
        </div>
        <span className="text-xl font-bold">LegalClear</span>
      </div>
      
      <div className="flex space-x-6 mb-4 md:mb-0">
        <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
        <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
        <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
        <a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a>
      </div>
      
      <p className="text-gray-400 text-sm">
        &copy; 2025 LegalClear. All rights reserved.
      </p>
    </div>
  </div>
</footer>
    </div>
  )
}
