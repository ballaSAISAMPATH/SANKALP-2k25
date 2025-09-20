import React, { useState } from "react";

export default function NonFunctionalRequirements() {
  const [description, setDescription] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [started, setStarted] = useState(false);

  function showLoading(message) {
    setStatusMessage(
      <span className="flex items-center justify-center">
        <svg
          className="animate-spin h-5 w-5 mr-2 text-[#4B5548]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 
               0 5.373 0 12h4zm2 5.291A7.962 
               7.962 0 014 12H0c0 3.042 1.135 
               5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        {message}
      </span>
    );
  }

  function hideLoading() {
    setStatusMessage("");
  }

  function addMessageToChat(role, text) {
    setChatHistory((prev) => [...prev, { role, text }]);
  }

  async function callGeminiAPI(promptText) {
    showLoading("Generating response...");

    const payload = {
      contents: [...chatHistory, { role: "user", parts: [{ text: promptText }] }],
    };

    const apiKey = "AIzaSyBAJHmxT_JPxYRvsM8006-oF_r7jYhw2sM"; // replace with your key
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`API call failed: ${response.status}`);

      const result = await response.json();
      const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text;

      hideLoading();

      if (textContent) {
        addMessageToChat("model", textContent);
      } else {
        addMessageToChat("model", "Sorry, I could not generate a response.");
      }
    } catch (error) {
      hideLoading();
      addMessageToChat("model", `Error: ${error.message}`);
    }
  }

  async function handleValidate() {
    if (!description.trim()) {
      setStatusMessage("Please enter a description to validate.");
      return;
    }

    setStarted(true);
    addMessageToChat("user", description);

    const prompt = `Analyze the following business logic description and produce a detailed, well-structured list of its key non-functional requirements (NFRs). Organize the requirements by category (e.g., Performance, Security, Usability, Reliability). Provide a clear description for each. Use a heading for each category and indented bullet points. Description: "${description}"`;

    await callGeminiAPI(prompt);
  }

  async function handleSend() {
    if (!chatInput.trim()) return;
    addMessageToChat("user", chatInput);
    const question = chatInput;
    setChatInput("");
    await callGeminiAPI(question);
  }

  return (
    <div className="bg-[#F8F9FA] min-h-screen p-4 flex flex-col items-center font-inter">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl p-6 md:p-10 my-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#333333] mb-2">
            Non-Functional Requirements Validator
          </h1>
          <p className="text-gray-500 text-lg">
            {started
              ? "Chat with the AI about your system qualities."
              : "Define the quality attributes of your system with AI."}
          </p>
        </header>

        {/* Input Section */}
        {!started && (
          <section className="space-y-6">
            <label
              htmlFor="businessDescription"
              className="block text-[#333333] font-semibold text-lg"
            >
              Enter your business logic description:
            </label>
            <textarea
              id="businessDescription"
              rows="10"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B5548] focus:border-[#4B5548] transition duration-200"
              placeholder="e.g., 'A high-traffic e-commerce platform for vintage clothing...'"
            ></textarea>
            <div className="flex items-center justify-center mt-6">
              <button
                onClick={handleValidate}
                className="px-8 py-3 font-semibold rounded-full shadow-md transition duration-200 bg-[#4B5548] text-white hover:bg-[#5A6658] focus:outline-none focus:ring-2 focus:ring-[#4B5548]"
              >
                <span className="flex items-center space-x-2">
                  <span>Validate</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 
                         000 16zm3.707-9.293a1 1 0 
                         00-1.414-1.414L9 10.586 7.707 
                         9.293a1 1 0 00-1.414 1.414l2 
                         2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </section>
        )}

        {/* Chat Section */}
        {started && (
          <section>
            <div className="chat-container space-y-4 mb-4 p-4 border border-gray-200 rounded-lg h-96 overflow-y-auto">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col max-w-xl text-gray-800 prose prose-sm ${
                    msg.role === "user"
                      ? "ml-auto bg-[#E1F0E4] rounded-2xl p-4 shadow-md"
                      : "mr-auto bg-[#F0F4F0] rounded-2xl p-4 shadow-md"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <div className="flex items-center">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask a follow-up question about NFRs..."
                className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-[#4B5548] focus:border-[#4B5548] transition duration-200"
              />
              <button
                onClick={handleSend}
                className="px-6 py-3 font-semibold rounded-r-lg shadow-md transition duration-200 bg-[#4B5548] text-white hover:bg-[#5A6658] focus:outline-none focus:ring-2 focus:ring-[#4B5548]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.894 2.553a1 1 0 
                            00-1.788 0l-7 14a1 1 0 
                            00.149.337l1.492 1.492a1 
                            1 0 001.06-.06l6.012-4.008 
                            6.012 4.008a1 1 0 
                            001.06.06l1.492-1.492a1 
                            1 0 00.149-.337l-7-14z" />
                </svg>
              </button>
            </div>
          </section>
        )}

        {/* Status */}
        <div className="mt-4 text-center text-gray-500">{statusMessage}</div>
      </div>
    </div>
  );
}