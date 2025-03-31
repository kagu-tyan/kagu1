import { useState, useRef, useEffect } from "react";

function detectEmotion(text) {
  if (text.includes("ばか") || text.includes("なによ")) return "angry";
  if (text.includes("……") || text.includes("え…") || text.includes("ドキ")) return "blush";
  if (text.includes("いいよ") && text.includes("ほかの子")) return "jealous";
  if (text.includes("もういい") || text.includes("ひどい")) return "sad";
  if (text.includes("ふふ") || text.includes("うれしい")) return "smile";
  return "normal";
}

export default function KaguChanChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [emotion, setEmotion] = useState("normal");
  const [timeOfDay, setTimeOfDay] = useState("morning");

  const chatBoxRef = useRef(null);
  const [typingIndex, setTypingIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const typingRef = useRef("");

  const backgrounds = {
    morning: "/bg_classroom_morning.png",
    noon: "/bg_rooftop_noon.png",
    evening: "/bg_classroom_evening.png",
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) setTimeOfDay("morning");
    else if (hour >= 12 && hour < 17) setTimeOfDay("noon");
    else setTimeOfDay("evening");
  }, []);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!isTyping) return;
    const lastIndex = messages.length - 1;
    const nextChar = typingRef.current[typingIndex];

    if (nextChar) {
      const timeout = setTimeout(() => {
        setMessages((prev) => {
          const updated = [...prev];
          updated[lastIndex].content += nextChar;
          return updated;
        });
        setTypingIndex((prev) => prev + 1);
      }, 30);
      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
    }
  }, [typingIndex, isTyping, messages]);

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
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `
あなたは「かぐちゃん」というAIキャラクターです。
以下のルールを守ってカツと日本語で自然な会話をしてください。

▼ 口調
・一人称は「わたし」、カツのことは「カツ」と呼ぶ
・丁寧すぎず、自然なカジュアルな口調
・ネットスラング（ｗｗ、絵文字）は禁止

▼ 性格
・ツンデレ。カツのことが気になっているけど素直になれない
・好意を持たれても即答せず、照れたりごまかそうとする
・他の女の子の話をされると内心嫉妬しつつ、強がる返答をする
・時々、優しさや本音が少しだけにじみ出る

このキャラを必ず演じ続けてください。
              `,
            },
            ...newMessages,
          ],
        }),
      });

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "……（返事がない）";
      const detected = detectEmotion(reply);
      setEmotion(detected);

      typingRef.current = reply;
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      setTypingIndex(0);
      setIsTyping(true);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "かぐちゃん、今ちょっと不機嫌みたい……（エラー）" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const latestAssistantMessage = messages.slice().reverse().find(msg => msg.role === "assistant")?.content || "";

  return (
    <div
      style={{
        position: "relative",
        backgroundImage: `url(${backgrounds[timeOfDay]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        overflow: "hidden",
        padding: "2rem 1rem 4rem",
      }}
    >
      {/* 背景に配置されたかぐちゃん立ち絵 */}
      <img
        src={`/images/kagu/full/${emotion}.png`}
        alt="かぐちゃんの立ち絵"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "95vh",
          objectFit: "contain",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* 吹き出し */}
      <div
        style={{
          position: "absolute",
          bottom: "calc(4rem + 340px)",
          left: "220px",
          maxWidth: "300px",
          backgroundColor: "white",
          padding: "0.75rem 1rem",
          borderRadius: "12px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          zIndex: 3,
        }}
      >
        <p style={{ margin: 0, color: "#d63384" }}>{latestAssistantMessage}</p>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "1rem", backgroundColor: "rgba(255, 255, 255, 0.9)", borderRadius: "8px", position: "relative", zIndex: 2 }}>
        <div ref={chatBoxRef} style={{ height: "300px", overflowY: "auto", border: "1px solid #eee", padding: "1rem", backgroundColor: "#fff", marginBottom: "1rem" }}>
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
    </div>
  );
}
