import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { logoutUser } from '../services/api';

const Header = ({ user, onLogout, userType }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem('user');
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API fails
      localStorage.removeItem('user');
      onLogout();
    }
  };

  return (
    <motion.nav 
      className="backdrop-blur-md bg-white/20 border-b border-white/30 shadow-lg relative z-50"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                MediPredict AI
              </h1>
            </div>
            <motion.div 
              className="ml-6"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-sm text-gray-600 font-medium">
                {userType === 'patient' ? 'Patient Portal' : 'Doctor Portal'}
              </span>
            </motion.div>
          </motion.div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <motion.button 
              className="text-gray-500 hover:text-green-600 relative p-2 rounded-lg hover:bg-white/20 transition-all duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <motion.span 
                className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              >
                3
              </motion.span>
            </motion.button>

            {/* User Dropdown */}
            <div className="relative">
              <motion.button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 p-2 rounded-lg hover:bg-white/20 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div 
                  className="w-8 h-8 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center border border-green-200/50"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-sm font-medium text-green-600">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </motion.div>
                <span className="text-sm font-medium">{user.name}</span>
                <motion.svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  animate={{ rotate: showDropdown ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </motion.button>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div 
                    className="absolute right-0 mt-2 w-48 backdrop-blur-lg bg-white/20 border border-white/30 rounded-xl shadow-2xl py-2 z-50"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div 
                      className="px-4 py-2 text-sm text-gray-700 border-b border-white/20"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="font-medium">{user.name}</div>
                      <div className="text-gray-500">{user.email}</div>
                    </motion.div>
                    
                    <motion.a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-white/20 transition-colors duration-200"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowDropdown(false);
                      }}
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      Profile Settings
                    </motion.a>
                    
                    {userType === 'patient' && (
                      <motion.a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-white/20 transition-colors duration-200"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowDropdown(false);
                        }}
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        Medical Records
                      </motion.a>
                    )}
                    
                    <motion.a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-white/20 transition-colors duration-200"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowDropdown(false);
                      }}
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      Help & Support
                    </motion.a>
                    
                    <div className="border-t border-white/20">
                      <motion.button
                        onClick={() => {
                          setShowDropdown(false);
                          handleLogout();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-100/50 hover:text-red-600 transition-colors duration-200"
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        Sign out
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Dropdown overlay */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            className="fixed inset-0 z-30"  // ⬅ lowered z-index so it doesn’t block dropdown
            onClick={() => setShowDropdown(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Header;
