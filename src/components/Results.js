import React from 'react';
import { 
  FaBullseye, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaChartBar, 
  FaSlidersH, 
  FaRobot, 
  FaTrophy, 
  FaPrint, 
  FaCopy
} from 'react-icons/fa';

const Results = ({ result }) => {
  console.log("Results component received:", result);

  if (!result) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500">No prediction results yet</p>
          <p className="text-sm text-gray-400 mt-1">Submit the form to get AI predictions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
          <FaBullseye className="text-white text-sm" />
        </div>
        <span>AI Prediction Results</span>
      </h3>
      
      <div className="space-y-4">
        {/* Main Result */}
        <div className={`p-4 rounded-lg border-l-4 ${
          result.prediction === 0 
            ? 'bg-green-50 border-green-400' 
            : 'bg-red-50 border-red-400'
        }`}>
          <div className="flex items-center">
            <div className="mr-3">
              {result.prediction === 0 ? (
                <FaCheckCircle className="text-2xl text-green-500" />
              ) : (
                <FaExclamationTriangle className="text-2xl text-red-500" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Prediction Result</p>
              <p className={`text-lg font-semibold ${
                result.prediction === 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {result.prediction === 0 ? 'Negative' : 'Positive'}
              </p>
            </div>
          </div>
        </div>

        {/* Confidence Score */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confidence Score</p>
              <p className="text-lg font-semibold text-blue-600">
                {((result.confidence || 0) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-2xl">
              <FaChartBar className="text-blue-500" />
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(result.confidence || 0) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Risk Level */}
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Risk Assessment</p>
              <p className="text-lg font-semibold text-purple-600">
                {result.risk_level || 'Unknown'}
              </p>
            </div>
            <div className="text-2xl">
              <FaSlidersH className="text-purple-500" />
            </div>
          </div>
        </div>

        {/* Model Information */}
        {result.model_type && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI Model Used</p>
                <p className="text-lg font-semibold text-gray-600">
                  {result.model_type}
                </p>
              </div>
              <div className="text-2xl">
                <FaRobot className="text-indigo-500" />
              </div>
            </div>
          </div>
        )}

        {/* Accuracy Information */}
        {result.accuracy && (
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Model Accuracy</p>
                <p className="text-lg font-semibold text-yellow-600">
                  {(result.accuracy * 100).toFixed(1)}%
                </p>
              </div>
              <div className="text-2xl">
                <FaTrophy className="text-yellow-500" />
              </div>
            </div>
          </div>
        )}
      </div>


      {/* Action Buttons */}
      <div className="mt-6 flex space-x-3">
        <button 
          onClick={() => window.print()} 
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPrint className="mr-2" />
          Print Results
        </button>
        <button 
          onClick={() => {
            const resultText = `Medical AI Prediction Results:
Result: ${result.prediction === 0 ? 'Negative' : 'Positive'}
Confidence: ${((result.confidence || 0) * 100).toFixed(1)}%
Risk Level: ${result.risk_level || 'Unknown'}
Model: ${result.model_type || 'AI Model'}`;
            navigator.clipboard.writeText(resultText);
            alert('Results copied to clipboard!');
          }}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
        >
          <FaCopy className="mr-2" />
          Copy Results
        </button>
      </div>
    </div>
  );
};

export default Results;
