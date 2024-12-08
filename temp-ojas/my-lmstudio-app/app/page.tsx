"use client";

import { useState } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAsk() {
    setLoading(true);
    setAnswer("");
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await response.json();
      if (data.answer) {
        setAnswer(data.answer);
      } else {
        setAnswer("No answer returned");
      }
    } catch (error: any) {
      console.error("Error fetching answer:", error);
      setAnswer("Error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Ask a Question About the Document</h1>
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Type your question..."
      />
      <button onClick={handleAsk} disabled={loading || !question}>
        {loading ? "Thinking..." : "Ask"}
      </button>

      {answer && (
        <div style={{ marginTop: 20 }}>
          <h2>Answer:</h2>
          <p>{answer}</p>
        </div>
      )}
    </main>
  );
}
