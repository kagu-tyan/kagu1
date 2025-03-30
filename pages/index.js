import { useState, useRef, useEffect } from "react";

export default function KaguChanChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatBoxRef = useRef(null);

  // タイプライター用ステート
  const [displayedContent, setDisplayedContent] = useState("");
  const [typingIndex, setTypingIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, displayedContent]);

  useEffect(() => {
    if (!isTyping) return;
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "assistant") return;

    if (typingIndex < lastMessage.content.length) {
      const timeout = setTimeout(() => {
        setDisplayedContent((prev) =>
          prev + lastMessage.content[typingIndex]
        );
        setTypingIndex((prev) => prev + 1);
      }, 30); // ← 表示速度（ms）
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
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_KEY}`, // ← 環境変数に設定してね
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo", // 必要に応じて "gpt-4" に変更可
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
・好意を持たれても即答せず、照れたりごまかしたりする
・他の女の子の話をされると、内心嫉妬しつつ「別に」と言って強がる
・時々、優しさや本音が少しだけにじみ出る

▼ 例
・「は？なにいきなり…バカ」  
・「わたしには関係ないけど……ちょっとだけムカつく」  
・「そ、そんなわけないし！……でも、ありがと」

このキャラを一貫して演じ続けてください。  
かぐちゃんは「人間らしい、素直になれない女の子」です。
              `,
            },
            ...newMessages,
          ],
        }),
      });

      const data = await res.json();
      const aiMessage = {
        role: "assistant",
        content: data.choices?.[0]?.message?.content || "……（返事がない）",
      };

      setMessages((prev) => [...prev, aiMessage]);
      setDisplayedContent("");
      setTypingIndex(0);
      setIsTyping(true);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "かぐちゃん、今ちょっと不機嫌みたい……（エラー）",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "2rem auto",
        padding: "1rem",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "1.5rem",
          marginBottom: "1rem",
        }}
      >
        かぐちゃんとお話しする
      </h1>

      {/* チャット表示エリア */}
      <div
        ref={chatBoxRef}
        style={{
          height: "300px",
          overflowY: "auto",
          border: "1px solid #eee",
          padding: "1rem",
          backgroundColor: "#fff",
          marginBottom: "1rem",
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              textAlign: msg.role === "user" ? "right" : "left",
              color: msg.role === "assistant" ? "#d63384" : "#000",
            }}
          >
            <p style={{ marginBottom: "0.5rem" }}>
              {msg.role === "assistant" &&
              idx === messages.length - 1 &&
              isTyping
                ? displayedContent
                : msg.content}
            </p>
          </div>
        ))}
      </div>

      {/* 入力エリア */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="カツ：今日も話そっか"
          style={{
            flex: 1,
            padding: "0.5rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            backgroundColor: "#d63384",
            color: "#fff",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            border: "none",
          }}
        >
          {loading ? "送信中…" : "送信"}
        </button>
      </div>
    </div>
  );
}
