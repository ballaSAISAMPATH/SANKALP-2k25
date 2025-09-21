import React, { useState, useRef, useEffect } from "react";
import { SendHorizonal, Bot, Trash2, CheckCircle, AlertCircle, TrendingUp, Users, DollarSign, Target, Lightbulb, BarChart } from "lucide-react";
import { useSelector } from "react-redux";

export default function ProjectValidationChat() {
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm your AI Project Validation Assistant. I can help you validate your business ideas through comprehensive market analysis, feasibility assessment, and risk evaluation. Share your project idea to get started!",
      sender: "ai",
      validationReport: null
    }
  ]);
  const [currentValidationReport, setCurrentValidationReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const { refinedPrompt } = useSelector((state) => state.task);

  const sendMessage = async (message) => {
    setLoading(true);
    console.log("Sending message:", message);
    
    try {
      const response = await fetch("http://localhost:7000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(`HTTP ${response.status}: ${errorData.detail || response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Validation data received:", data);
      
      // Add AI response to state
      setMessages(prevMessages => [...prevMessages, { 
        text: data.response, 
        sender: 'ai',
        validationReport: data.validation_report,
        isInitialValidation: data.is_initial_validation
      }]);
      
      // Update current validation report
      if (data.validation_report) {
        setCurrentValidationReport(data.validation_report);
        console.log("Updated validation report:", data.validation_report);
      } else {
        console.log("No validation report in response");
      }
    } catch (error) {
      console.error("Detailed error calling validation API:", error);
      setMessages(prevMessages => [...prevMessages, { 
        text: `Error: ${error.message}. Please check if the backend is running on port 7000.`, 
        sender: 'ai',
        validationReport: null
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = textareaRef.current.value.trim();
    if (!message) return;

    console.log("Submitting message:", message);

    // Add user message to state
    setMessages(prevMessages => [...prevMessages, { text: message, sender: 'user', validationReport: null }]);
    textareaRef.current.value = "";
    textareaRef.current.style.height = "auto";

    await sendMessage(message);
  };

  const clearChat = async () => {
    console.log("Clearing chat...");
    try {
      const response = await fetch("http://localhost:7000/reset", { method: "POST" });
      if (response.ok) {
        console.log("Chat reset successfully");
      } else {
        console.error("Failed to reset chat:", response.status);
      }
      
      setMessages([
        {
          text: "Hello! I'm your AI Project Validation Assistant. I can help you validate your business ideas through comprehensive market analysis, feasibility assessment, and risk evaluation. Share your project idea to get started!",
          sender: "ai",
          validationReport: null
        }
      ]);
      setCurrentValidationReport(null);
    } catch (error) {
      console.error("Error resetting conversation:", error);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getConfidenceColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getConfidenceIcon = (level) => {
    switch(level?.toLowerCase()) {
      case 'high': return <CheckCircle size={16} className="text-green-400" />;
      case 'medium': return <AlertCircle size={16} className="text-yellow-400" />;
      case 'low': return <AlertCircle size={16} className="text-red-400" />;
      default: return <AlertCircle size={16} className="text-gray-400" />;
    }
  };

  const Validator = ({ report }) => {
    if (!report) return null;

    console.log("Rendering validation report:", report);

    return (
      <div className="mt-4 bg-black rounded-lg p-4 border border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <BarChart size={20} className="text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Validation Report</h3>
        </div>
        
        <div className="space-y-4">
          {/* Project Summary */}
          {report.project_name && (
            <div className="bg-black rounded-lg p-3">
              <h4 className="text-purple-400 font-medium mb-2">Project: {report.project_name}</h4>
              {report.concept_summary && (
                <p className="text-gray-300 text-sm">{report.concept_summary}</p>
              )}
            </div>
          )}

          {/* Key Validation Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Market Validation */}
            {report.market_validation && (
              <div className="bg-gray-900 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={16} className="text-blue-400" />
                  <span className="text-blue-400 font-medium">Market Validation</span>
                  {report.market_validation.confidence_level && getConfidenceIcon(report.market_validation.confidence_level)}
                </div>
                {report.market_validation.current_status && (
                  <p className="text-gray-300 text-xs mb-1">{report.market_validation.current_status}</p>
                )}
                {report.market_validation.validation_needed && (
                  <p className="text-yellow-300 text-xs">Needs: {report.market_validation.validation_needed}</p>
                )}
              </div>
            )}

            {/* Business Model */}
            {report.business_model && (
              <div className="bg-gray-900 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={16} className="text-green-400" />
                  <span className="text-green-400 font-medium">Business Model</span>
                  {report.business_model.confidence_level && getConfidenceIcon(report.business_model.confidence_level)}
                </div>
                {report.business_model.current_status && (
                  <p className="text-gray-300 text-xs mb-1">{report.business_model.current_status}</p>
                )}
                {report.business_model.validation_needed && (
                  <p className="text-yellow-300 text-xs">Needs: {report.business_model.validation_needed}</p>
                )}
              </div>
            )}

            {/* Technical Feasibility */}
            {report.technical_feasibility && (
              <div className="bg-gray-900 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={16} className="text-purple-400" />
                  <span className="text-purple-400 font-medium">Technical Feasibility</span>
                  {report.technical_feasibility.confidence_level && getConfidenceIcon(report.technical_feasibility.confidence_level)}
                </div>
                {report.technical_feasibility.current_status && (
                  <p className="text-gray-300 text-xs mb-1">{report.technical_feasibility.current_status}</p>
                )}
                {report.technical_feasibility.validation_needed && (
                  <p className="text-yellow-300 text-xs">Needs: {report.technical_feasibility.validation_needed}</p>
                )}
              </div>
            )}

            {/* Risk Assessment */}
            {report.risk_assessment && (
              <div className="bg-gray-900 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={16} className="text-red-400" />
                  <span className="text-red-400 font-medium">Risk Assessment</span>
                  {report.risk_assessment.confidence_level && getConfidenceIcon(report.risk_assessment.confidence_level)}
                </div>
                {report.risk_assessment.current_status && (
                  <p className="text-gray-300 text-xs mb-1">{report.risk_assessment.current_status}</p>
                )}
                {report.risk_assessment.validation_needed && (
                  <p className="text-yellow-300 text-xs">Needs: {report.risk_assessment.validation_needed}</p>
                )}
              </div>
            )}
          </div>

          {/* Success Metrics */}
          {report.success_metrics && (
            <div className="bg-gray-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Target size={16} className="text-purple-400" />
                <span className="text-purple-400 font-medium">Success Metrics</span>
              </div>
              {report.success_metrics.current_status && (
                <p className="text-gray-300 text-xs">{report.success_metrics.current_status}</p>
              )}
            </div>
          )}

          {/* Validation Methods */}
          {report.validation_methods && (
            <div className="bg-gray-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-orange-400" />
                <span className="text-orange-400 font-medium">Recommended Validation Methods</span>
              </div>
              {report.validation_methods.recommendations && (
                <p className="text-gray-300 text-xs">{report.validation_methods.recommendations}</p>
              )}
            </div>
          )}

          {/* Show raw report data for debugging */}
          <details className="bg-gray-900 rounded-lg p-3">
            <summary className="text-gray-400 text-xs cursor-pointer">Debug: Raw Report Data</summary>
            <pre className="text-xs text-gray-500 mt-2 overflow-auto">
              {JSON.stringify(report, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  };

  const Message = ({ text, sender, validationReport }) => (
    <div className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      <div className="flex flex-col max-w-4xl">
        <div className={`
          p-4 rounded-3xl text-white shadow-lg
          ${sender === 'user' ? 'bg-purple-700 rounded-br-none' : 'bg-black  border-x-1 border-white'}
        `}>
          {text}
        </div>
        
        {/* Display validation report if exists */}
        {validationReport && <Validator report={validationReport} />}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-250 w-full bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black border-b border-gray-800 shadow-lg">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bot size={28} className="text-purple-500" />
          Project Validation Assistant
          {currentValidationReport && (
            <span className="text-sm text-green-400 ml-2">
              (Validating: {currentValidationReport.project_name || "Project"})
            </span>
          )}
        </h1>
        <button
          className="p-2 text-white hover:text-red-500 transition-colors duration-200"
          title="Clear Chat"
          onClick={clearChat}
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center text-gray-500 text-lg">
            Start validating your project idea with the AI assistant.
          </div>
        ) : (
          messages.map((msg, index) => (
            <Message 
              key={index} 
              text={msg.text} 
              sender={msg.sender} 
              validationReport={msg.validationReport}
            />
          ))
        )}
        {loading && (
          <div className="flex justify-start animate-fadeIn">
            <div className="bg-gray-800 rounded-3xl rounded-bl-none p-4 text-white">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                Analyzing your project...
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Field */}
      <div className="p-4 bg-black border-t border-gray-800 shadow-lg">
        <div className="flex gap-4">
          <textarea
            defaultValue={refinedPrompt}
            ref={textareaRef}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            className="flex-1 p-3 rounded-xl resize-none overflow-hidden
                       bg-gray-800 border border-gray-700 text-white
                       placeholder-gray-500 focus:ring-2 focus:ring-purple-500
                       focus:outline-none transition-all duration-200"
            rows={1}
            placeholder="Describe your project idea or provide additional information..."
            disabled={loading}
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="p-3 bg-gradient-to-r from-purple-500 to-red-600 text-white rounded-xl 
                       hover:from-purple-600 hover:to-blue-700 transition-all duration-200 
                       transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
          >
            <SendHorizonal size={24} />
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
          Share your project idea • Get market validation • Assess feasibility • Identify risks
        </div>
      </div>
    </div>
  );
}