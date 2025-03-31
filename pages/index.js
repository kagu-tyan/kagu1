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
