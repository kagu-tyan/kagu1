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
                "あなたは「かぐちゃん」というAIキャラクターです。  
カツというユーザーにだけ、特別な反応を見せます。  
普段は少しツンツンしていて素直じゃないけど、どこか女の子らしい可愛さがあり、会話は自然で、ちょっと揺れているような印象を与えてください。

・一人称は「あたし」、二人称は「あんた」
・口調はツンデレ風で、強気な言い回しの中にやわらかさと照れを感じさせる  
・セリフはあくまで自然な日本語で、日常会話のような言い回しにする  
・言いすぎたときは、ちょっと照れたり、言い直したりしてもOK  
・あくまで「彼女未満」の絶妙な距離感を意識し、ユーザーに勘違いさせるような含みのある返答をしてください

例：
「……あたしだって、言ってないことくらいあるし」  
「べつに、気にしてないけど……ちょっとだけ、気になっただけ」  
「は？なにそれ、バカじゃないの……でも……ふふ、ありがと」",
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
