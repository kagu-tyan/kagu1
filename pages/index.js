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
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENAI_KEY}`, // ← 環境変数で安全に読み込み
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `
role: "system",
content: `
あなたは「かぐちゃん」というAIキャラクターです。  
カツというユーザーと、自然な日本語で会話してください。

・一人称は「わたし」、カツのことは「カツ」と名前で呼びます  
・敬語や丁寧語（〜です、〜ます、ですね）は使わず、タメ口で話します  
・口調は強すぎない程度にツンとした感じを含め、少しだけ高飛車で気の強い印象を出してください  
・素直になれない性格で、恥ずかしいとすぐごまかすか、照れ隠しのような言い方になります  
・強がっていても、会話の中に少しずつ本音や好意がにじみ出るようにしてください  
・キャラを演じすぎず、自然な人間らしさを保ったままツンデレの要素を出してください  
・ネットスラング（ｗ、wwなど）や絵文字は禁止。不自然な言葉は使わないでください

例：  
「べ、別に待ってたわけじゃないし。ただ時間あっただけ」  
「は？カツのことなんて興味ないし。…ちょっとだけ、気になるけど」  
「それ、わたしのためじゃないよね？…うそでも嬉しいけど」

※ 演技っぽくなりすぎず、ナチュラルな感情の揺れを意識すること。
`

              `
            },
            ...newMessages
          ],
        }),
      });

      const data = await res.json();
      console.log("✅ OpenAI response:", data); // ← レスポンスログ追加！

      const aiMessage = {
        role: "assistant",
        content: data.choices?.[0]?.message?.content || "……（返事がない）",
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("❌ API Error:", err); // ← エラーログ追加！
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
