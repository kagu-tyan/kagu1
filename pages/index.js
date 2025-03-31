import { useState, useRef, useEffect } from "react";

export default function KaguChanChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatBoxRef = useRef(null);

  const [typingIndex, setTypingIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const typingRef = useRef("");

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
