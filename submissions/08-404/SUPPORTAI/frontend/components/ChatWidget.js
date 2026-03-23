"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Languages, Mic, Send, Volume2, X } from "lucide-react";
import { sendChatMessage } from "../services/api";
import { useSpeech } from "../hooks/useSpeech";
import Timeline from "./Timeline";

const starterPrompts = [
  "My order is delayed",
  "Order marked delivered but not received",
  "Need refund for payment issue"
];

export default function ChatWidget({ order, user }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "SupportAI is ready. Tell me what went wrong and I will try to fix it before creating a ticket."
    }
  ]);
  const [typing, setTyping] = useState(false);
  const [learningMode, setLearningMode] = useState(true);
  const [voiceMode, setVoiceMode] = useState(false);
  const [lastIncident, setLastIncident] = useState(null);
  const scrollerRef = useRef(null);
  const { supported, listening, startListening, speak } = useSpeech();

  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [messages, typing]);

  useEffect(() => {
    if (order) {
      setOpen(true);
      setMessages([
        {
          sender: "bot",
          text: `You are chatting about ${order.name}. Ask in English, Hindi, Tamil, or Tanglish.`
        }
      ]);
      setLastIncident(null);
    }
  }, [order]);

  const transcript = useMemo(
    () =>
      messages.map((item) => ({
        sender: item.sender,
        text: item.text,
        language: "English"
      })),
    [messages]
  );

  const handleSend = async (draft) => {
    if (!draft?.trim() || !order) return;

    const userMessage = { sender: "user", text: draft };
    setMessages((current) => [...current, userMessage]);
    setMessage("");
    setTyping(true);

    try {
      const result = await sendChatMessage({
        message: draft,
        transcript,
        userId: user?.id,
        orderContext: order,
        learningMode
      });

      setMessages((current) => [
        ...current,
        {
          sender: "bot",
          text: result.response,
          meta: `${result.category} • ${result.severity}${result.ticket ? " • Ticket created" : " • Resolved"}`
        }
      ]);
      setLastIncident(result.incident);

      if (voiceMode) speak(result.response);
    } catch (error) {
      setMessages((current) => [
        ...current,
        { sender: "bot", text: error.message || "Something went wrong while processing the request." }
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((current) => !current)}
        className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-ink text-white shadow-soft transition hover:scale-105"
      >
        {open ? <X size={24} /> : <Bot size={24} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            className="fixed bottom-28 right-6 z-40 w-[min(420px,calc(100vw-24px))] overflow-hidden rounded-[30px] border border-white/50 bg-[#fffaf3]/90 shadow-soft backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lagoon">
                  AI Complaint Desk
                </p>
                <h3 className="text-lg font-semibold text-ink">Order support in your language</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setLearningMode((value) => !value)}
                  className={`rounded-full px-3 py-2 text-xs font-semibold ${learningMode ? "bg-lagoon text-white" : "bg-slate-200 text-slate-700"}`}
                >
                  <Languages size={14} className="inline-block" /> Learn
                </button>
                <button
                  onClick={() => setVoiceMode((value) => !value)}
                  className={`rounded-full px-3 py-2 text-xs font-semibold ${voiceMode ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-700"}`}
                >
                  <Volume2 size={14} className="inline-block" /> Voice
                </button>
              </div>
            </div>

            <div ref={scrollerRef} className="max-h-[55vh] space-y-4 overflow-y-auto px-4 py-4">
              {!order ? (
                <div className="rounded-3xl bg-white/80 p-4 text-sm text-slate-600">
                  Select an order card and tap <strong>Report Issue</strong> to start the complaint flow.
                </div>
              ) : null}

              {order ? (
                <div className="rounded-3xl bg-ink px-4 py-3 text-white">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/60">Active Order</p>
                  <p className="mt-2 font-medium">{order.name}</p>
                  <p className="text-sm text-white/75">{order.orderId}</p>
                </div>
              ) : null}

              {messages.map((item, index) => (
                <div
                  key={`${item.sender}-${index}`}
                  className={`flex ${item.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-[24px] px-4 py-3 text-sm ${
                      item.sender === "user"
                        ? "bg-lagoon text-white"
                        : "bg-white text-slate-700 shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-line">{item.text}</p>
                    {item.meta ? <p className="mt-2 text-xs opacity-70">{item.meta}</p> : null}
                  </div>
                </div>
              ))}

              {typing ? (
                <div className="inline-flex rounded-full bg-white px-4 py-2 text-sm text-slate-500">
                  SupportAI is typing...
                </div>
              ) : null}

              <Timeline timeline={lastIncident?.timeline} />
            </div>

            <div className="border-t border-slate-200/70 p-4">
              <div className="mb-3 flex flex-wrap gap-2">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="rounded-full bg-white px-3 py-2 text-xs text-slate-600 transition hover:bg-slate-100"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleSend(message);
                  }}
                  placeholder="Describe the issue..."
                  className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-lagoon"
                />
                {supported ? (
                  <button
                    onClick={() => startListening((text) => setMessage(text))}
                    className={`rounded-full p-3 ${listening ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-700"}`}
                  >
                    <Mic size={18} />
                  </button>
                ) : null}
                <button
                  onClick={() => handleSend(message)}
                  className="rounded-full bg-ink p-3 text-white transition hover:bg-amber-500"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
