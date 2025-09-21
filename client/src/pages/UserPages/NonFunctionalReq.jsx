import React, { useState, useRef, useEffect } from 'react';
import { Send, Shield, RefreshCw, Zap, Users, Monitor } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setRefinedPrompt, 
  setDeveloperOutput, 
  setFunctionalOutput, 
  setNonFunctionalOutput,
  setNonFunctionalRequirements,
  setNonFunctionalMessages,
  addNonFunctionalMessage,
  clearNonFunctional
} from "../../store/task/index";

const NonFunctionalReq = () => {
  const dispatch = useDispatch();
  const { 
    refinedPrompt, 
    developerOutput, 
    functionalOutput, 
    nonFunctionalOutput,
    nonFunctionalRequirements: reduxNonFunctionalReqs,
    nonFunctionalMessages: reduxMessages 
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
    if (reduxNonFunctionalReqs) {
      setActiveTab('requirements');
    }
  }, [refinedPrompt, reduxMessages, reduxNonFunctionalReqs]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = { role: 'user', content: inputMessage, timestamp: new Date() };
    
    // Dispatch to Redux instead of local state
    dispatch(addNonFunctionalMessage(userMessage));
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:6888/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputMessage })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      
      // Save to Redux
      dispatch(setNonFunctionalOutput(data.response));
      
      const aiMessage = { 
        role: 'assistant', 
        content: data.response, 
        timestamp: new Date()
      };
      
      dispatch(addNonFunctionalMessage(aiMessage));
      
      // Save non-functional requirements to Redux
      if (data.non_functional_requirements) {
        console.log('Saving non-functional requirements to Redux:', data.non_functional_requirements);
        dispatch(setNonFunctionalRequirements(data.non_functional_requirements));
        
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
      dispatch(addNonFunctionalMessage(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const resetConversation = async () => {
    try {
      await fetch('http://localhost:6000/reset', { method: 'POST' });
      
      // Clear Redux state
      dispatch(clearNonFunctional());
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

  const getRequirementIcon = (category) => {
    const iconMap = {
      performance_requirements: Zap,
      security_requirements: Shield,
      usability_requirements: Users,
      availability_requirements: Monitor,
      reliability_requirements: Shield,
      scalability_requirements: Zap,
      default: Monitor
    };
    return iconMap[category] || iconMap.default;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Critical': 'bg-red-100 text-red-700 border-red-200',
      'High': 'bg-orange-100 text-orange-700 border-orange-200',
      'Medium': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Low': 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[priority] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const renderMetrics = (metrics) => {
    if (!metrics) return null;
    
    return (
      <div className="space-y-1">
        {Array.isArray(metrics) ? (
          metrics.map((metric, index) => (
            <div key={index} className="text-sm text-white bg-black px-2 py-1 rounded">
              {metric}
            </div>
          ))
        ) : typeof metrics === 'object' ? (
          Object.entries(metrics).map(([key, value]) => (
            <div key={key} className="text-sm bg-black text-white px-2 py-1 rounded">
              <span className="font-medium">{key}:</span> {value}
            </div>
          ))
        ) : (
          <div className="text-sm bg-black px-2 py-1 rounded">{metrics}</div>
        )}
      </div>
    );
  };

  const renderRequirement = (category, requirement) => {
    if (!requirement) return null;

    const Icon = getRequirementIcon(category);
    const title = category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return (
      <div key={category} className="bg-black border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-white">{title}</h3>
          </div>
          {requirement.priority_level && (
            <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(requirement.priority_level)}`}>
              {requirement.priority_level}
            </span>
          )}
        </div>

        {requirement.specific_metrics && (
          <div>
            <h4 className="text-sm font-medium text-white mb-1">Metrics</h4>
            {renderMetrics(requirement.specific_metrics)}
          </div>
        )}

        {requirement.testing_criteria && (
          <div>
            <h4 className="text-sm font-medium text-white mb-1">Testing Criteria</h4>
            <div className="text-sm text-white">
              {Array.isArray(requirement.testing_criteria) 
                ? requirement.testing_criteria.join(', ')
                : requirement.testing_criteria}
            </div>
          </div>
        )}

        {requirement.constraints && (
          <div>
            <h4 className="text-sm font-medium text-white mb-1">Constraints</h4>
            <div className="text-sm text-white">
              {Array.isArray(requirement.constraints)
                ? requirement.constraints.join(', ')
                : requirement.constraints}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-black border-b p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-purple-600" />
            <div>
              <h1 className="text-xl font-bold text-purple-600">Non-Functional Requirements Analyzer</h1>
              {reduxNonFunctionalReqs && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ NFR analysis loaded from previous session
                </p>
              )}
            </div>
          </div>
          <button
            onClick={resetConversation}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-black hover:bg-black rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
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
            disabled={!reduxNonFunctionalReqs}
            className={`px-4 py-2 rounded text-sm font-medium ${
              activeTab === 'requirements' && reduxNonFunctionalReqs
                ? 'bg-purple-600 text-white'
                : reduxNonFunctionalReqs
                ? 'bg-black text-white'
                : 'bg-black text-gray-400 cursor-not-allowed'
            }`}
          >
            NFR Analysis {reduxNonFunctionalReqs && <span className="ml-1 text-xs">✓</span>}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Chat Section */}
          <div className={`${activeTab !== 'chat' ? 'hidden lg:block' : ''}`}>
            <div className="bg-black rounded-lg  border-1 border-white h-200 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {(!reduxMessages || reduxMessages.length === 0) ? (
                  <div className="text-center text-white mt-16">
                    <Shield className="h-12 w-12 mx-auto mb-2 text-white" />
                    <p className="mb-2 text-white">Analyze Non-Functional Requirements</p>
                    <p className="text-xs text-white">Performance • Security • Scalability • Reliability</p>
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
                        className={`max-w-lg rounded-lg px-3 py-2 text-sm ${
                          message.role === 'user'
                            ? 'bg-purple-600 text-white'
                            : message.isError
                            ? 'bg-black border-x-1 border-white text-red-700'
                            : 'bg-black border-x-1 border-white text-white'
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
                    <div className="max-w-xs rounded-lg px-3 py-2 text-sm bg-black text-white">
                      <div className="flex items-center gap-1">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="ml-2 text-white">Analyzing NFRs...</span>
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
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe your system's quality requirements..."
                    className="flex-1 rounded px-3 py-2 text-white border-1 border-purple-500 text-sm focus:outline-none focus:border-purple-500"
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:bg-black disabled:cursor-not-allowed flex items-center justify-center min-w-16"
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
              {reduxNonFunctionalReqs ? (
                <div className="h-200 overflow-y-auto p-4 space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h2 className="text-lg font-bold text-white">
                      Non-Functional Requirements
                    </h2>
                    <span className="text-xs text-green-600">✓ Persisted</span>
                  </div>
                  
                  {Object.entries(reduxNonFunctionalReqs).map(([category, requirement]) => 
                    renderRequirement(category, requirement)
                  )}

                  {/* Debug info */}
                  <details className="mt-4 text-xs">
                    <summary className="cursor-pointer text-white">Debug Info</summary>
                    <pre className="mt-2 p-2 bg-black rounded text-xs overflow-auto">
                      {JSON.stringify(reduxNonFunctionalReqs, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <div className="h-200 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Shield className="h-12 w-12 mx-auto mb-2 text-white" />
                    <p className='text-white'>No NFR analysis generated yet</p>
                    <p className="text-xs text-white mt-1">Quality attributes will appear here</p>
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

export default NonFunctionalReq;