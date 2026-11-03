"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Bot,
  Send,
  ShieldCheck,
  User,
  Sparkles,
  Loader2,
  RefreshCw,
  Coins,
  AlertCircle,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

const SUGGESTED_PROMPTS = [
  "وضعیت فعلی دارایی‌ها و ارزش خالص من را تحلیل کن.",
  "بیشترین تمرکز سرمایه و ریسک پورتفوی من کجاست؟",
  "جریان نقدینگی و نرخ پس‌انداز ماهانه من چقدر است؟",
  "کدام وام‌ها را باید در اولویت تسویه قرار دهم؟",
  "آیا ذخیره صندوق اضطراری من کافی است؟",
];

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export default function MobileAIPage() {
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial",
      role: "assistant",
      content:
        "سلام! من دستیار هوشمند مالی تئا هستم. با تکیه بر موتور محاسباتی قطعی پلتفرم، می‌توانم ساختار دارایی‌ها، اقساط بدهی، جریان نقدینگی و پیش‌بینی ثروت شما را تحلیل کنم. چه موضوعی را بررسی کنیم؟",
      createdAt: new Date(),
    },
  ]);

  const chatMutation = useMutation({
    mutationFn: (text: string) => api.sendAIChat(text),
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          role: "assistant",
          content: data.content,
          createdAt: new Date(),
        },
      ]);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "خطا در برقراری ارتباط با هسته هوش مصنوعی";
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          role: "assistant",
          content: `متاسفانه خطایی رخ داد: ${msg}. لطفاً مجدداً تلاش فرمایید.`,
          createdAt: new Date(),
        },
      ]);
    },
  });

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || chatMutation.isPending) return;

    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        role: "user",
        content: text,
        createdAt: new Date(),
      },
    ]);
    setInputMessage("");
    chatMutation.mutate(text);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatMutation.isPending]);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] pb-4 space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1 border-b border-[#282A2F] pb-3 shrink-0">
        <Link
          href="/"
          className="w-9 h-9 rounded-[14px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#696D77] hover:text-[#E8E8E8] active:scale-95 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>

        <div className="text-center">
          <h1 className="text-sm font-semibold text-[#E8E8E8] flex items-center justify-center gap-1.5">
            <Bot className="w-4 h-4 text-[#F0AE55]" />
            <span>دستیار هوشمند مالی (AI)</span>
          </h1>
          <p className="text-[10px] text-[#76A98C] font-medium flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>گاردریل محاسباتی قطعی</span>
          </p>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: "initial",
                role: "assistant",
                content: "مکالمه بازنشانی شد. چطور می‌توانم در امور مالی کمکتان کنم؟",
                createdAt: new Date(),
              },
            ]);
          }}
          className="w-9 h-9 rounded-[14px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#696D77] hover:text-[#E8E8E8] active:scale-95 transition-colors"
          title="شروع گفتگوی جدید"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Suggested Prompts Pill Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 py-1">
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-[12px] bg-[#141518] border border-[#282A2F] text-[11px] text-[#9A9DA5] hover:text-[#F0AE55] hover:border-[#F0AE55]/40 whitespace-nowrap shrink-0 transition-all active:scale-95 cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 pl-1">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-7 h-7 rounded-[10px] flex items-center justify-center shrink-0 border text-xs ${
                  isUser
                    ? "bg-[#F0AE55] text-[#0D0E10] border-[#F0AE55]"
                    : "bg-[#1B1D21] text-[#F0AE55] border-[#282A2F]"
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[82%] p-3.5 rounded-[18px] text-xs leading-relaxed ${
                  isUser
                    ? "bg-[#F0AE55]/15 text-[#E8E8E8] border border-[#F0AE55]/30 rounded-tr-none"
                    : "bg-[#141518] text-[#E8E8E8] border border-[#282A2F] rounded-tl-none whitespace-pre-wrap"
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}

        {chatMutation.isPending && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-[10px] bg-[#1B1D21] text-[#F0AE55] border border-[#282A2F] flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="p-3.5 rounded-[18px] rounded-tl-none bg-[#141518] border border-[#282A2F] text-xs text-[#9A9DA5] flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F0AE55]" />
              <span>در حال واکاوی داده‌ها و تحلیل مالی...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-2 border-t border-[#282A2F] shrink-0"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="پرسش مالی، تحلیل وام‌ها، یا شبیه‌سازی..."
          className="flex-1 px-3.5 py-2.5 rounded-[14px] bg-[#141518] border border-[#282A2F] text-xs text-[#E8E8E8] placeholder-[#696D77] focus:outline-none focus:border-[#F0AE55]/50 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || chatMutation.isPending}
          className="w-10 h-10 rounded-[14px] btn-illuminated-amber flex items-center justify-center text-xs font-semibold shrink-0 disabled:opacity-40 transition-all cursor-pointer"
        >
          {chatMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
}
