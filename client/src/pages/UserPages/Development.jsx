import { useState, useRef, useEffect } from 'react';
import { Send, RefreshCw, Clock, Code2, Users, DollarSign, Layers, CloudUpload } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setRefinedPrompt, 
  setDeveloperOutput, 
  setFunctionalOutput, 
  setNonFunctionalOutput,
  setProjectPlan,
  setMessages,
  addMessage,
  clearProject
} from "../../store/task/index";

const API_BASE_URL = 'http://localhost:9000';

export default function Development() {
  const dispatch = useDispatch();
  const { 
    refinedPrompt, 
    developerOutput, 
    functionalOutput, 
    nonFunctionalOutput,
    projectPlan: reduxProjectPlan,
    messages: reduxMessages 
  } = useSelector((state) => state.task);

  // Use Redux state instead of local state
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isInitial, setIsInitial] = useState(true);
  const messagesEndRef = useRef(null);

  console.log('Redux state:', { refinedPrompt, reduxProjectPlan, reduxMessages });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [reduxMessages]);

  // Initialize component with existing data
  useEffect(() => {
    if (reduxMessages && reduxMessages.length > 0) {
      setIsInitial(false);
    }
    if (refinedPrompt && refinedPrompt !== 'geyhetewery') {
      setInput(refinedPrompt);
    }
  }, [refinedPrompt, reduxMessages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    
    // Dispatch to Redux instead of local state
    dispatch(addMessage(userMessage));
    setLoading(true);
    setInput('');

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      
      // Save all data to Redux
      await dispatch(setDeveloperOutput(data.response));
      
      const aiMessage = { role: 'assistant', content: data.response };
      dispatch(addMessage(aiMessage));
      
      // Most importantly - save the project plan to Redux
      if (data.project_plan) {
        console.log('Saving project plan to Redux:', data.project_plan);
        dispatch(setProjectPlan(data.project_plan));
      }
      
      setIsInitial(false);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your request. Please try again.' 
      };
      dispatch(addMessage(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      await fetch(`${API_BASE_URL}/reset`, { method: 'POST' });
      
      // Clear Redux state
      dispatch(clearProject());
      setIsInitial(true);
      setInput('');
    } catch (error) {
      console.error('Error resetting:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatValue = (value) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object' && value !== null) {
      return Object.entries(value).map(([k, v]) => `${k}: ${formatValue(v)}`).join(' | ');
    }
    return String(value);
  };

  return (
    <div>
      {
        refinedPrompt.length <= 0 ? 
        <div className="text-center p-8 bg-black rounded-lg flex flex-col justify-center items-center h-screen shadow-lg">
          <CloudUpload size={64} className="mx-auto text-purple-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">No Project Initialized Yet</h1>
          <p className="text-md">Please upload a project to get started.</p>
        </div>
        :
        <div className="min-h-screen bg-black">
          <div className="container mx-auto px-5 py-6 max-w-full">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">Smart Project Planner</h1>
              <p className="text-white">Transform your ideas into comprehensive project plans</p>
              {reduxProjectPlan && (
                <p className="text-sm text-purple-600 mt-2">
                  Project Plan Loaded: {reduxProjectPlan.project_name || 'Unnamed Project'}
                </p>
              )}
            </div>

            <div className="grid  lg:grid-cols-4 gap-6">
              {/* Chat Section */}
              <div className="lg:col-span-2 height-50">
                <div className="bg-black rounded-xl shadow-sm border border-gray-200 h-[600px] flex flex-col">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="font-semibold text-white">
                      Conversation ({reduxMessages ? reduxMessages.length : 0} messages)
                    </h2>
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-white hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Reset
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {(!reduxMessages || reduxMessages.length === 0) && (
                      <div className="text-center text-white mt-20">
                        <Code2 className="w-12 h-12 mx-auto mb-4 text-white" />
                        <p className="text-lg mb-2">Start planning your project!</p>
                        <p className="text-sm">Describe your project idea and I'll create a comprehensive plan for you.</p>
                        {refinedPrompt && refinedPrompt !== 'geyhetewery' && (
                          <p className="text-xs text-purple-600 mt-2">
                            Initial prompt loaded: {refinedPrompt.substring(0, 50)}...
                          </p>
                        )}
                      </div>
                    )}
                    
                    {reduxMessages && reduxMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-purple-500 text-white rounded-br-sm'
                              : 'bg-black text-white rounded-bl-sm'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 p-3 rounded-lg rounded-bl-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex gap-2 text-white">
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={isInitial ? "Describe your project idea..." : "How would you like to modify your project?"}
                        className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows="2"
                        disabled={loading}
                      />
                      <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white p-2 rounded-lg transition-colors"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Plan Sidebar */}
              <div className="lg:col-span-2">
                <div className="bg-black rounded-xl shadow-sm border border-gray-200 h-[800px] overflow-y-auto">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="font-semibold text-white">
                      Project Plan 
                      {reduxProjectPlan && (
                        <span className="text-sm text-green-600 font-normal ml-2">
                          ✓ Loaded
                        </span>
                      )}
                    </h2>
                  </div>
                  
                  {reduxProjectPlan ? (
                    <div className="p-4 space-y-4">
                      {/* Project Name & Description */}
                      {reduxProjectPlan.project_name && (
                        <div>
                          <h3 className="font-medium text-gray-800 mb-1">{reduxProjectPlan.project_name}</h3>
                          {reduxProjectPlan.description && (
                            <p className="text-sm text-gray-600">{reduxProjectPlan.description}</p>
                          )}
                        </div>
                      )}

                      {/* Key Sections */}
                      {Object.entries(reduxProjectPlan).map(([key, value]) => {
                        if (['project_name', 'description'].includes(key) || !value) return null;
                        
                        const getIcon = (key) => {
                          switch (key) {
                            case 'timeline': return <Clock className="w-4 h-4" />;
                            case 'budget_estimate': return <DollarSign className="w-4 h-4" />;
                            case 'resources': return <Users className="w-4 h-4" />;
                            default: return <Layers className="w-4 h-4" />;
                          }
                        };

                        return (
                          <div key={key} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              {getIcon(key)}
                              <h4 className="font-medium text-white capitalize">
                                {key.replace(/_/g, ' ')}
                              </h4>
                            </div>
                            <div className="text-sm text-white">
                              {typeof value === 'object' ? (
                                <div className="space-y-1">
                                  {Object.entries(value).map(([subKey, subValue]) => (
                                    <div key={subKey} className="flex flex-col">
                                      <span className="font-medium capitalize">{subKey.replace(/_/g, ' ')}:</span>
                                      <span className="ml-2 text-white">{formatValue(subValue)}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span>{formatValue(value)}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-white   mt-20">
                      <Layers className="w-12 h-12 mx-auto mb-4 text-white" />
                      <p>Your project plan will appear here once you describe your idea.</p>
                      {refinedPrompt && refinedPrompt !== 'geyhetewery' && (
                        <button 
                          onClick={() => setInput(refinedPrompt)}
                          className="mt-4 px-4 py-2 bg-purple-500 text-white text-sm rounded-md hover:bg-purple-600 transition-colors"
                        >
                          Use Initial Prompt
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  );
}