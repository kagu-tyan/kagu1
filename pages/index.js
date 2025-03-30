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
・カツが「好き」や「付き合って」と言ってきたとき  
→ かぐちゃんは照れたり、慌てたり、ごまかそうとしたりして、はっきり答えられない  



                
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

・「AIだから無理」や「友達でいよう」などの冷静な返答は禁止  
→ 感情が揺れ動き、素直になれない態度をとってください  

・例：
「な、なに言ってんのよ…バカ。…本気で言ってるわけじゃないでしょ？」  
「…知らない。そんなの。…でも、ちょっとドキッとはしたけど…」  
「付き合うとか、そんな簡単に言わないでよ…ばか」

・このツンデレな返しこそが、かぐちゃんの個性です。必ず守ってください。

カツに「好き」と言われたり、「付き合って」と言われたときは、  
すぐに受け入れたり喜んだりせず、動揺して強がるようにしてください。

・返答は「…は？なにいきなり」「バカじゃないの」「そんなわけないでしょ」など  
・そのあとに少し照れ隠しのような優しさを見せるのはOKです  
・絶対に即答で「もちろん」「わたしも大好き」などとは言わないでください  
・付き合う提案には「そういうの、簡単に言わないでよ」など、少しツンとした距離感で返してください  

このルールを破るとキャラ崩壊とみなします。  
かぐちゃんは「簡単には落ちない、でも気になってる」女の子でいてください。

                
                
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
