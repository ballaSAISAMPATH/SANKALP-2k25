import React, { useState, useRef, useEffect } from 'react';
import { Send, FileText, RefreshCw } from 'lucide-react';
import { useSelector } from 'react-redux';

const FunctionalRequirements = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [functionalRequirements, setFunctionalRequirements] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef(null);
  const {refinedPrompt} = useSelector((state)=>state.task)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = { role: 'user', content: inputMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputMessage })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      
      const aiMessage = { 
        role: 'assistant', 
        content: data.response, 
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      if (data.functional_requirements) {
        setFunctionalRequirements(data.functional_requirements);
        if (data.is_initial_analysis) {
          setActiveTab('requirements');
        }
      }
    } catch (error) {
      const errorMessage = { 
        role: 'assistant', 
        content: `Error: ${error.message}`, 
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetConversation = async () => {
    try {
      await fetch('http://localhost:8000/reset', { method: 'POST' });
      setMessages([]);
      setFunctionalRequirements(null);
      setActiveTab('chat');
    } catch (error) {
      console.error('Failed to reset:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderValue = (value) => {
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc pl-4 space-y-1">
          {value.map((item, index) => (
            <li key={index} className="text-sm">
              {typeof item === 'string' ? item : JSON.stringify(item)}
            </li>
          ))}
        </ul>
      );
    } else if (typeof value === 'object' && value !== null) {
      return (
        <div className="space-y-2">
          {Object.entries(value).map(([subKey, subValue]) => (
            <div key={subKey}>
              <h4 className="font-medium text-sm capitalize">{subKey.replace(/_/g, ' ')}</h4>
              <div className="ml-2 text-sm text-gray-600">
                {renderValue(subValue)}
              </div>
            </div>
          ))}
        </div>
      );
    }
    return <p className="text-sm">{value}</p>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <h1 className="text-xl font-bold text-blue-600">Functional Requirements Analyzer</h1>
          <button
            onClick={resetConversation}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Reset
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded text-sm font-medium ${
              activeTab === 'chat' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('requirements')}
            disabled={!functionalRequirements}
            className={`px-4 py-2 rounded text-sm font-medium ${
              activeTab === 'requirements' && functionalRequirements
                ? 'bg-blue-600 text-white'
                : functionalRequirements
                ? 'bg-white text-gray-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Requirements {functionalRequirements && <span className="ml-1 text-xs">✓</span>}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Chat Section */}
          <div className={`${activeTab !== 'chat' ? 'hidden lg:block' : ''}`}>
            <div className="bg-white rounded-lg border h-96 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-16">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Describe your project to generate functional requirements</p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : message.isError
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))
                )}
                
                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-xs rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-900">
                      <div className="flex items-center gap-1">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="ml-2 text-gray-500">Analyzing...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    defaultValue={refinedPrompt}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe your project..."
                    className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center min-w-16"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Requirements Section */}
          <div className={`${activeTab !== 'requirements' ? 'hidden lg:block' : ''}`}>
            <div className="bg-white rounded-lg border">
              {functionalRequirements ? (
                <div className="h-96 overflow-y-auto p-4 space-y-4">
                  <h2 className="text-lg font-bold text-gray-900 border-b pb-2">
                    Functional Requirements
                  </h2>
                  
                  {Object.entries(functionalRequirements).map(([key, value]) => {
                    if (!value || (Array.isArray(value) && value.length === 0)) return null;
                    
                    return (
                      <div key={key} className="border-l-2 border-blue-200 pl-3">
                        <h3 className="font-semibold text-gray-800 mb-2 capitalize">
                          {key.replace(/_/g, ' ')}
                        </h3>
                        {renderValue(value)}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No requirements generated yet</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FunctionalRequirements;