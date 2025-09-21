import React, { useState, useRef, useEffect } from 'react';
import { Send, FileText, RefreshCw } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setRefinedPrompt, 
  setDeveloperOutput, 
  setFunctionalOutput, 
  setNonFunctionalOutput,
  setFunctionalRequirements,
  setFunctionalMessages,
  addFunctionalMessage,
  clearFunctional
} from "../../store/task/index";

const FunctionalRequirements = () => {
  const dispatch = useDispatch();
  const { 
    refinedPrompt, 
    developerOutput, 
    functionalOutput, 
    nonFunctionalOutput,
    functionalRequirements: reduxFunctionalReqs,
    functionalMessages: reduxMessages 
  } = useSelector((state) => state.task);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [reduxMessages]);

  // Initialize component with existing data
  useEffect(() => {
    if (reduxMessages && reduxMessages.length > 0) {
      // If we have messages, we're not in initial state
    }
    if (refinedPrompt && refinedPrompt !== 'geyhetewery') {
      setInputMessage(refinedPrompt);
    }
    if (reduxFunctionalReqs) {
      setActiveTab('requirements');
    }
  }, [refinedPrompt, reduxMessages, reduxFunctionalReqs]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = { role: 'user', content: inputMessage, timestamp: new Date() };
    
    // Dispatch to Redux instead of local state
    dispatch(addFunctionalMessage(userMessage));
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:4000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputMessage })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      
      // Save to Redux
      dispatch(setFunctionalOutput(data.response));
      
      const aiMessage = { 
        role: 'assistant', 
        content: data.response, 
        timestamp: new Date()
      };
      
      dispatch(addFunctionalMessage(aiMessage));
      
      // Save functional requirements to Redux
      if (data.functional_requirements) {
        console.log('Saving functional requirements to Redux:', data.functional_requirements);
        dispatch(setFunctionalRequirements(data.functional_requirements));
        
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
      dispatch(addFunctionalMessage(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const resetConversation = async () => {
    try {
      await fetch('http://localhost:4000/reset', { method: 'POST' });
      
      // Clear Redux state
      dispatch(clearFunctional());
      setActiveTab('chat');
      setInputMessage('');
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
            <li key={index} className="text-sm text-white">
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
              <div className="ml-2 text-sm text-white">
                {renderValue(subValue)}
              </div>
            </div>
          ))}
        </div>
      );
    }
    return <p className="text-sm text-white">{value}</p>;
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-black border-b p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div>
            <h1 className="text-xl font-bold text-purple-600">Functional Requirements Analyzer</h1>
            {reduxFunctionalReqs && (
              <p className="text-sm text-green-600 mt-1">
                ✓ Requirements loaded from previous session
              </p>
            )}
          </div>
          <button
            onClick={resetConversation}
            disabled={isLoading}
            className="flex text-white border-1 border-white mt-2 items-center gap-2 px-3 py-2 bg-black hover:bg-black rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 text-white ${isLoading ? 'animate-spin' : ''}`} />
            Reset
          </button>
        </div>
      </div>

      <div className="max-w-full mx-auto p-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded text-sm font-medium ${
              activeTab === 'chat' ? 'bg-purple-600 text-white' : 'bg-black text-white'
            }`}
          >
            Chat {reduxMessages && reduxMessages.length > 0 && (
              <span className="ml-1 text-xs">({reduxMessages.length})</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('requirements')}
            disabled={!reduxFunctionalReqs}
            className={`px-4 py-2 rounded text-sm font-medium ${
              activeTab === 'requirements' && reduxFunctionalReqs
                ? 'bg-purple-600 text-white'
                : reduxFunctionalReqs
                ? 'bg-black text-white'
                : 'bg-black text-white cursor-not-allowed'
            }`}
          >
            Requirements {reduxFunctionalReqs && <span className="ml-1 text-xs">✓</span>}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Chat Section */}
          <div className={`${activeTab !== 'chat' ? 'hidden lg:block' : ''}`}>
            <div className="bg-black rounded-lg border-1 border-white h-200 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {(!reduxMessages || reduxMessages.length === 0) ? (
                  <div className="text-center text-white mt-16">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-white" />
                    <p >Describe your project to generate functional requirements</p>
                    {refinedPrompt && refinedPrompt !== 'geyhetewery' && (
                      <p className="text-xs text-purple-600 mt-2">
                        Initial prompt available: {refinedPrompt.substring(0, 50)}...
                      </p>
                    )}
                  </div>
                ) : (
                  reduxMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
                          message.role === 'user'
                            ? 'bg-purple-600 text-white'
                            : message.isError
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-white'
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
                    <div className="max-w-xs rounded-lg px-3 py-2 text-sm bg-gray-100 text-white">
                      <div className="flex items-center gap-1">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="ml-2 text-white">Analyzing...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t p-4">
                <div className="flex gap-2 border-1 border-purple-500 text-white">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe your project..."
                    className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center min-w-16"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {refinedPrompt && refinedPrompt !== 'geyhetewery' && !inputMessage && (
                  <button 
                    onClick={() => setInputMessage(refinedPrompt)}
                    className="mt-2 text-xs text-purple-600 hover:text-purple-800 underline"
                  >
                    Use initial prompt: {refinedPrompt.substring(0, 30)}...
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Requirements Section */}
          <div className={`${activeTab !== 'requirements' ? 'hidden lg:block' : ''}`}>
            <div className="bg-black rounded-lg border-1 border-white">
              {reduxFunctionalReqs ? (
                <div className="h-200 overflow-y-auto p-4 space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h2 className="text-lg font-bold text-white">
                      Functional Requirements
                    </h2>
                    <span className="text-xs text-green-600">✓ Persisted</span>
                  </div>
                  
                  {Object.entries(reduxFunctionalReqs).map(([key, value]) => {
                    if (!value || (Array.isArray(value) && value.length === 0)) return null;
                    
                    return (
                      <div key={key} className="border-l-2 border-purple-200 pl-3">
                        <h3 className="font-semibold text-white mb-2 capitalize">
                          {key.replace(/_/g, ' ')}
                        </h3>
                        {renderValue(value)}
                      </div>
                    );
                  })}

                  {/* Debug info */}
                  <details className="mt-4 text-xs">
                    <summary className="cursor-pointer text-white">Debug Info</summary>
                    <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto">
                      {JSON.stringify(reduxFunctionalReqs, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <div className="h-200 flex items-center justify-center text-white">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-white" />
                    <p>No requirements generated yet</p>
                    {refinedPrompt && refinedPrompt !== 'geyhetewery' && (
                      <button 
                        onClick={() => setInputMessage(refinedPrompt)}
                        className="mt-4 px-4 py-2 bg-purple-500 text-white text-sm rounded-md hover:bg-purple-600 transition-colors"
                      >
                        Use Initial Prompt
                      </button>
                    )}
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