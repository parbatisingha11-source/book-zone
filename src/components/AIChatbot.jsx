import { useState } from "react";
import "../CSS/AIChatbot.css";
import { apiRequest } from "../api";

const AIChatbot = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! 👋 I am your AI book assistant. How can I help you?"
    }
  ]);

  const sendMessage = async () => {
    if (message.trim() === "") return;

    const userMessage = message.trim();
    setMessages((current) => [...current, { sender: "user", text: userMessage }]);
    setMessage("");
    try {
      const recommendations = await apiRequest(
        `/recommendations?q=${encodeURIComponent(userMessage)}`
      );
      const reply = recommendations.length
        ? `📚 You might like: ${recommendations.map((book) => book.title).join(", ")}.`
        : "🤖 I couldn't find an exact match. Try a book title, author, or genre such as Fiction or Finance.";
      setMessages((current) => [...current, { sender: "ai", text: reply }]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        { sender: "ai", text: `Sorry, recommendations are unavailable: ${error.message}` },
      ]);
    }
  };

  return (
    <>
      {/* Ask AI Button */}
      {!open && (
        <button
          className="ask-ai-button"
          onClick={() => setOpen(true)}
        >
          🤖 Ask AI
        </button>
      )}

      {/* Chatbot */}
      {open && (
        <div className="ai-chatbot">

          <div className="ai-header">
            <span>🤖 AI Library Assistant</span>

            <button
              className="close-button"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="ai-body">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={
                  msg.sender === "user"
                    ? "user-message"
                    : "ai-message"
                }
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="ai-input-area">

            <input
              type="text"
              placeholder="Ask about books..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />

            <button onClick={sendMessage}>
              Send
            </button>

          </div>

        </div>
      )}
    </>
  );
};

export default AIChatbot;