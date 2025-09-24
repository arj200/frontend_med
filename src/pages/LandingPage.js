import React from 'react';
import { motion } from 'framer-motion';

const LandingPage = ({ onSelectUserType }) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut"
      }
    },
    hover: {
      y: -10,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const featureVariants = {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-orange-50 relative overflow-hidden">
      {/* Enhanced glassmorphism background elements */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Main floating orbs */}
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
        
        {/* Additional glassmorphism elements */}
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
        <motion.div
          className="absolute top-1/2 right-1/4 w-16 h-16 bg-orange-100/20 rounded-full backdrop-blur-md border border-orange-200/30"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      <motion.nav 
        className="backdrop-blur-md bg-white/20 border-b border-white/30 shadow-lg relative z-10"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-2xl font-bold text-gray-900">MediPredict AI</h1>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      <motion.div 
        className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="text-center">
          <motion.div
            className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-3xl p-8 mb-8"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <motion.h1 
              className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              AI-Powered Medical
              <motion.span 
                className="text-green-600"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              >
                {" "}Diagnosis
              </motion.span>
            </motion.h1>
            <motion.p 
              className="mt-3 max-w-md mx-auto text-base text-gray-600 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
              variants={itemVariants}
            >
              Advanced machine learning algorithms to assist in early detection of diseases including anemia, diabetes, heart disease, and chronic kidney disease.
            </motion.p>
          </motion.div>
        </motion.div>

        <motion.div 
          className="mt-16"
          variants={containerVariants}
        >
          <motion.div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Patient Portal */}
            <motion.div 
              className="relative backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 text-center"
              variants={cardVariants}
              whileHover="hover"
              whileTap={{ scale: 0.98 }}
            >
              <motion.div 
                className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <div className="bg-blue-600 rounded-full p-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </motion.div>
              <motion.h3 
                className="mt-6 text-2xl font-bold text-gray-900"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                Patient Portal
              </motion.h3>
              <motion.p 
                className="mt-4 text-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Get AI-powered health predictions, track your medical history, and consult with verified doctors.
              </motion.p>
              <motion.ul 
                className="mt-6 space-y-2 text-sm text-gray-500"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <motion.li 
                  whileHover={{ x: 5, color: "#3B82F6" }}
                  transition={{ duration: 0.2 }}
                >
                  ✓ Disease risk assessment
                </motion.li>
                <motion.li 
                  whileHover={{ x: 5, color: "#3B82F6" }}
                  transition={{ duration: 0.2 }}
                >
                  ✓ Personal health dashboard
                </motion.li>
                <motion.li 
                  whileHover={{ x: 5, color: "#3B82F6" }}
                  transition={{ duration: 0.2 }}
                >
                  ✓ Doctor consultations
                </motion.li>
                <motion.li 
                  whileHover={{ x: 5, color: "#3B82F6" }}
                  transition={{ duration: 0.2 }}
                >
                  ✓ Medical history tracking
                </motion.li>
              </motion.ul>
              <motion.button
                onClick={() => onSelectUserType('patient')}
                className="mt-8 w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium"
                whileHover={{ 
                  scale: 1.05, 
                  backgroundColor: "#059669",
                  boxShadow: "0 10px 25px rgba(34, 197, 94, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                Continue as Patient
              </motion.button>
            </motion.div>

            {/* Doctor Portal */}
            <motion.div 
              className="relative backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 text-center"
              variants={cardVariants}
              whileHover="hover"
              whileTap={{ scale: 0.98 }}
            >
              <motion.div 
                className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <div className="bg-green-600 rounded-full p-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z" />
                  </svg>
                </div>
              </motion.div>
              <motion.h3 
                className="mt-6 text-2xl font-bold text-gray-900"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                Doctor Portal
              </motion.h3>
              <motion.p 
                className="mt-4 text-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Review AI predictions, provide expert consultations, and manage patient cases efficiently.
              </motion.p>
              <motion.ul 
                className="mt-6 space-y-2 text-sm text-gray-500"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <motion.li 
                  whileHover={{ x: 5, color: "#10B981" }}
                  transition={{ duration: 0.2 }}
                >
                  ✓ Review patient cases
                </motion.li>
                <motion.li 
                  whileHover={{ x: 5, color: "#10B981" }}
                  transition={{ duration: 0.2 }}
                >
                  ✓ AI-assisted diagnosis
                </motion.li>
                <motion.li 
                  whileHover={{ x: 5, color: "#10B981" }}
                  transition={{ duration: 0.2 }}
                >
                  ✓ Patient consultations
                </motion.li>
                <motion.li 
                  whileHover={{ x: 5, color: "#10B981" }}
                  transition={{ duration: 0.2 }}
                >
                  ✓ Case management
                </motion.li>
              </motion.ul>
              <motion.button
                onClick={() => onSelectUserType('doctor')}
                className="mt-8 w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-medium"
                whileHover={{ 
                  scale: 1.05, 
                  backgroundColor: "#EA580C",
                  boxShadow: "0 10px 25px rgba(234, 88, 12, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                Continue as Doctor
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div 
          className="mt-24"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-3xl font-bold text-center text-gray-900 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Powered by Advanced AI Technology
          </motion.h2>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div 
              className="text-center backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
              variants={featureVariants}
              whileHover={{ 
                scale: 1.05, 
                y: -5,
                transition: { duration: 0.2 }
              }}
            >
              <motion.div 
                className="bg-green-100/80 backdrop-blur-sm rounded-full p-3 w-16 h-16 mx-auto mb-4 border border-green-200/50"
                whileHover={{ 
                  rotate: 360,
                  scale: 1.1,
                  backgroundColor: "#DCFCE7"
                }}
                transition={{ duration: 0.6 }}
              >
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </motion.div>
              <motion.h3 
                className="text-lg font-semibold text-gray-900"
                whileHover={{ color: "#059669" }}
                transition={{ duration: 0.2 }}
              >
                Anemia Detection
              </motion.h3>
              <motion.p 
                className="text-gray-600 text-sm"
                whileHover={{ color: "#374151" }}
                transition={{ duration: 0.2 }}
              >
                Advanced blood analysis for anemia diagnosis
              </motion.p>
            </motion.div>
            
            <motion.div 
              className="text-center backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
              variants={featureVariants}
              whileHover={{ 
                scale: 1.05, 
                y: -5,
                transition: { duration: 0.2 }
              }}
            >
              <motion.div 
                className="bg-amber-100/80 backdrop-blur-sm rounded-full p-3 w-16 h-16 mx-auto mb-4 border border-amber-200/50"
                whileHover={{ 
                  rotate: 360,
                  scale: 1.1,
                  backgroundColor: "#FEF3C7"
                }}
                transition={{ duration: 0.6 }}
              >
                <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </motion.div>
              <motion.h3 
                className="text-lg font-semibold text-gray-900"
                whileHover={{ color: "#D97706" }}
                transition={{ duration: 0.2 }}
              >
                Diabetes Prediction
              </motion.h3>
              <motion.p 
                className="text-gray-600 text-sm"
                whileHover={{ color: "#374151" }}
                transition={{ duration: 0.2 }}
              >
                Early diabetes risk assessment
              </motion.p>
            </motion.div>
            
            <motion.div 
              className="text-center backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
              variants={featureVariants}
              whileHover={{ 
                scale: 1.05, 
                y: -5,
                transition: { duration: 0.2 }
              }}
            >
              <motion.div 
                className="bg-emerald-100/80 backdrop-blur-sm rounded-full p-3 w-16 h-16 mx-auto mb-4 border border-emerald-200/50"
                whileHover={{ 
                  rotate: 360,
                  scale: 1.1,
                  backgroundColor: "#D1FAE5"
                }}
                transition={{ duration: 0.6 }}
              >
                <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </motion.div>
              <motion.h3 
                className="text-lg font-semibold text-gray-900"
                whileHover={{ color: "#047857" }}
                transition={{ duration: 0.2 }}
              >
                Heart Disease
              </motion.h3>
              <motion.p 
                className="text-gray-600 text-sm"
                whileHover={{ color: "#374151" }}
                transition={{ duration: 0.2 }}
              >
                Cardiovascular health monitoring
              </motion.p>
            </motion.div>
            
            <motion.div 
              className="text-center backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
              variants={featureVariants}
              whileHover={{ 
                scale: 1.05, 
                y: -5,
                transition: { duration: 0.2 }
              }}
            >
              <motion.div 
                className="bg-orange-100/80 backdrop-blur-sm rounded-full p-3 w-16 h-16 mx-auto mb-4 border border-orange-200/50"
                whileHover={{ 
                  rotate: 360,
                  scale: 1.1,
                  backgroundColor: "#FED7AA"
                }}
                transition={{ duration: 0.6 }}
              >
                <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z" />
                </svg>
              </motion.div>
              <motion.h3 
                className="text-lg font-semibold text-gray-900"
                whileHover={{ color: "#EA580C" }}
                transition={{ duration: 0.2 }}
              >
                Chronic Kidney Disease
              </motion.h3>
              <motion.p 
                className="text-gray-600 text-sm"
                whileHover={{ color: "#374151" }}
                transition={{ duration: 0.2 }}
              >
                Kidney function evaluation
              </motion.p>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LandingPage;
