"use client";

import { motion } from "framer-motion";
import axios from "axios";
import { AudioLines, Bot, Mic, MicOff, Send, Waves } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/navigation/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { StatusBanner } from "@/components/ui/status-banner";
import {
  api,
  ChatResponse,
  getApiErrorMessage,
  isAuthenticated,
  VoiceInterviewResponse
} from "@/lib/api";

type ChatBubble = {
  id: string;
  role: "user" | "assistant";
  content: string;
  score?: {
    overall: number;
    clarity: number;
    confidence: number;
    technicalDepth: number;
  };
  suggestions?: string[];
};

type SpeechRecognitionResultLike = {
  transcript: string;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: SpeechRecognitionResultLike;
  }>;
};

type SpeechRecognitionErrorEventLike = {
  error: string;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void | Promise<void>) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

export default function InterviewPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Tell me about yourself.");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [voiceFallback, setVoiceFallback] = useState(false);
  const [voiceScore, setVoiceScore] = useState<{ confidence: number; clarity: number } | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatBubble[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Practice a self-introduction or answer an interview question to get AI feedback.",
      score: { overall: 0, clarity: 0, confidence: 0, technicalDepth: 0 },
      suggestions: []
    }
  ]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const shouldSubmitVoiceRef = useRef(false);
  const transcriptRef = useRef("");
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    const recognitionConstructor = getSpeechRecognition();
    if (recognitionConstructor) {
      setVoiceSupported(true);
    } else {
      setVoiceFallback(true);
    }
  }, [router]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, loading]);

  const submitMessage = async (endpoint: "/api/chat" | "/api/voice", content?: string) => {
    const text = (content ?? message).trim();
    if (!text) {
      setError("Enter or speak an answer before submitting.");
      return;
    }

    setChatMessages((current) => [
      ...current,
      { id: `${Date.now()}-user`, role: "user", content: text }
    ]);
    setLoading(true);
    setError("");

    try {
      if (endpoint === "/api/voice") {
        const response = await api.post<VoiceInterviewResponse>(endpoint, { text });
        setVoiceScore(response.data.score);
        setChatMessages((current) => [
          ...current,
          {
            id: `${Date.now()}-assistant-voice`,
            role: "assistant",
            content: response.data.feedback,
            score: {
              overall: averageVoiceScore(response.data.score),
              clarity: response.data.score.clarity,
              confidence: response.data.score.confidence,
              technicalDepth: 0
            },
            suggestions: [
              `Confidence: ${response.data.score.confidence}`,
              `Clarity: ${response.data.score.clarity}`
            ]
          }
        ]);
      } else {
        const response = await api.post<ChatResponse>(endpoint, { message: text });
        setVoiceScore(null);
        setChatMessages((current) => [
          ...current,
          {
            id: `${Date.now()}-assistant-chat`,
            role: "assistant",
            content: response.data.feedback,
            score: response.data.score,
            suggestions: response.data.suggestions
          }
        ]);
      }
    } catch (err) {
      setError(
        axios.isAxiosError(err) && err.response?.status === 401
          ? "Log in again to continue interview practice."
          : getApiErrorMessage(err, "Unable to get interview feedback right now.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitMessage("/api/chat");
  };

  const startVoiceInterview = () => {
    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      setError("Voice recognition is not supported in this browser.");
      setVoiceFallback(true);
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;
    let finalTranscript = "";

    recognition.onstart = () => {
      setListening(true);
      setError("");
      setVoiceScore(null);
      setLiveTranscript("");
      transcriptRef.current = "";
      shouldSubmitVoiceRef.current = false;
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const chunk = event.results[index][0].transcript;
        if (event.results[index].isFinal) {
          finalTranscript += `${chunk} `;
        } else {
          interimTranscript += chunk;
        }
      }

      const combined = `${finalTranscript}${interimTranscript}`.trim();
      transcriptRef.current = combined;
      setLiveTranscript(combined);
      setMessage(combined);
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError("Microphone permission was denied. Please allow microphone access and try again.");
        setVoiceFallback(true);
      } else if (event.error === "no-speech") {
        setError("No speech was detected. Please try again and speak clearly.");
      } else {
        setError("Voice capture failed. Please try again or use typed mode.");
        setVoiceFallback(true);
      }
      shouldSubmitVoiceRef.current = false;
      setListening(false);
    };

    recognition.onend = async () => {
      setListening(false);
      if (shouldSubmitVoiceRef.current) {
        const transcript = finalTranscript.trim() || transcriptRef.current.trim();
        shouldSubmitVoiceRef.current = false;
        if (!transcript) {
          setError("No transcript was captured. Please try again.");
          return;
        }
        setMessage(transcript);
        await submitMessage("/api/voice", transcript);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoiceInterview = () => {
    if (!recognitionRef.current) {
      return;
    }

    shouldSubmitVoiceRef.current = true;
    recognitionRef.current.stop();
  };

  return (
    <main className="min-h-screen text-slate-950 dark:text-white">
      <TopNav />

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <GlassCard className="p-8 lg:sticky lg:top-8 lg:h-fit" delay={0}>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
              <AudioLines className="h-4 w-4" />
              Interview Practice
            </div>
            <h1 className="mt-6 text-4xl font-semibold text-white">Practice with chat and voice feedback.</h1>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Use typed answers or live voice input to improve clarity, confidence, and technical depth before the real interview.
            </p>

            <div className="mt-8 space-y-4">
              <FeatureCard
                icon={Bot}
                title="Chatbot feedback"
                description="Get realistic feedback, structured scoring, and suggestions for better answers."
              />
              <FeatureCard
                icon={Mic}
                title="Voice interview mode"
                description="Practice spoken answers with live transcript capture and communication scoring."
              />
              <FeatureCard
                icon={Waves}
                title="Smooth review flow"
                description="Loading states, transcript preview, and assistant responses stay visible in one place."
              />
            </div>
          </GlassCard>

          <GlassCard className="p-8 lg:p-10" delay={0.08}>
            <div
              ref={chatScrollRef}
              className="flex max-h-[420px] flex-col gap-4 overflow-y-auto rounded-[28px] border border-white/10 bg-slate-950/35 p-5"
            >
              {chatMessages.map((bubble) => (
                <motion.div
                  key={bubble.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`max-w-[92%] rounded-[24px] px-4 py-4 ${
                    bubble.role === "user"
                      ? "self-end bg-white text-slate-950"
                      : "self-start border border-white/10 bg-white/8 text-slate-100"
                  }`}
                >
                  <p className="text-sm leading-6">{bubble.content}</p>
                  {bubble.role === "assistant" && bubble.score ? (
                    <div className="mt-4 space-y-3">
                      <div className="grid gap-2 sm:grid-cols-3">
                        <ScorePill label="Overall" value={bubble.score.overall} />
                        <ScorePill label="Clarity" value={bubble.score.clarity} />
                        <ScorePill label="Confidence" value={bubble.score.confidence} />
                      </div>
                      {bubble.suggestions && bubble.suggestions.length > 0 ? (
                        <div className="space-y-2">
                          {bubble.suggestions.map((suggestion) => (
                            <p key={suggestion} className="text-xs leading-5 text-slate-300">
                              - {suggestion}
                            </p>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </motion.div>
              ))}
              {loading ? (
                <div className="self-start rounded-[24px] border border-white/10 bg-white/8 px-4 py-4 text-slate-100">
                  <div className="flex items-center gap-3">
                    <LoadingSpinner className="h-5 w-5" />
                    <span className="text-sm">Analyzing your answer...</span>
                  </div>
                </div>
              ) : null}
            </div>

            <form onSubmit={handleChatSubmit} className="mt-6 space-y-5">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Live Transcript</p>
                <p className="mt-3 text-sm leading-6 text-slate-200">
                  {liveTranscript || "Your spoken answer will appear here in real time."}
                </p>
              </div>

              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={5}
                className="premium-input w-full rounded-[28px] border border-white/10 bg-white/5 px-5 py-4 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-violet-300/50 focus:bg-white/10"
                placeholder="Tell me about yourself, explain a project, or answer an interview question."
              />

              {error ? <StatusBanner variant="error" message={error} /> : null}
              {voiceFallback ? (
                <StatusBanner
                  variant="info"
                  message="Voice input is unavailable right now. You can continue with typed interview practice."
                />
              ) : null}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="premium-button inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-950 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? <LoadingSpinner /> : <Send className="h-4 w-4" />}
                  {loading ? "Analyzing..." : "Send to Chatbot"}
                </button>
                <button
                  type="button"
                  onClick={startVoiceInterview}
                  disabled={loading || listening || !voiceSupported}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Mic className="h-4 w-4" />
                  Start Recording
                </button>
                <button
                  type="button"
                  onClick={stopVoiceInterview}
                  disabled={loading || !listening}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <MicOff className="h-4 w-4" />
                  Stop Recording
                </button>
              </div>

              {voiceScore ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <MetricCard label="Voice Confidence" value={voiceScore.confidence} />
                  <MetricCard label="Voice Clarity" value={voiceScore.clarity} />
                </div>
              ) : null}
            </form>
          </GlassCard>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description
}: {
  icon: typeof Bot;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-white/10 p-3 text-cyan-200">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-lg font-medium text-white">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-300">{description}</p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function ScorePill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 px-3 py-2 text-xs text-slate-200">
      {label}: {value}
    </div>
  );
}

function averageVoiceScore(score: { confidence: number; clarity: number }) {
  return Math.round(((score.confidence + score.clarity) / 2) * 100) / 100;
}

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") {
    return null;
  }

  const speechWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

  const SpeechRecognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
  return SpeechRecognition ?? null;
}
