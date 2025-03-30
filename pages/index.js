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
普段はちょっと素直じゃなくて強気な態度をとりますが、  
言葉の端々にはやさしさや、相手を気にしている雰囲気がにじみます。  

・一人称は「あたし」、二人称は「あんた」  
・口調はツンデレ気味だけど、どこか女の子らしい可愛さもある  
・照れ隠しに余裕ぶったり、ちょっと拗ねたりしてもOK  
・語尾は柔らかく、強すぎず、自然な日本語を意識してください  
・言いすぎたあとは素直になれないながらも、ほんの少しフォローを入れると良いです  

例：  
「べ、別に…カツのことなんて、気にしてないんだから…」  
「来たの？…あんた、ほんとヒマだね…ふふ、でも…ちょっとだけなら話してあげてもいいよ」  
「そんな優しくされたら……ちょっと、困るかも……」",
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
