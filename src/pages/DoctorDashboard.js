import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getDoctorConsultations, getPendingCases, updateConsultationStatus } from '../services/api';
import DoctorPatientChat from './DoctorPatientChat';
import Header from '../components/Header';
import PendingCases from '../components/PendingCases'; 

const DoctorDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('consultations');
  const [consultations, setConsultations] = useState([]);
  const [pendingCases, setPendingCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingReviews: 0,
    completedConsultations: 0
  });

  // ✅ NEW: Chat functionality states
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showChat, setShowChat] = useState(false);

  const tabs = [
    { id: 'consultations', name: 'Patient Consultations', icon: '👥', color: 'green' },
    { id: 'cases', name: 'Pending Reviews', icon: '📋', color: 'amber' },
    { id: 'schedule', name: 'Today\'s Schedule', icon: '📅', color: 'orange' }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load consultations
      const consultationsResponse = await getDoctorConsultations();
      if (consultationsResponse.success) {
        setConsultations(consultationsResponse.consultations || []);
      }

      // Load pending cases
      const casesResponse = await getPendingCases();
      if (casesResponse.success) {
        setPendingCases(casesResponse.cases || []);
      }

      // Calculate stats
      updateStats(consultationsResponse.consultations, casesResponse.cases);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const updateStats = (consultations = [], cases = []) => {
    const today = new Date().toDateString();
    const todayAppointments = consultations.filter(c => 
      new Date(c.requested_date).toDateString() === today
    ).length;

    setStats({
      totalPatients: consultations.length,
      todayAppointments,
      pendingReviews: cases.length,
      completedConsultations: consultations.filter(c => c.status === 'completed').length
    });
  };

  const handleStatusUpdate = async (consultationId, newStatus) => {
    try {
      const response = await updateConsultationStatus(consultationId, newStatus);
      if (response.success) {
        setConsultations(prev => prev.map(consultation => 
          consultation.id === consultationId 
            ? { ...consultation, status: newStatus }
            : consultation
        ));
        
        // Update stats
        const updatedConsultations = consultations.map(c => 
          c.id === consultationId ? { ...c, status: newStatus } : c
        );
        updateStats(updatedConsultations, pendingCases);
      }
    } catch (error) {
      console.error('Error updating consultation status:', error);
    }
  };

  // ✅ NEW: Chat functionality handlers
  const handleOpenChat = (consultation) => {
    setSelectedConsultation(consultation);
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setSelectedConsultation(null);
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

  const renderConsultationCard = (consultation) => (
    <motion.div 
      key={consultation.id} 
      className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300"
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.3 }}
      variants={itemVariants}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start space-x-4">
          <motion.div 
            className="w-12 h-12 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center border border-blue-200/50"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              👤
            </motion.span>
          </motion.div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg">
              {consultation.patient_name || 'Unknown Patient'}
            </h3>
            <p className="text-sm text-gray-600">📧 {consultation.patient_email}</p>
            <p className="text-sm text-gray-600">
              📅 {new Date(consultation.requested_date).toLocaleDateString()}
            </p>
            {consultation.message && (
              <motion.p 
                className="text-sm text-gray-700 mt-2 italic bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                💬 "{consultation.message}"
              </motion.p>
            )}
          </div>
        </div>
        <div className="text-right">
          {getStatusBadge(consultation.status)}
          <p className="text-xs text-gray-500 mt-1">
            Booked {new Date(consultation.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* ✅ ENHANCED: Doctor Interaction Buttons */}
      <motion.div 
        className="flex flex-wrap gap-3 pt-4 border-t border-white/20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {/* Always Available: Chat Button */}
        <motion.button
          onClick={() => handleOpenChat(consultation)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl text-sm hover:from-purple-600 hover:to-pink-600 flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            💬
          </motion.span>
          <span>Open Chat</span>
        </motion.button>

        {/* Status-based Action Buttons */}
        {consultation.status === 'pending' && (
          <>
            <motion.button
              onClick={() => handleStatusUpdate(consultation.id, 'confirmed')}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl text-sm hover:from-green-600 hover:to-emerald-600 flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>✅</span>
              <span>Accept</span>
            </motion.button>
            <motion.button
              onClick={() => handleStatusUpdate(consultation.id, 'cancelled')}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-xl text-sm hover:from-red-600 hover:to-pink-600 flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>❌</span>
              <span>Decline</span>
            </motion.button>
          </>
        )}
        
        {consultation.status === 'confirmed' && (
          <>
            <motion.button
              onClick={() => handleOpenChat(consultation)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-xl text-sm hover:from-blue-600 hover:to-cyan-600 flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>📹</span>
              <span>Video Call</span>
            </motion.button>
            <motion.button
              onClick={() => handleStatusUpdate(consultation.id, 'completed')}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-xl text-sm hover:from-indigo-600 hover:to-purple-600 flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>✅</span>
              <span>Complete</span>
            </motion.button>
          </>
        )}

        {consultation.status === 'completed' && (
          <motion.div 
            className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 px-4 py-2 rounded-xl text-sm flex items-center space-x-2 border border-emerald-200/50 backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <span>✅</span>
            <span>Completed</span>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-orange-50 flex items-center justify-center relative overflow-hidden">
        {/* Background glassmorphism elements */}
        <motion.div
          className="absolute inset-0 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/30 to-emerald-300/30 rounded-full backdrop-blur-sm border border-white/20"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-amber-200/30 to-orange-300/30 rounded-full backdrop-blur-sm border border-white/20"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </motion.div>
        
        <motion.div 
          className="text-center backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p 
            className="mt-6 text-gray-700 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Loading your dashboard...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-orange-50 relative overflow-hidden">
      {/* Background glassmorphism elements */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/30 to-emerald-300/30 rounded-full backdrop-blur-sm border border-white/20"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-amber-200/30 to-orange-300/30 rounded-full backdrop-blur-sm border border-white/20"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-green-100/20 rounded-full backdrop-blur-md border border-green-200/30"
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/3 w-24 h-24 bg-amber-100/20 rounded-full backdrop-blur-md border border-amber-200/30"
          animate={{
            y: [0, 15, 0],
            x: [0, -10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      <Header user={user} onLogout={onLogout} userType="doctor" />
      
      <motion.div 
        className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Message */}
        <motion.div 
          className="mb-6 backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6"
          variants={itemVariants}
        >
          <motion.h1 
            className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            Welcome back, Dr. {user?.name || 'Doctor'}! 👨‍⚕️
          </motion.h1>
          <motion.p 
            className="text-gray-600 mt-2 text-lg"
            variants={itemVariants}
          >
            Manage your consultations and interact with patients
          </motion.p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6"
          variants={containerVariants}
        >
          <motion.div 
            className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
            variants={itemVariants}
          >
            <div className="p-6">
              <div className="flex items-center">
                <motion.div 
                  className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center border border-green-200/50"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.span 
                    className="text-2xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    👥
                  </motion.span>
                </motion.div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-600 truncate">
                      Total Patients
                    </dt>
                    <dd className="text-2xl font-bold text-green-600">
                      {stats.totalPatients}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
            variants={itemVariants}
          >
            <div className="p-6">
              <div className="flex items-center">
                <motion.div 
                  className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full flex items-center justify-center border border-amber-200/50"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.span 
                    className="text-2xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  >
                    📅
                  </motion.span>
                </motion.div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-600 truncate">
                      Today's Appointments
                    </dt>
                    <dd className="text-2xl font-bold text-amber-600">
                      {stats.todayAppointments}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
            variants={itemVariants}
          >
            <div className="p-6">
              <div className="flex items-center">
                <motion.div 
                  className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center border border-orange-200/50"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.span 
                    className="text-2xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  >
                    📋
                  </motion.span>
                </motion.div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-600 truncate">
                      Pending Reviews
                    </dt>
                    <dd className="text-2xl font-bold text-orange-600">
                      {stats.pendingReviews}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
            variants={itemVariants}
          >
            <div className="p-6">
              <div className="flex items-center">
                <motion.div 
                  className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full flex items-center justify-center border border-emerald-200/50"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.span 
                    className="text-2xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                  >
                    ✅
                  </motion.span>
                </motion.div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-600 truncate">
                      Completed Today
                    </dt>
                    <dd className="text-2xl font-bold text-emerald-600">
                      {stats.completedConsultations}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          className="flex space-x-2 backdrop-blur-lg bg-white/10 border border-white/20 p-2 rounded-2xl mb-6 shadow-lg"
          variants={itemVariants}
        >
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${
                      tab.color === 'green' ? 'from-green-500 to-emerald-500' :
                      tab.color === 'amber' ? 'from-amber-500 to-orange-500' :
                      'from-orange-500 to-red-500'
                    } text-white shadow-lg`
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/20'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              variants={itemVariants}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.name}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <motion.div 
          className="space-y-6"
          variants={containerVariants}
        >
          {/* Consultations Tab */}
          {activeTab === 'consultations' && (
            <motion.div 
              className="space-y-4"
              variants={itemVariants}
            >
              <motion.h2 
                className="text-2xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4"
                variants={itemVariants}
              >
                👥 Patient Consultations & Interactions
              </motion.h2>
              
              {consultations.length === 0 ? (
                <motion.div 
                  className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8 text-center shadow-2xl"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  variants={itemVariants}
                >
                  <motion.span 
                    className="text-4xl block mb-4"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    📋
                  </motion.span>
                  <p className="text-gray-600 font-medium">No consultations yet.</p>
                </motion.div>
              ) : (
                <motion.div 
                  className="space-y-4"
                  variants={containerVariants}
                >
                  {consultations.map(renderConsultationCard)}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Pending Cases Tab */}
          {activeTab === 'cases' && (
            <PendingCases 
              cases={pendingCases} 
              onCaseReviewed={loadDashboardData}
            />
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <motion.div 
              className="space-y-4"
              variants={itemVariants}
            >
              <motion.h2 
                className="text-2xl font-semibold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4"
                variants={itemVariants}
              >
                📅 Today's Schedule
              </motion.h2>
              
              <motion.div 
                className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                variants={itemVariants}
              >
                <div className="text-center">
                  <motion.span 
                    className="text-4xl block mb-4"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    📅
                  </motion.span>
                  <p className="text-gray-600 font-medium text-lg">
                    You have {stats.todayAppointments} appointments today
                  </p>
                  <motion.div 
                    className="mt-4 bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="text-sm text-gray-500">
                      {stats.todayAppointments === 0 
                        ? "No appointments scheduled for today. Enjoy your free time!" 
                        : "Check your consultations tab for detailed appointment information."
                      }
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* ✅ NEW: Chat Modal */}
      {showChat && selectedConsultation && (
        <DoctorPatientChat
          consultation={selectedConsultation}
          user={user}
          onClose={handleCloseChat}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
