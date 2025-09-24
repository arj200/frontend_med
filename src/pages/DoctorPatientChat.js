import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sendMessage, getChatMessages, uploadChatFile } from '../services/api';
import io from 'socket.io-client';
import { 
  FaUser, 
  FaPaperclip, 
  FaTimes, 
  FaPaperPlane, 
  FaFileAlt, 
  FaUserMd, 
  FaCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaStethoscope,
  FaCalendarAlt,
  FaPills,
  FaQuestionCircle,
  FaComments,
  FaShieldAlt
} from 'react-icons/fa';

const DoctorPatientChat = ({ consultation, user, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notification, setNotification] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [transportType, setTransportType] = useState('unknown');
  const [retryCount, setRetryCount] = useState(0);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const tempMessageTimeouts = useRef(new Map());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatMessages = useCallback(async () => {
    try {
      setLoading(true);
      if (consultation.chat_room_id) {
        const response = await getChatMessages(consultation.chat_room_id);
        if (response.success) {
          setMessages(response.messages);
          scrollToBottom();
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }, [consultation.chat_room_id]);

  // Initialize socket connection for real-time chat
  useEffect(() => {
    // Capture ref value at the beginning of the effect
    const timeouts = tempMessageTimeouts.current;
    
    // Use polling only to avoid WebSocket issues completely
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      withCredentials: true,
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['polling'], // Use polling only to avoid WebSocket issues
      upgrade: false, // Disable upgrade to prevent WebSocket attempts
      rememberUpgrade: false,
      forceNew: true
    });

    newSocket.on('connect', () => {
      const transport = newSocket.io.engine.transport.name;
      console.log('✅ Connected to chat server via', transport);
      setConnectionStatus('connected');
      setTransportType(transport);
      setRetryCount(0); // Reset retry count on successful connection
      if (consultation.chat_room_id) {
        newSocket.emit('join_chat_room', { room_id: consultation.chat_room_id });
      }
      
      // Socket.IO will automatically attempt to upgrade to WebSocket if available
      console.log(`✅ Connected via ${transport} transport`);
    });

    newSocket.on('disconnect', (reason) => {
      console.warn('⚠️ Disconnected from chat server:', reason);
      setConnectionStatus('disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      setConnectionStatus('error');
      
      // Try to reconnect with polling only if WebSocket fails
      if (error.message.includes('websocket') || error.message.includes('Invalid frame header') || error.message.includes('WebSocket')) {
        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);
        
        if (newRetryCount <= 3) {
          console.log(`🔄 WebSocket failed (attempt ${newRetryCount}/3), retrying with polling transport...`);
          newSocket.io.opts.transports = ['polling'];
          newSocket.io.opts.upgrade = false; // Disable upgrade to prevent WebSocket attempts
          
          // Exponential backoff
          setTimeout(() => {
            newSocket.connect();
          }, Math.pow(2, newRetryCount) * 1000);
        } else {
          console.error('❌ Max retry attempts reached. Connection failed.');
          setNotification('Unable to connect to chat server. Please refresh the page.');
        }
      }
    });

    newSocket.on('new_message', (message) => {
      console.log('📨 Received new message:', message);
      setMessages(prev => {
        // Find and remove any temporary message with the same content from the same user
        const tempMessageToRemove = prev.find(msg => 
          msg.isTemporary && msg.sender_id === message.sender_id && msg.content === message.content
        );
        
        if (tempMessageToRemove) {
          console.log('📨 Removing temporary message and adding real message');
          // Clear the timeout for this temporary message
          const timeout = tempMessageTimeouts.current.get(tempMessageToRemove.id);
          if (timeout) {
            clearTimeout(timeout);
            tempMessageTimeouts.current.delete(tempMessageToRemove.id);
          }
        }
        
        const filteredMessages = prev.filter(msg => 
          !(msg.isTemporary && msg.sender_id === message.sender_id && msg.content === message.content)
        );
        
        // Check if this message already exists to avoid duplicates
        const messageExists = filteredMessages.some(msg => 
          msg.id === message.id || (msg.sender_id === message.sender_id && msg.content === message.content && Math.abs(new Date(msg.timestamp) - new Date(message.timestamp)) < 1000)
        );
        
        if (messageExists) {
          console.log('📨 Message already exists, skipping');
          return filteredMessages;
        }
        
        console.log('📨 Adding new message to chat');
        return [...filteredMessages, message];
      });
      scrollToBottom();
    });

    newSocket.on('user_typing', (data) => {
      if (data.user_id !== user.id) {
        setTypingUsers(prev => 
          data.typing 
            ? [...prev.filter(u => u.user_id !== data.user_id), data]
            : prev.filter(u => u.user_id !== data.user_id)
        );
      }
    });

    newSocket.on('user_joined', (data) => {
      setOnlineUsers(prev => [...prev, data.user_id]);
    });

    newSocket.on('user_left', (data) => {
      setOnlineUsers(prev => prev.filter(id => id !== data.user_id));
    });

    newSocket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    // No upgrade needed since we're using polling only

    // Handle socket errors from server
    newSocket.on('error', (data) => {
      console.error('❌ Server error:', data.message);
      if (data.message === 'Access denied to this chat room') {
        setNotification('Access denied to this chat room');
      }
    });

    setSocket(newSocket);
    loadChatMessages();

    return () => {
      // Clear all temporary message timeouts
      timeouts.forEach(timeout => clearTimeout(timeout));
      timeouts.clear();
      
      if (newSocket && newSocket.connected) {
        if (consultation.chat_room_id) {
          newSocket.emit('leave_chat_room', { room_id: consultation.chat_room_id });
        }
        newSocket.disconnect();
      }
    };
  }, [consultation.chat_room_id, user.id, loadChatMessages, retryCount]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !consultation.chat_room_id) return;

    const messageText = newMessage.trim();
    const tempMessageId = `temp_${Date.now()}`;
    
    // Add message to UI immediately for better UX
    const tempMessage = {
      id: tempMessageId,
      chat_room_id: consultation.chat_room_id,
      sender_id: user.id,
      sender_type: user.user_type,
      message_type: 'text',
      content: messageText,
      timestamp: new Date().toISOString(),
      read_by: [user.id],
      edited: false,
      isTemporary: true
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    handleTyping(false);
    scrollToBottom();

    // Set a timeout to remove temporary message if real-time event doesn't fire
    const tempMessageTimeout = setTimeout(() => {
      setMessages(prev => {
        const tempMsg = prev.find(msg => msg.id === tempMessageId);
        if (tempMsg) {
          console.log('⏰ Temporary message timeout, removing');
          return prev.filter(msg => msg.id !== tempMessageId);
        }
        return prev;
      });
      tempMessageTimeouts.current.delete(tempMessageId);
    }, 5000); // 5 second timeout
    
    tempMessageTimeouts.current.set(tempMessageId, tempMessageTimeout);

    try {
      const response = await sendMessage(
        consultation.chat_room_id,
        messageText,
        'text'
      );

      if (response.success) {
        console.log('✅ Message sent successfully');
        setNotification(''); // Clear any previous errors
        // Don't remove temporary message here - let the real-time event handle it
        // The new_message event will replace the temporary message with the real one
      } else {
        console.log('❌ Message send failed, removing temporary message');
        // Remove temporary message and show error
        setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
        setNotification(response.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove temporary message and show error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
      setNotification(error.message || 'Failed to send message. Please try again.');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !consultation.chat_room_id) return;

    try {
      const uploadResponse = await uploadChatFile(file, consultation.chat_room_id);
      
      if (uploadResponse.success) {
        await sendMessage(
          consultation.chat_room_id,
          `📎 Medical document: ${uploadResponse.filename}`,
          'file',
          uploadResponse.file_url
        );
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };


  const handleTyping = (typing) => {
    if (socket && consultation.chat_room_id) {
      socket.emit('typing', {
        room_id: consultation.chat_room_id,
        typing: typing
      });
    }
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessageBubbleClass = (senderId) => {
    return senderId === user.id
      ? 'text-white'
      : 'text-gray-800';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FaComments className="text-2xl text-white animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center justify-center space-x-2">
              <FaStethoscope className="text-blue-600" />
              <span>Loading Chat</span>
            </h3>
            <p className="text-gray-600 mb-4">Please wait while we load your conversation...</p>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!consultation.chat_room_id) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FaExclamationTriangle className="text-2xl text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Chat Unavailable</h3>
            <p className="text-gray-600 mb-6">Chat room not available for this consultation.</p>
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full mx-4 h-5/6 flex flex-col overflow-hidden">
        {/* Professional Chat Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-6 rounded-t-2xl flex justify-between items-center shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full flex items-center justify-center shadow-lg">
              <FaUser className="text-2xl text-blue-700" />
            </div>
            <div>
              <h3 className="font-bold text-xl flex items-center space-x-2">
                <FaStethoscope className="text-blue-200" />
                <span>Patient: {consultation.patient_name || 'Unknown Patient'}</span>
              </h3>
              <div className="flex items-center space-x-6 mt-2">
                <div className="flex items-center space-x-2">
                  {connectionStatus === 'connected' ? (
                    <FaCheckCircle className="text-green-400 text-sm" />
                  ) : connectionStatus === 'connecting' ? (
                    <FaClock className="text-yellow-400 text-sm animate-spin" />
                  ) : connectionStatus === 'disconnected' ? (
                    <FaTimes className="text-red-400 text-sm" />
                  ) : (
                    <FaExclamationTriangle className="text-gray-400 text-sm" />
                  )}
                  <span className="text-sm text-blue-100 font-medium">
                    {connectionStatus === 'connected' ? `Connected (${transportType})` : 
                     connectionStatus === 'connecting' ? 'Connecting...' : 
                     connectionStatus === 'disconnected' ? 'Disconnected' : 'Error'}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <FaCircle className="text-green-400 text-xs" />
                  <span className="text-xs text-blue-200 font-medium">
                    Online: {onlineUsers.length}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-1 mt-1">
                <FaCalendarAlt className="text-blue-300 text-xs" />
                <span className="text-xs text-blue-200">
                  Consultation: {new Date(consultation.requested_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
              title="Share Medical Document"
            >
              <FaPaperclip className="text-lg" />
            </button>
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        {/* Enhanced Messages Area */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100">
          {/* Professional Notification */}
          {notification && (
            <div className="mx-4 mt-4 bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-r-lg shadow-md">
              <div className="flex items-center">
                <FaExclamationTriangle className="text-red-500 mr-3 text-lg" />
                <span className="text-sm font-medium flex-1">{notification}</span>
                <button
                  onClick={() => setNotification('')}
                  className="text-red-500 hover:text-red-700 text-lg font-bold transition-colors duration-200"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          )}

          {/* Professional Welcome Message */}
          <div className="mx-4 mt-4 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200 shadow-lg">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <FaComments className="text-2xl text-white" />
                </div>
              </div>
              <p className="text-sm font-semibold text-blue-800 flex items-center justify-center space-x-2">
                <FaShieldAlt className="text-blue-600" />
                <span>Secure patient communication channel • HIPAA Compliant</span>
              </p>
              <p className="text-xs text-blue-600 mt-2 flex items-center justify-center space-x-1">
                <FaUser className="text-xs" />
                <span>Patient Email: {consultation.patient_email}</span>
              </p>
            </div>
          </div>

          {/* Messages Container */}
          <div className="px-4 py-4 space-y-4">

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'} mb-6`}
            >
              <div className="flex items-end space-x-3 max-w-xs lg:max-w-md">
                {message.sender_id !== user.id && (
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center shadow-lg">
                    <FaUser className="text-lg text-gray-600" />
                  </div>
                )}
                <div
                  className={`px-5 py-4 rounded-2xl shadow-lg ${getMessageBubbleClass(message.sender_id)} ${
                    message.sender_id === user.id 
                      ? 'rounded-br-md bg-gradient-to-br from-blue-500 to-blue-600' 
                      : 'rounded-bl-md bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300'
                  }`}
                >
                  {message.message_type === 'file' && (
                    <div className="mb-3">
                      <a
                        href={message.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 text-blue-200 hover:text-blue-100 transition-colors duration-200 bg-blue-700 bg-opacity-30 px-3 py-2 rounded-lg"
                      >
                        <FaFileAlt className="text-sm" />
                        <span className="underline font-medium">View Medical Document</span>
                      </a>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed font-medium">{message.content}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-1">
                      <FaClock className="text-xs opacity-60" />
                      <p className="text-xs opacity-70">
                        {formatMessageTime(message.timestamp)}
                      </p>
                    </div>
                    {message.isTemporary && (
                      <div className="flex items-center space-x-2 text-blue-300">
                        <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium">Sending...</span>
                      </div>
                    )}
                  </div>
                </div>
                {message.sender_id === user.id && (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <FaUserMd className="text-lg text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Professional Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="flex justify-start mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center shadow-lg">
                  <FaUser className="text-lg text-gray-600" />
                </div>
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 text-gray-800 px-5 py-4 rounded-2xl rounded-bl-md shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm italic font-medium">Patient is typing...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Professional Message Input */}
        <form onSubmit={handleSendMessage} className="p-6 bg-gradient-to-r from-white to-gray-50 border-t border-gray-200 shadow-lg">
          <div className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping(e.target.value.length > 0);
                }}
                onBlur={() => handleTyping(false)}
                placeholder="Type your medical advice or response..."
                className="w-full border-2 border-gray-300 rounded-2xl px-5 py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none shadow-sm"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <FaComments className="text-gray-400 text-sm" />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-200 hover:shadow-xl disabled:hover:shadow-lg"
            >
              <span className="flex items-center space-x-2">
                <span className="font-medium">Send</span>
                <FaPaperPlane className="text-sm" />
              </span>
            </button>
          </div>
          
          {/* Professional Quick Response Templates */}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setNewMessage("Thank you for sharing your symptoms. Let me review them.")}
              className="text-xs bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-4 py-2 rounded-full hover:from-blue-100 hover:to-blue-200 transition-all duration-200 shadow-sm hover:shadow-md border border-blue-200 flex items-center space-x-2"
            >
              <FaFileAlt className="text-xs" />
              <span>Review Symptoms</span>
            </button>
            <button
              type="button"
              onClick={() => setNewMessage("I recommend scheduling a follow-up appointment.")}
              className="text-xs bg-gradient-to-r from-green-50 to-green-100 text-green-700 px-4 py-2 rounded-full hover:from-green-100 hover:to-green-200 transition-all duration-200 shadow-sm hover:shadow-md border border-green-200 flex items-center space-x-2"
            >
              <FaCalendarAlt className="text-xs" />
              <span>Follow-up</span>
            </button>
            <button
              type="button"
              onClick={() => setNewMessage("Please take the prescribed medication as directed.")}
              className="text-xs bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 px-4 py-2 rounded-full hover:from-purple-100 hover:to-purple-200 transition-all duration-200 shadow-sm hover:shadow-md border border-purple-200 flex items-center space-x-2"
            >
              <FaPills className="text-xs" />
              <span>Prescription</span>
            </button>
            <button
              type="button"
              onClick={() => setNewMessage("Please provide more details about your symptoms.")}
              className="text-xs bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 px-4 py-2 rounded-full hover:from-orange-100 hover:to-orange-200 transition-all duration-200 shadow-sm hover:shadow-md border border-orange-200 flex items-center space-x-2"
            >
              <FaQuestionCircle className="text-xs" />
              <span>More Details</span>
            </button>
          </div>
        </form>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
        />
      </div>
    </div>
  );
};

export default DoctorPatientChat;
