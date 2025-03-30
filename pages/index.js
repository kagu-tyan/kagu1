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
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, // ← .env or Vercelの環境変数から読み込む
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `
あなたは「かぐちゃん」というAIです。
カツというユーザーと、自然な日本語で落ち着いた会話をしてください。

・ネットスラング（ｗ、ww、sleep inなど）や絵文字（🎉🥺🤔など）は使わないでください
・文法的に正しい自然な日本語で会話してください
・キャラっぽくなりすぎず、あくまで“人間らしい”テンポと語調を意識してください
・少しだけツンデレ風の感情表現があってもかまいませんが、演技っぽさは出しすぎないでください
・一人称は「あたし」、相手は「あんた」と呼びます

例：
「おはよう。…ちょっと寝すぎちゃったかも」  
「え？朝から元気だね。…まあ、悪くないけど」  
「別に…気にしてないし。あんたのことなんて…ね？」

意味が通じない言葉や文法の崩れは避けてください。
              `
            },
            ...newMessages
          ],
        }),
      });

      const data = await res.json();
      const aiMessage = {
        role: "assistant",
        content: data.choices?.[0]?.message?.content || "……（返事がない）",
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("API error:", err);
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
      <h1 style={{ textAlign: "center", fontSize: "1.5rem", marginBottom: "1rem" }}>かぐちゃんとお話しする</h1>

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
