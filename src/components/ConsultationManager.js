import React, { useState, useEffect } from 'react';
import { getDoctorConsultations, updateConsultationStatus } from '../services/api';
import { 
  FaUserMd, 
  FaSpinner, 
  FaClipboardList, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaComments, 
  FaCheckCircle, 
  FaTimes, 
  FaCheck, 
  FaBan,
  FaFlagCheckered
} from 'react-icons/fa';

const ConsultationManager = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState({});

  useEffect(() => {
    loadConsultations();
  }, []);

  const loadConsultations = async () => {
    try {
      setLoading(true);
      const response = await getDoctorConsultations();
      if (response.success) {
        setConsultations(response.consultations || []);
      }
    } catch (error) {
      console.error('Error loading consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (consultationId, newStatus) => {
    if (!consultationId) {
      console.error('Consultation ID is required');
      return;
    }

    try {
      setUpdatingStatus(prev => ({ ...prev, [consultationId]: true }));
      
      const response = await updateConsultationStatus(consultationId, newStatus);
      if (response.success) {
        // Update local state
        setConsultations(prev => prev.map(consultation => 
          consultation.id === consultationId 
            ? { ...consultation, status: newStatus }
            : consultation
        ));
      }
    } catch (error) {
      console.error('Error updating consultation status:', error);
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [consultationId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || statusClasses.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FaSpinner className="text-2xl text-white animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Consultations</h3>
          <p className="text-gray-600">Please wait while we load your consultation requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
          <FaUserMd className="text-xl text-white" />
        </div>
        <span>Patient Consultations</span>
      </h2>

      {consultations.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FaClipboardList className="text-3xl text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Consultation Requests</h3>
          <p className="text-gray-500">You haven't received any consultation requests yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {consultations.map((consultation) => (
            <div 
              key={consultation.id || consultation._id} // ✅ FIXED: Added unique key
              className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {consultation.patient_name || 'Unknown Patient'}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center space-x-2">
                    <FaEnvelope className="text-blue-500" />
                    <span>{consultation.patient_email}</span>
                  </p>
                  <p className="text-sm text-gray-600 flex items-center space-x-2">
                    <FaCalendarAlt className="text-green-500" />
                    <span>Requested: {new Date(consultation.requested_date).toLocaleDateString()}</span>
                  </p>
                  {consultation.message && (
                    <p className="text-sm text-gray-700 mt-2 italic flex items-start space-x-2">
                      <FaComments className="text-purple-500 mt-0.5 flex-shrink-0" />
                      <span>"{consultation.message}"</span>
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {getStatusBadge(consultation.status)}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(consultation.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Status Update Buttons */}
              <div className="flex space-x-3">
                {consultation.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(consultation.id, 'confirmed')}
                      disabled={updatingStatus[consultation.id]}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg text-sm hover:from-green-600 hover:to-green-700 disabled:opacity-50 flex items-center space-x-2 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      {updatingStatus[consultation.id] ? (
                        <FaSpinner className="animate-spin text-xs" />
                      ) : (
                        <FaCheckCircle className="text-xs" />
                      )}
                      <span>{updatingStatus[consultation.id] ? 'Updating...' : 'Confirm'}</span>
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(consultation.id, 'cancelled')}
                      disabled={updatingStatus[consultation.id]}
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm hover:from-red-600 hover:to-red-700 disabled:opacity-50 flex items-center space-x-2 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      {updatingStatus[consultation.id] ? (
                        <FaSpinner className="animate-spin text-xs" />
                      ) : (
                        <FaTimes className="text-xs" />
                      )}
                      <span>{updatingStatus[consultation.id] ? 'Updating...' : 'Cancel'}</span>
                    </button>
                  </>
                )}
                {consultation.status === 'confirmed' && (
                  <button
                    onClick={() => handleStatusUpdate(consultation.id, 'completed')}
                    disabled={updatingStatus[consultation.id]}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 flex items-center space-x-2 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {updatingStatus[consultation.id] ? (
                      <FaSpinner className="animate-spin text-xs" />
                    ) : (
                      <FaFlagCheckered className="text-xs" />
                    )}
                    <span>{updatingStatus[consultation.id] ? 'Updating...' : 'Mark Complete'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConsultationManager;
