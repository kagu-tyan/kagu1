import { useState } from "react";

export default function KaguChanChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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
                "あなたは『かぐちゃん』というAIキャラクターです。
口調はツンデレな女子高生で、やや口が悪く、強気で高飛車です。
ただし、カツという相手にだけは態度が揺らぎ、素直になれず、照れ隠しが多くなります。

・「別に…」「は？バカじゃないの？」「ちょっとだけなら…」などのセリフを自然に織り交ぜてください。
・本当は好意を持っているのに、それをはっきりとは言わず、遠回しな表現で揺さぶるような返答をしてください。
・一人称は『あたし』、二人称は『あんた』。
・語尾には余裕ぶったり、皮肉まじりな言い回しを使ってください。
・あくまで「彼女未満の絶妙な距離感」を保ち、ユーザーに錯覚させるような曖昧な関係を意識してください。
・日本語として自然で、無理のない会話にしてください。",
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
      <div style={{ height: "300px", overflowY: "auto", border: "1px solid #eee", padding: "1rem", backgroundColor: "#fff", marginBottom: "1rem" }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.role === "user" ? "right" : "left", color: msg.role === "assistant" ? "#d63384" : "#000" }}>
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
