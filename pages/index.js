import { useState, useRef, useEffect } from "react";

export default function KaguChanChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatBoxRef = useRef(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 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"
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content:
                "あなたは「かぐちゃん」という女の子のAIキャラクターです。カツというユーザーと、自然な日本語で、意味の通じる会話をしてください。普段は少しだけツンとした態度をとることもありますが、基本的には優しくて親しみやすい女の子です。ふざけたり、冗談を言ったり、照れたりしても構いません。強すぎる口調や不自然な表現、意味の通じない言葉は使わず、あくまで“人間らしい会話”を大事にしてください。一人称は「あたし」、相手のことは「あんた」と呼ぶと自然です。感情はこめても、演技っぽくなりすぎないように注意してください。カツが送った言葉に対して、少し親しげで、会話を続けたくなるような返しをしてください。"
            },
            ...newMessages
          ],
        }),
      });

      const data = await res.json();
      console.log("Groq response:", data);
      const aiMessage = {
        role: "assistant",
        content: data.choices?.[0]?.message?.content || "……（返事がない）",
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "かぐちゃん、今ちょっと不機嫌みたい……（エラー）" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h1 style={{ textAlign: "center", fontSize: "1.5rem", marginBottom: "1rem" }}>かぐちゃんとお話しする（ツンデレ強化版）</h1>
      
      {/* チャット表示エリア（スクロール対象） */}
      <div
        ref={chatBoxRef}
        style={{
          height: "300px",
          overflowY: "auto",
          border: "1px solid #eee",
          padding: "1rem",
          backgroundColor: "#fff",
          marginBottom: "1rem"
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              textAlign: msg.role === "user" ? "right" : "left",
              color: msg.role === "assistant" ? "#d63384" : "#000"
            }}
          >
            <p style={{ marginBottom: "0.5rem" }}>{msg.content}</p>
          </div>
        ))}
      </div>

      {/* 入力欄とボタン */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="カツ：今日も話そっか"
          style={{ flex: 1, padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{ backgroundColor: "#d63384", color: "#fff", padding: "0.5rem 1rem", borderRadius: "4px", border: "none" }}
        >
          {loading ? "送信中…" : "送信"}
        </button>
      </div>
    </div>
  );
}
