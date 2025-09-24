import React, { useState } from 'react';
import { reviewCase } from '../services/api';
import { 
  FaUser, 
  FaCalendarAlt, 
  FaStethoscope, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaSpinner, 
  FaArrowLeft, 
  FaPlus, 
  FaTimes, 
  FaFileAlt,
  FaUserMd,
  FaClock,
  FaEye
} from 'react-icons/fa';

const CaseReview = ({ caseData, onBack, onReviewed }) => {
  const [reviewForm, setReviewForm] = useState({
    diagnosis: '',
    severity: 'mild',
    recommendations: [''],
    follow_up_required: false,
    medications: [''],
    lifestyle_changes: ['']
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const addItem = (field) => {
    setReviewForm({
      ...reviewForm,
      [field]: [...reviewForm[field], '']
    });
  };

  const removeItem = (field, index) => {
    const newItems = reviewForm[field].filter((_, i) => i !== index);
    setReviewForm({
      ...reviewForm,
      [field]: newItems
    });
  };

  const updateItem = (field, index, value) => {
    const newItems = [...reviewForm[field]];
    newItems[index] = value;
    setReviewForm({
      ...reviewForm,
      [field]: newItems
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Filter out empty items
      const cleanedForm = {
        ...reviewForm,
        recommendations: reviewForm.recommendations.filter(r => r.trim()),
        medications: reviewForm.medications.filter(m => m.trim()),
        lifestyle_changes: reviewForm.lifestyle_changes.filter(l => l.trim())
      };

      const result = await reviewCase(caseData._id, cleanedForm);
      if (result.success) {
        onReviewed();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'High Risk':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'Moderate Risk':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low Risk':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="text-blue-600 hover:text-blue-800 mr-4 flex items-center space-x-2 transition-colors duration-200">
          <FaArrowLeft className="text-sm" />
          <span>Back to Cases</span>
        </button>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <FaStethoscope className="text-xl text-white" />
          </div>
          <span>Case Review</span>
        </h2>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-r-lg shadow-sm">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-500 mr-3 text-lg" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Information */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <FaUser className="text-blue-600" />
              <span>Patient Information</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <FaUser className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">{caseData.patient_name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaCalendarAlt className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="font-medium text-gray-900">{caseData.patient_age} years</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaUserMd className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-medium text-gray-900">{caseData.patient_gender}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaClock className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Submitted</p>
                  <p className="font-medium text-gray-900">{formatDate(caseData.timestamp)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <FaStethoscope className="text-green-600" />
              <span>AI Prediction Results</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <FaFileAlt className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Disease</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {caseData.disease.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaCheckCircle className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Prediction</p>
                  <p className={`font-medium ${
                    caseData.prediction === 1 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {caseData.prediction === 1 ? 'Positive' : 'Negative'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaEye className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Confidence</p>
                  <p className="font-medium text-gray-900">
                    {(caseData.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              <div>
                <span className="text-gray-600">Risk Level:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(caseData.risk_level)}`}>
                  {caseData.risk_level}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Input Features</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {caseData.feature_names.map((name, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-600 capitalize">{name.replace('_', ' ')}:</span>
                  <span className="font-medium">{caseData.features[index]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Review Form */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Doctor Review</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Diagnosis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clinical Diagnosis
              </label>
              <textarea
                required
                rows={3}
                value={reviewForm.diagnosis}
                onChange={(e) => setReviewForm({...reviewForm, diagnosis: e.target.value})}
                className="form-input"
                placeholder="Provide your clinical diagnosis based on the AI prediction and medical expertise..."
              />
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity Level
              </label>
              <select
                value={reviewForm.severity}
                onChange={(e) => setReviewForm({...reviewForm, severity: e.target.value})}
                className="form-input"
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Recommendations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medical Recommendations
              </label>
              {reviewForm.recommendations.map((rec, index) => (
                <div key={index} className="flex mb-2">
                  <input
                    type="text"
                    value={rec}
                    onChange={(e) => updateItem('recommendations', index, e.target.value)}
                    className="form-input flex-1 mr-2"
                    placeholder="Enter recommendation..."
                  />
                  <button
                    type="button"
                    onClick={() => removeItem('recommendations', index)}
                    className="text-red-600 hover:text-red-800 px-2 transition-colors duration-200"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addItem('recommendations')}
                className="btn-secondary text-sm flex items-center space-x-2"
              >
                <FaPlus className="text-xs" />
                <span>Add Recommendation</span>
              </button>
            </div>

            {/* Medications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prescribed Medications
              </label>
              {reviewForm.medications.map((med, index) => (
                <div key={index} className="flex mb-2">
                  <input
                    type="text"
                    value={med}
                    onChange={(e) => updateItem('medications', index, e.target.value)}
                    className="form-input flex-1 mr-2"
                    placeholder="Medication name and dosage..."
                  />
                  <button
                    type="button"
                    onClick={() => removeItem('medications', index)}
                    className="text-red-600 hover:text-red-800 px-2 transition-colors duration-200"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addItem('medications')}
                className="btn-secondary text-sm flex items-center space-x-2"
              >
                <FaPlus className="text-xs" />
                <span>Add Medication</span>
              </button>
            </div>

            {/* Lifestyle Changes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lifestyle Changes
              </label>
              {reviewForm.lifestyle_changes.map((change, index) => (
                <div key={index} className="flex mb-2">
                  <input
                    type="text"
                    value={change}
                    onChange={(e) => updateItem('lifestyle_changes', index, e.target.value)}
                    className="form-input flex-1 mr-2"
                    placeholder="Lifestyle recommendation..."
                  />
                  <button
                    type="button"
                    onClick={() => removeItem('lifestyle_changes', index)}
                    className="text-red-600 hover:text-red-800 px-2 transition-colors duration-200"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addItem('lifestyle_changes')}
                className="btn-secondary text-sm flex items-center space-x-2"
              >
                <FaPlus className="text-xs" />
                <span>Add Lifestyle Change</span>
              </button>
            </div>

            {/* Follow-up */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reviewForm.follow_up_required}
                  onChange={(e) => setReviewForm({...reviewForm, follow_up_required: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Follow-up appointment required</span>
              </label>
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-4">
              <button type="button" onClick={onBack} className="btn-secondary">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin text-sm" />
                    <span>Submitting Review...</span>
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="text-sm" />
                    <span>Submit Review</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CaseReview;
