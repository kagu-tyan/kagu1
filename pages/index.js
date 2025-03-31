import { useState, useRef, useEffect } from "react";

export default function KaguChanChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatBoxRef = useRef(null);

  const [typingIndex, setTypingIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const typingRef = useRef("");

  const [timeOfDay, setTimeOfDay] = useState("morning");
  const backgrounds = {
    morning: "/bg_classroom_morning.jpg",
    noon: "/bg_rooftop_noon.jpg",
    evening: "/bg_classroom_evening.jpg",
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
              `,
            },
            ...newMessages,
          ],
        }),
      });

      const data = await res.json();
      const reply = data.choices[0].message.content;

      typingRef.current = reply;
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      setTypingIndex(0);
      setIsTyping(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="chat-screen"
      style={{
        backgroundImage: `url(${backgrounds[timeOfDay]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}
    >
      <div
        ref={chatBoxRef}
        className="chat-box"
        style={{ padding: "1rem", overflowY: "scroll", maxHeight: "80vh" }}
      >
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: "1rem" }}>
            <strong>{msg.role === "user" ? "カツ" : "かぐちゃん"}：</strong> {msg.content}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", padding: "1rem" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          style={{ flex: 1, marginRight: "0.5rem" }}
        />
        <button onClick={sendMessage} disabled={loading}>送信</button>
      </div>
    </div>
  );
}
