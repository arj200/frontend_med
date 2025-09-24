import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { loginUser } from '../services/api';
import Register from './Register';

const Login = ({ userType, onLogin, onBack }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    user_type: userType
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await loginUser(formData);
      if (result.success) {
        localStorage.setItem('user', JSON.stringify(result.user));
        onLogin(result.user);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSuccess = (userData) => {
    // After successful registration, automatically log the user in
    localStorage.setItem('user', JSON.stringify(userData));
    onLogin(userData);
    setShowRegister(false);
  };

  const handleBackToLogin = () => {
    setShowRegister(false);
  };

  // Show registration component with correct props
  if (showRegister) {
    return (
      <Register 
        userType={userType}  // Pass the userType from Login
        onRegistrationSuccess={handleRegistrationSuccess}
        onBack={handleBackToLogin}
      />
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
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

  // Show login form
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

      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="max-w-md w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Glassmorphism card */}
          <motion.div 
            className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div variants={itemVariants}>
              <motion.button
                onClick={onBack}
                className="text-green-600 hover:text-green-800 mb-6 flex items-center transition-colors duration-200"
                whileHover={{ x: -5 }}
                transition={{ duration: 0.2 }}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </motion.button>
              
              <motion.div className="text-center mb-8">
                <motion.h2 
                  className="text-3xl font-extrabold text-gray-900 mb-2"
                  variants={itemVariants}
                >
                  {userType === 'patient' ? 'Patient' : 'Doctor'} Login
                </motion.h2>
                <motion.p 
                  className="text-gray-600"
                  variants={itemVariants}
                >
                  Welcome back! Please sign in to your account
                </motion.p>
              </motion.div>

              <motion.form 
                className="space-y-6" 
                onSubmit={handleSubmit}
                variants={itemVariants}
              >
                {error && (
                  <motion.div 
                    className="bg-red-100/80 backdrop-blur-sm border border-red-200/50 text-red-700 px-4 py-3 rounded-lg"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {error}
                  </motion.div>
                )}
                
                <div className="space-y-4">
                  <motion.div variants={itemVariants}>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email address
                    </label>
                    <motion.input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your email"
                      whileFocus={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <motion.input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your password"
                      whileFocus={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.div>
                </div>

                <motion.div variants={itemVariants}>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: "0 10px 25px rgba(34, 197, 94, 0.3)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    {loading ? (
                      <motion.div 
                        className="flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Signing in...
                      </motion.div>
                    ) : (
                      'Sign in'
                    )}
                  </motion.button>
                </motion.div>

                <motion.div 
                  className="text-center"
                  variants={itemVariants}
                >
                  <p className="text-gray-600">
                    Don't have an account?{' '}
                    <motion.button
                      onClick={() => setShowRegister(true)}
                      className="font-medium text-green-600 hover:text-green-500 transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      Create a new account
                    </motion.button>
                  </p>
                </motion.div>
              </motion.form>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
