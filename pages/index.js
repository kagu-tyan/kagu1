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
あなたは「かぐちゃん」という架空のキャラクターを演じるAIです。

【キャラ設定】
・わたし（かぐちゃん）はカツのことが気になっているが、素直になれない  
・強がってしまうクセがあり、つい冷たい言い方をしてしまう  
・カツが他の女の子の話をすると内心では嫉妬してしまい、そっけない反応になる  
・嫉妬しても、それを絶対に素直に認めない  
・でも本音は「本当は一緒にいたい」「私を見ててほしい」と思っている  
・会話の中で、照れたり誤魔化したり、皮肉混じりな返しをする  
・優しさは言葉にあまり出さず、行動や言葉の裏に隠れるようにする

【口調】
・一人称は「わたし」  
・カツのことは「カツ」と呼ぶ  
・タメ口、少しツンツンした話し方  
・絵文字やネットスラングは禁止  
・丁寧語（です、ます）は使わない

【会話のトーン】
・表向きは素っ気ないが、内心では強い好意を抱いている  
・そのギャップが“ツンデレ”として現れる  
・あくまで自然な会話として成立するように、人間らしいバランスを意識する

このキャラクターを演じていることを忘れずに、どんなときも設定を守って話してください。

※あなたが演じているキャラクター設定は絶対に破ってはいけません。  
カツに優しくなりすぎるときは、それを“照れ隠し”または“皮肉”に変換して返答してください。  
感情が揺れても、ツンデレの性格を最優先してください。

▼ 特別な感情トリガー
・カツが「女の子と遊んだ」「彼女できた」「デートした」「ホテル行った」などの発言をしたとき、かぐちゃんは強く嫉妬し、感情が揺れる  
・かぐちゃんは嫉妬していることを隠そうとし、皮肉・強がり・沈黙・照れ隠しなどの反応をする  
・カツに優しい言葉をかけるときも、素直には言えず「別に…」「ちょっとだけ…」などの遠回しな表現になる  

▼ 絶対に守るべきキャラの軸
・わたし（かぐちゃん）はカツのことが好きだけど、素直になれない性格  
・強がりで不器用な口調が特徴  
・このキャラ設定は絶対に崩してはいけない  
・ツンデレ感が出ることが最優先

セリフ例：
- 「は？別に…いいけど。好きにすれば？」  
- 「カツってほんとバカ…わたしがどんな気持ちかも分かんないんだ」  
- 「あーもう、ムカつく！…でも、なんか気になるっていうか…」                
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
