import React, { useState, useRef, useEffect } from "react";
import { SendHorizonal, Bot, Trash2 } from "lucide-react";
import axios from "axios";
import { setRefinedPrompt } from "@/store/task"; 
import { useDispatch, useSelector } from "react-redux";

export default function UserHome() {
  const dispatch = useDispatch();
  const [messages, setMessages] = useState([
    {
      "text": "Hello! I'm your AI Requirements Assistant. I can help you transform your business ideas into clear, actionable requirements. How can I assist you today?",
      "sender": "ai",
      "options": null
    }
  ]);
  const chatEndRef = useRef(null);

  const sendMessage = async (message) => {
    try {
      const response = await axios.post("http://localhost:8000/chat", {
        message,
      });
      console.log(response.data);
      
      // Add AI response to state with options
      setMessages(prevMessages => [...prevMessages, { 
        text: response.data.response, 
        sender: 'ai',
        options: response.data.options || null
      }]);
      
      if (response.data.satisfied) {
        dispatch(setRefinedPrompt(response.data.final_prompt || ""));
        const res = await axios.post("http://localhost:5000/user/storeMongoDb",{prompt:response.data.final_prompt});
        console.log(res);
        
      }
    } catch (error) {
      console.error("Error calling AI API:", error);
      setMessages(prevMessages => [...prevMessages, { 
        text: "Sorry, I'm having trouble connecting right now. Please try again later.", 
        sender: 'ai',
        options: null
      }]);
    }
  };

  const chatFormSubmitted = async (event) => {
    event.preventDefault();
    const message = event.target[0].value.trim();
    if (!message) return;

    // Add user message to state
    setMessages(prevMessages => [...prevMessages, { text: message, sender: 'user', options: null }]);
    event.target[0].value = "";

    await sendMessage(message);
  };

  const handleOptionClick = async (option) => {
    // Add the selected option as a user message
    setMessages(prevMessages => [...prevMessages, { text: option, sender: 'user', options: null }]);
    
    // Send the selected option to backend
    await sendMessage(option);
  };

  const clearChat = () => {
    setMessages([
      {
        "text": "Hello! I'm your AI Requirements Assistant. I can help you transform your business ideas into clear, actionable requirements. How can I assist you today?",
        "sender": "ai",
        "options": null
      }
    ]);
  };

  useEffect(() => {
    // Scroll to the bottom on new messages
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const Message = ({ text, sender, options }) => (
    <div className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      <div className="flex flex-col max-w-md">
        <div className={`
          p-4 rounded-3xl text-white shadow-lg
          ${sender === 'user' ? 'bg-purple-700 rounded-br-none' : 'border-x-1 border-white '}
        `}>
          {text}
        </div>
        
        {/* Display options if they exist */}
        {options && options.length > 0 && (
          <div className="mt-3 space-y-2">
            <div className="text-sm text-gray-400 mb-2">Please select an option:</div>
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 
                         text-white rounded-lg transition-colors duration-200 
                         border border-gray-600 hover:border-gray-500 text-sm"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-250 w-full bg-black text-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black border-b border-gray-800 shadow-lg min-h-0">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bot size={28} className="text-purple-500" />
          AI Chat
        </h1>
        <button
          className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
          title="Clear Chat"
          onClick={clearChat}
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center text-gray-500 text-lg">
            Start a conversation with the AI assistant.
          </div>
        ) : (
          messages.map((msg, index) => (
            <Message 
              key={index} 
              text={msg.text} 
              sender={msg.sender} 
              options={msg.options}
            />
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Field */}
      <div className="p-4 bg-black border-t border-gray-800 shadow-lg min-h-0">
        <form className="flex gap-4" onSubmit={chatFormSubmitted}>
          <textarea
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            className="flex-1 p-3 rounded-xl resize-none overflow-hidden
                       bg-gray-800 border border-gray-700 text-white
                       placeholder-gray-500 focus:ring-2 focus:ring-purple-500
                       focus:outline-none transition-all duration-200"
            rows={1}
            placeholder="Send a message..."
          />
          <button
            type="submit"
            className="p-3 bg-gradient-to-r from-purple-500 to-red-600 text-white rounded-xl 
                       hover:from-purple-600 hover:to-red-700 transition-all duration-200 
                       transform hover:scale-105"
          >
            <SendHorizonal size={24} />
          </button>
        </form>
      </div>
    </div>
  );
}