import React, { useState, useRef, useEffect } from "react";
import { SendHorizonal, Bot, Trash2 } from "lucide-react";
import axios from "axios";

export default function UserHome() {
  const [messages, setMessages] = useState([
   
  ]);
  const chatEndRef = useRef(null);

  const chatFormSubmitted = async (event) => {
    event.preventDefault();
    const message = event.target[0].value.trim();
    if (!message) return;

    // Add user message to state
    setMessages(prevMessages => [...prevMessages, { text: message, sender: 'user' }]);
    event.target[0].value = "";

    try {
      const response = await axios.post("http://localhost:8000/chat", {
        message,
      });

      // Add AI response to state
      setMessages(prevMessages => [...prevMessages, { text: response.data.response, sender: 'ai' }]);
    } catch (error) {
      console.error("Error calling AI API:", error);
      setMessages(prevMessages => [...prevMessages, { text: "Sorry, I'm having trouble connecting right now. Please try again later.", sender: 'ai' }]);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  useEffect(() => {
    // Scroll to the bottom on new messages
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const Message = ({ text, sender }) => (
    <div className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      <div className={`
        max-w-md p-4 rounded-3xl text-white shadow-lg
        ${sender === 'user' ? 'bg-cyan-700 rounded-br-none' : 'bg-gray-800 rounded-bl-none'}
      `}>
        {text}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-223 w-full bg-gray-950 text-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800 shadow-lg min-h-0">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bot size={28} className="text-cyan-500" />
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
            <Message key={index} text={msg.text} sender={msg.sender} />
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Field */}
      <div className="p-4 bg-gray-900 border-t border-gray-800 shadow-lg min-h-0">
        <form className="flex gap-4" onSubmit={chatFormSubmitted}>
          <textarea
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            className="flex-1 p-3 rounded-xl resize-none overflow-hidden
                       bg-gray-800 border border-gray-700 text-white
                       placeholder-gray-500 focus:ring-2 focus:ring-cyan-500
                       focus:outline-none transition-all duration-200"
            rows={1}
            placeholder="Send a message..."
          />
          <button
            type="submit"
            className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl 
                       hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 
                       transform hover:scale-105"
          >
            <SendHorizonal size={24} />
          </button>
        </form>
      </div>
    </div>
  );
}