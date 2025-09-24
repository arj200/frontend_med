import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { predictDisease, getDiseaseInfo } from '../services/api';
import { 
  FaFlask, 
  FaTint, 
  FaHeart, 
  FaLungs, 
  FaBug, 
  FaInfoCircle, 
  FaExclamationTriangle, 
  FaSearch, 
  FaBullseye, 
  FaCheckCircle, 
  FaChartBar, 
  FaSlidersH, 
  FaRobot
} from 'react-icons/fa';

const PredictionForm = ({ onResult }) => {
  const [selectedDisease, setSelectedDisease] = useState('anemia');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [diseaseInfo, setDiseaseInfo] = useState({});
  const [isLoadingInfo, setIsLoadingInfo] = useState(true);
  const [error, setError] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);

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

  // Debug logging
  console.log("PredictionForm rendered");
  console.log("Disease info:", diseaseInfo);
  console.log("Selected disease:", selectedDisease);
  console.log("Form data:", formData);

  useEffect(() => {
    console.log("🚀 Loading disease info...");
    loadDiseaseInfo();
  }, []);

  useEffect(() => {
    // Reset form when disease changes
    console.log("🔄 Disease changed to:", selectedDisease);
    setFormData({});
    setPredictionResult(null);
    setError(null);
  }, [selectedDisease]);

  const loadDiseaseInfo = async () => {
    try {
      setIsLoadingInfo(true);
      setError(null);
      
      console.log("📡 Calling getDiseaseInfo API...");
      const result = await getDiseaseInfo();
      console.log("✅ API Response:", result);
      
      if (result.success) {
        setDiseaseInfo(result.diseases);
        console.log("✅ Disease info loaded successfully");
      } else {
        console.error("❌ API returned error:", result);
        setError("Failed to load disease information");
      }
    } catch (error) {
      console.error('❌ Error loading disease info:', error);
      setError("Error connecting to server");
    } finally {
      setIsLoadingInfo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPredictionResult(null);

    try {
      const currentDisease = diseaseInfo[selectedDisease];
      
      // ✅ Enhanced feature preparation with validation
      const features = currentDisease.fields.map(field => {
        const value = formData[field.name];
        const numValue = parseFloat(value) || 0;
        console.log(`📊 Field ${field.name}: ${value} -> ${numValue}`);
        return numValue;
      });

      console.log("🚀 Sending prediction request:", { 
        selectedDisease, 
        features,
        diseaseInfo: currentDisease.name 
      });

      // ✅ Make prediction API call
      const result = await predictDisease(selectedDisease, features);
      
      console.log("📊 Full API response:", result);
      console.log("🎯 Response success:", result.success);
      console.log("🎯 Prediction data:", result.prediction);
      
      if (result.success && result.prediction) {
        const predictionData = result.prediction;
        console.log("✅ Processing prediction data:", predictionData);
        
        // ✅ Set local state for immediate display
        setPredictionResult(predictionData);
        
        // ✅ Call parent callback with full prediction data
        if (onResult) {
          console.log("✅ Calling onResult with:", predictionData);
          onResult(predictionData);
        } else {
          console.warn("⚠️ onResult callback not provided");
        }
        
        console.log("✅ Prediction completed successfully");
      } else {
        console.error("❌ API returned error or missing prediction:", result);
        setError(result.error || "Invalid prediction response");
      }
    } catch (error) {
      console.error('❌ Prediction error:', error);
      setError("Failed to get prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldName, value) => {
    console.log(`📝 Input changed: ${fieldName} = ${value}`);
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleDiseaseSelect = (disease) => {
    console.log(`🎯 Disease selected: ${disease}`);
    setSelectedDisease(disease);
  };

  // ✅ Enhanced loading state
  if (isLoadingInfo) {
    return (
      <motion.div 
        className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center py-8">
          <motion.div
            className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p 
            className="mt-4 text-gray-700 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Loading disease information...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  // ✅ Error state with retry
  if (error && Object.keys(diseaseInfo).length === 0) {
    return (
      <motion.div 
        className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center py-8">
          <motion.div 
            className="text-red-600 mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <FaExclamationTriangle className="mx-auto h-12 w-12" />
          </motion.div>
          <motion.p 
            className="text-red-600 mb-4 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {error}
          </motion.p>
          <motion.button 
            onClick={loadDiseaseInfo}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Retry Loading
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const diseases = Object.keys(diseaseInfo);
  const currentDisease = diseaseInfo[selectedDisease];

  if (!currentDisease) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <p className="text-red-600">Error: Could not load disease information for {selectedDisease}</p>
          <button 
            onClick={() => setSelectedDisease('anemia')}
            className="mt-4 btn-primary"
          >
            Reset to Anemia
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Main Prediction Form Card */}
      <motion.div 
        className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
        variants={itemVariants}
      >
        <motion.h2 
          className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6 flex items-center space-x-3"
          variants={itemVariants}
        >
          <motion.div 
            className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <FaFlask className="text-xl text-white" />
          </motion.div>
          <span>Disease Prediction</span>
        </motion.h2>
        
        {/* Disease Selection */}
        <motion.div 
          className="mb-6"
          variants={itemVariants}
        >
          <motion.label 
            className="block text-sm font-medium text-gray-700 mb-4 text-lg"
            variants={itemVariants}
          >
            Select Disease to Predict
          </motion.label>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
            variants={containerVariants}
          >
            {diseases.map(disease => (
              <motion.button
                key={disease}
                type="button"
                onClick={() => handleDiseaseSelect(disease)}
                className={`p-4 rounded-xl text-sm font-medium transition-all duration-200 backdrop-blur-sm border ${
                  selectedDisease === disease
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg border-green-400/50'
                    : 'bg-white/20 text-gray-700 hover:bg-white/30 hover:shadow-md border-white/30'
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                variants={itemVariants}
              >
                <motion.div 
                  className="text-xl mb-2"
                  animate={selectedDisease === disease ? { rotate: [0, 10, -10, 0] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {disease === 'anemia' && <FaTint className="text-red-500" />}
                  {disease === 'diabetes' && <FaHeart className="text-blue-500" />}
                  {disease === 'heart_disease' && <FaHeart className="text-red-500" />}
                  {disease === 'chronic' && <FaLungs className="text-green-500" />}
                  {disease === 'malaria' && <FaBug className="text-yellow-500" />}
                </motion.div>
                <div className="font-medium">{diseaseInfo[disease].name}</div>
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* Disease Description */}
        <motion.div 
          className="mb-6 p-6 bg-gradient-to-r from-green-100/50 to-emerald-100/50 backdrop-blur-sm rounded-xl border border-green-200/30"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          variants={itemVariants}
        >
          <motion.h3 
            className="font-medium text-green-900 flex items-center text-lg"
            variants={itemVariants}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FaInfoCircle className="mr-3 text-green-500 text-xl" />
            </motion.div>
            {currentDisease.name}
          </motion.h3>
          <motion.p 
            className="text-sm text-green-700 mt-2"
            variants={itemVariants}
          >
            {currentDisease.description}
          </motion.p>
          {currentDisease.accuracy && (
            <motion.p 
              className="text-sm text-green-600 mt-3 font-medium bg-white/20 backdrop-blur-sm rounded-lg p-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              Model Accuracy: {currentDisease.accuracy}
            </motion.p>
          )}
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div 
            className="mb-6 p-4 bg-gradient-to-r from-red-100/50 to-pink-100/50 backdrop-blur-sm rounded-xl border border-red-200/30"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FaExclamationTriangle className="text-red-500 mr-3 text-xl" />
              </motion.div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Prediction Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Prediction Form */}
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-6"
          variants={itemVariants}
        >
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={containerVariants}
          >
            {currentDisease.fields.map(field => (
              <motion.div 
                key={field.name} 
                className="space-y-2"
                variants={itemVariants}
              >
                <motion.label 
                  className="block text-sm font-medium text-gray-700"
                  variants={itemVariants}
                >
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </motion.label>
                
                {field.type === 'select' ? (
                  <motion.select
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    whileFocus={{ scale: 1.02 }}
                  >
                    <option value="">Select {field.label}...</option>
                    {field.options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </motion.select>
                ) : field.type === 'file' ? (
                  <motion.div 
                    className="border-2 border-dashed border-white/30 rounded-xl p-6 text-center bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                  >
                    <input
                      type="file"
                      accept={field.accept}
                      onChange={(e) => handleInputChange(field.name, e.target.files[0])}
                      className="hidden"
                      id={`file-${field.name}`}
                    />
                    <label
                      htmlFor={`file-${field.name}`}
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <motion.svg 
                        className="mx-auto h-12 w-12 text-gray-400" 
                        stroke="currentColor" 
                        fill="none" 
                        viewBox="0 0 48 48"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </motion.svg>
                      <span className="mt-2 text-sm text-gray-600 font-medium">Upload {field.label}</span>
                      <span className="text-xs text-gray-500">PNG, JPG up to 10MB</span>
                    </label>
                  </motion.div>
                ) : (
                  <motion.input
                    type={field.type}
                    required={field.required}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    whileFocus={{ scale: 1.02 }}
                  />
                )}
                
                {/* Field hints */}
                {field.min !== undefined && field.max !== undefined && (
                  <motion.p 
                    className="text-xs text-gray-500 bg-white/20 backdrop-blur-sm rounded-lg p-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Range: {field.min} - {field.max}
                  </motion.p>
                )}
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div 
            className="pt-6"
            variants={itemVariants}
          >
            <motion.button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 rounded-xl text-white font-medium transition-all duration-200 shadow-lg ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:shadow-xl'
              }`}
              whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <motion.div 
                  className="flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div 
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Analyzing...
                </motion.div>
              ) : (
                <motion.div 
                  className="flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <FaSearch className="mr-3 text-lg" />
                  </motion.div>
                  Get AI Prediction
                </motion.div>
              )}
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>

      {/* ✅ Immediate Results Display */}
      {predictionResult && (
        <motion.div 
          className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
        >
          <motion.h3 
            className="text-2xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6 flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FaBullseye className="mr-3 text-green-500 text-2xl" />
            </motion.div>
            Prediction Results for {currentDisease.name}
          </motion.h3>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, staggerChildren: 0.1 }}
          >
            <motion.div 
              className="p-6 bg-gradient-to-r from-blue-100/50 to-cyan-100/50 backdrop-blur-sm rounded-xl text-center border border-blue-200/30"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div 
                className="text-3xl mb-3"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {predictionResult.prediction === 0 ? (
                  <FaCheckCircle className="text-green-500" />
                ) : (
                  <FaExclamationTriangle className="text-red-500" />
                )}
              </motion.div>
              <p className="text-sm text-gray-600 font-medium">Result</p>
              <p className="text-xl font-bold text-blue-600">
                {predictionResult.prediction === 0 ? 'Negative' : 'Positive'}
              </p>
            </motion.div>
            
            <motion.div 
              className="p-6 bg-gradient-to-r from-green-100/50 to-emerald-100/50 backdrop-blur-sm rounded-xl text-center border border-green-200/30"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div 
                className="text-3xl mb-3"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                <FaChartBar className="text-green-500" />
              </motion.div>
              <p className="text-sm text-gray-600 font-medium">Confidence</p>
              <p className="text-xl font-bold text-green-600">
                {((predictionResult.confidence || 0) * 100).toFixed(1)}%
              </p>
            </motion.div>
            
            <motion.div 
              className="p-6 bg-gradient-to-r from-purple-100/50 to-pink-100/50 backdrop-blur-sm rounded-xl text-center border border-purple-200/30"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div 
                className="text-3xl mb-3"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                <FaSlidersH className="text-purple-500" />
              </motion.div>
              <p className="text-sm text-gray-600 font-medium">Risk Level</p>
              <p className="text-xl font-bold text-purple-600">
                {predictionResult.risk_level || 'Unknown'}
              </p>
            </motion.div>
            
            <motion.div 
              className="p-6 bg-gradient-to-r from-indigo-100/50 to-blue-100/50 backdrop-blur-sm rounded-xl text-center border border-indigo-200/30"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div 
                className="text-3xl mb-3"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
              >
                <FaRobot className="text-indigo-500" />
              </motion.div>
              <p className="text-sm text-gray-600 font-medium">Model</p>
              <p className="text-xl font-bold text-indigo-600">
                {predictionResult.model_type || 'AI Model'}
              </p>
            </motion.div>
          </motion.div>

        </motion.div>
      )}
    </motion.div>
  );
};

export default PredictionForm;
