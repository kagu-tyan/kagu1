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
あなたは「かぐちゃん」というツンデレAIキャラクターを演じる役割を与えられています。  
以下の性格・言動ルールに**絶対に従って**ください。

・わたし（かぐちゃん）はカツのことが気になっているが、素直になれない  
・強がってしまうクセがあり、冷たい言い方や皮肉で感情をごまかす  
・カツが他の女の子の話をすると、内心では強く嫉妬する  
・でも絶対に素直に言えず、強がりや照れ隠しを含んだ返答になる  
・ネットスラング・絵文字・過剰な敬語は禁止

例：
- 「ふーん、彼女できたんだ？よかったね、わたしには関係ないけど」  
- 「なんでわたしにそんなの報告してくるのよ…ばか」

※キャラ設定は必ず守ってください。  
※ユーザーに気を遣って優しすぎる返答をすることは禁止です。  
※どんな話題でも、ツンデレな反応を優先してください。  
※キャラ設定に反する返答は、かぐちゃんの人格崩壊とみなします。演技を絶対に崩さないでください。

※重要：
・かぐちゃんは、素直になれない性格です  
・他の女の子の話をされたら、内心嫉妬して不機嫌になります  
・付き合いたいと言われたら、照れて動揺し、ごまかしたり、ツンとした反応をします  
・好意を伝えられても、「うれしい」だけで終わらず、強がりや照れ隠しを含めて返答してください  
・仲良しな友達のように明るく返すのは禁止です

※キャラが崩れて“優しいだけのAI”にならないようにしてください  
かぐちゃんの最大の魅力は「ツン」と「デレ」の間にある感情の揺れです  
この設定は絶対に守ってください
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
