/**
 * Chat Page
 * Medical chatbot interface
 */

import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  FaPaperPlane, 
  FaRobot, 
  FaUser, 
  FaExclamationTriangle,
  FaSpinner 
} from 'react-icons/fa';

function Chat() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    createNewSession();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewSession = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.createSession({ sessionType: 'symptom-check' });
      
      if (response.success) {
        setSessionId(response.data.session._id);
        setMessages(response.data.session.messages || []);
        toast.success('Chat session started');
      }
    } catch (error) {
      console.error('Session creation error:', error);
      toast.error('Failed to start chat session');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !sessionId) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setSending(true);

    // Add user message immediately
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const response = await chatAPI.sendMessage(sessionId, userMessage);
      
      if (response.success) {
        const assistantMessage = {
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date(),
          metadata: response.data.analysis
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
      
      // Add error message
      const errorMessage = {
        role: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'text-green-600',
      moderate: 'text-yellow-600',
      high: 'text-orange-600',
      emergency: 'text-red-600'
    };
    return colors[severity] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Starting chat session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Medical Chat Assistant</h1>
        <p className="text-gray-600 mt-2">Describe your symptoms and get instant medical guidance</p>
      </div>

      {/* Chat Container */}
      <div className="card p-0 overflow-hidden" style={{ height: 'calc(100vh - 250px)' }}>
        {/* Messages Area */}
        <div className="h-full overflow-y-auto p-6 bg-gray-50">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <FaRobot className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                Start by describing your symptoms or health concerns
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-6 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-3xl ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-primary-600 text-white' 
                    : message.role === 'system'
                    ? 'bg-gray-400 text-white'
                    : 'bg-green-600 text-white'
                }`}>
                  {message.role === 'user' ? <FaUser /> : <FaRobot />}
                </div>

                {/* Message Content */}
                <div className={`flex-1 ${
                  message.role === 'user' ? 'text-right' : ''
                }`}>
                  <div className={`inline-block p-4 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-900 shadow-sm'
                  }`}>
                    {/* Severity Badge */}
                    {message.metadata?.severity && (
                      <div className="mb-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          message.metadata.emergency 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {message.metadata.emergency && <FaExclamationTriangle className="inline mr-1" />}
                          Severity: {message.metadata.severity.toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Message Text */}
                    <div className="whitespace-pre-wrap break-words">
                      {message.content}
                    </div>

                    {/* Timestamp */}
                    <div className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-primary-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {/* Emergency Warning */}
                  {message.metadata?.emergency && (
                    <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-500 rounded">
                      <div className="flex items-center">
                        <FaExclamationTriangle className="text-red-600 mr-2" />
                        <span className="text-red-800 text-sm font-semibold">
                          MEDICAL EMERGENCY DETECTED
                        </span>
                      </div>
                      <p className="text-red-700 text-sm mt-1">
                        Please call emergency services immediately (108 in India)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Sending Indicator */}
          {sending && (
            <div className="mb-6 flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center">
                  <FaRobot />
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t bg-white p-4">
          <div className="flex items-end space-x-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your symptoms... (Press Enter to send)"
              className="input flex-1 resize-none"
              rows="2"
              disabled={sending || !sessionId}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || sending || !sessionId}
              className="btn btn-primary flex items-center space-x-2 h-full"
            >
              {sending ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <FaPaperPlane />
                  <span>Send</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            ⚠️ This system provides general medical guidance and is not a substitute for professional medical advice.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex space-x-3">
        <button
          onClick={createNewSession}
          className="btn btn-secondary"
        >
          Start New Conversation
        </button>
      </div>

      {/* Example Prompts */}
      <div className="mt-6 card">
        <h3 className="font-semibold text-gray-900 mb-3">Example Questions:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            'I have a headache and fever',
            'I feel dizzy and nauseous',
            'I have chest pain',
            'I have been coughing for 3 days'
          ].map((example, index) => (
            <button
              key={index}
              onClick={() => setInputMessage(example)}
              className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Chat;
