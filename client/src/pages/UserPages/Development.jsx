import { useState, useRef, useEffect } from 'react';
import { Send, RefreshCw, Clock, Code2, Users, DollarSign, Layers,CloudUpload } from 'lucide-react';
import { useSelector } from 'react-redux';
const API_BASE_URL = 'http://localhost:8000';

export default function Development() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [projectPlan, setProjectPlan] = useState(null);
  const [isInitial, setIsInitial] = useState(true);
  const messagesEndRef = useRef(null);
  const {refinedPrompt} = useSelector((state)=>state.task)
  console.log(refinedPrompt);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
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
      
      const aiMessage = { role: 'assistant', content: data.response };
      setMessages(prev => [...prev, aiMessage]);
      
      if (data.project_plan) {
        setProjectPlan(data.project_plan);
      }
      
      setIsInitial(false);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your request. Please try again.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      await fetch(`${API_BASE_URL}/reset`, { method: 'POST' });
      setMessages([]);
      setProjectPlan(null);
      setIsInitial(true);
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
        refinedPrompt.length<=0 ? 
      <div className="text-center p-8 bg-gray-900 rounded-lg flex flex-col justify-center items-center h-screen shadow-lg">
        <CloudUpload size={64} className="mx-auto text-cyan-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">No Project Initialized Yet</h1>
        <p className="text-md">Please upload a project to get started.</p>
      </div>
      :
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {refinedPrompt}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Smart Project Planner</h1>
          <p className="text-gray-600">Transform your ideas into comprehensive project plans</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chat Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800">Conversation</h2>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 mt-20">
                    <Code2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg mb-2">Start planning your project!</p>
                    <p className="text-sm">Describe your project idea and I'll create a comprehensive plan for you.</p>
                  </div>
                )}
                
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
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
                <div className="flex gap-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isInitial ? "Describe your project idea..." : "How would you like to modify your project?"}
                    className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="2"
                    disabled={loading}
                  />
                  <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white p-2 rounded-lg transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Project Plan Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800">Project Plan</h2>
              </div>
              
              {projectPlan ? (
                <div className="p-4 space-y-4">
                  {/* Project Name & Description */}
                  {projectPlan.project_name && (
                    <div>
                      <h3 className="font-medium text-gray-800 mb-1">{projectPlan.project_name}</h3>
                      {projectPlan.description && (
                        <p className="text-sm text-gray-600">{projectPlan.description}</p>
                      )}
                    </div>
                  )}

                  {/* Key Sections */}
                  {Object.entries(projectPlan).map(([key, value]) => {
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
                          <h4 className="font-medium text-gray-800 capitalize">
                            {key.replace(/_/g, ' ')}
                          </h4>
                        </div>
                        <div className="text-sm text-gray-600">
                          {typeof value === 'object' ? (
                            <div className="space-y-1">
                              {Object.entries(value).map(([subKey, subValue]) => (
                                <div key={subKey} className="flex flex-col">
                                  <span className="font-medium capitalize">{subKey.replace(/_/g, ' ')}:</span>
                                  <span className="ml-2 text-gray-500">{formatValue(subValue)}</span>
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
                <div className="p-4 text-center text-gray-500 mt-20">
                  <Layers className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Your project plan will appear here once you describe your idea.</p>
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