"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Sparkles,
  Upload,
  Link2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
  Trash2,
  Brain,
  Settings,
  X,
  AlertCircle,
  Plus,
} from "lucide-react";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { GlassCard } from "@/components/shared/glass-card";
import { NeonButton } from "@/components/shared/neon-button";

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}
interface QuestionDraft {
  text: string;
  type: "MCQ" | "MULTI_SELECT";
  options: QuestionOption[];
  explanation: string;
  points: number;
  order: number;
}

const STEPS = [
  { number: 1, label: "Topic Selection" },
  { number: 2, label: "Content Input" },
  { number: 3, label: "AI Settings" },
  { number: 4, label: "Review" },
];

const HEADINGS = [
  { title: "Create New Quiz", desc: "Set up your quiz title and topic." },
  {
    title: "Add Content",
    desc: "Provide source material for AI question generation.",
  },
  {
    title: "AI Settings",
    desc: "Configure and generate quiz questions using AI.",
  },
  {
    title: "Review & Publish",
    desc: "Review your questions then publish the quiz.",
  },
];

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

function createDefaultQuestion(order: number): QuestionDraft {
  return {
    text: "",
    type: "MCQ",
    options: [
      { id: createId(), text: "", isCorrect: true },
      { id: createId(), text: "", isCorrect: false },
      { id: createId(), text: "", isCorrect: false },
      { id: createId(), text: "", isCorrect: false },
    ],
    explanation: "",
    points: 1,
    order,
  };
}

function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <GlassCard className="relative mb-8 flex flex-col items-center justify-between gap-4 overflow-hidden rounded-xl p-6 md:flex-row">
      <div className="absolute top-1/2 left-[10%] right-[10%] hidden h-1 -translate-y-1/2 bg-white/10 md:block">
        <div
          className="relative h-full bg-linear-to-r from-[#7030EF] to-[#DB1FFF] transition-all duration-500"
          style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
        >
          {currentStep < 4 && (
            <div className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white blur-[2px]" />
          )}
        </div>
      </div>
      {STEPS.map((step) => {
        const state =
          step.number < currentStep
            ? "done"
            : step.number === currentStep
              ? "active"
              : "pending";
        if (state === "done")
          return (
            <div
              key={step.number}
              className="relative z-10 flex flex-col items-center"
            >
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#7030EF] text-white shadow-[0_0_15px_rgba(112,48,239,0.5)]">
                <Check className="h-5 w-5" />
              </div>
              <span className="font-['Space_Grotesk'] text-[11px] uppercase tracking-widest text-[#CBC3D8]">
                {step.label}
              </span>
            </div>
          );
        if (state === "active")
          return (
            <div
              key={step.number}
              className="relative z-10 flex flex-col items-center"
            >
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#DB1FFF] bg-[#121414] font-['Space_Grotesk'] font-bold text-[#DB1FFF] shadow-[0_0_20px_rgba(219,31,255,0.25)]">
                {step.number}
              </div>
              <span className="font-['Space_Grotesk'] text-[11px] uppercase tracking-widest text-white drop-shadow-[0_0_5px_rgba(219,31,255,0.8)]">
                {step.label}
              </span>
            </div>
          );
        return (
          <div
            key={step.number}
            className="relative z-10 flex flex-col items-center opacity-50"
          >
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[#121414] font-['Space_Grotesk'] font-bold text-[#CBC3D8]">
              {step.number}
            </div>
            <span className="font-['Space_Grotesk'] text-[11px] uppercase tracking-widest text-[#CBC3D8]">
              {step.label}
            </span>
          </div>
        );
      })}
    </GlassCard>
  );
}

export function CreateQuizWizard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [quizId, setQuizId] = useState<string | null>(null);

  // Step 2
  const [activeTab, setActiveTab] = useState<"paste" | "upload" | "url">(
    "paste",
  );
  const [pastedText, setPastedText] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedText, setUploadedText] = useState("");
  const [urlInput, setUrlInput] = useState("");

  // Step 3
  const [questionCount, setQuestionCount] = useState(5);
  const [questionType, setQuestionType] = useState<
    "MCQ" | "MULTI_SELECT" | "MIXED"
  >("MCQ");
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);

  const contentContext =
    activeTab === "paste"
      ? pastedText
      : activeTab === "upload"
        ? uploadedText
        : urlInput;

  function addCustomQuestion() {
    setQuestions((prev) => [...prev, createDefaultQuestion(prev.length)]);
    setError("");
  }

  function updateQuestionAt(index: number, updater: (q: QuestionDraft) => QuestionDraft) {
    setQuestions((prev) => prev.map((q, i) => (i === index ? updater(q) : q)));
  }

  function toggleOptionCorrect(questionIndex: number, optionId: string) {
    updateQuestionAt(questionIndex, (question) => {
      const nextOptions = question.options.map((option) => {
        if (option.id !== optionId) return option;
        return { ...option, isCorrect: !option.isCorrect };
      });

      if (question.type === "MCQ") {
        const selected = nextOptions.find((option) => option.id === optionId);
        const selectedState = selected?.isCorrect ?? false;
        return {
          ...question,
          options: nextOptions.map((option) => ({
            ...option,
            isCorrect: option.id === optionId ? selectedState : false,
          })),
        };
      }

      return { ...question, options: nextOptions };
    });
  }

  function addOption(questionIndex: number) {
    updateQuestionAt(questionIndex, (question) => {
      if (question.options.length >= 6) return question;
      return {
        ...question,
        options: [...question.options, { id: createId(), text: "", isCorrect: false }],
      };
    });
  }

  function removeOption(questionIndex: number, optionId: string) {
    updateQuestionAt(questionIndex, (question) => {
      if (question.options.length <= 2) return question;
      let nextOptions = question.options.filter((option) => option.id !== optionId);

      if (!nextOptions.some((option) => option.isCorrect) && nextOptions.length > 0) {
        nextOptions = nextOptions.map((option, idx) => ({
          ...option,
          isCorrect: idx === 0,
        }));
      }

      return { ...question, options: nextOptions };
    });
  }

  function normalizeQuestionsForSave(drafts: QuestionDraft[]) {
    const normalized: QuestionDraft[] = [];

    for (let index = 0; index < drafts.length; index += 1) {
      const question = drafts[index];
      const text = question.text.trim();

      if (!text) {
        throw new Error(`Question ${index + 1} is empty`);
      }

      const options = question.options
        .map((option) => ({
          ...option,
          text: option.text.trim(),
        }))
        .filter((option) => option.text.length > 0)
        .slice(0, 6);

      if (options.length < 2) {
        throw new Error(`Question ${index + 1} needs at least 2 non-empty options`);
      }

      const correctCount = options.filter((option) => option.isCorrect).length;
      if (question.type === "MCQ" && correctCount !== 1) {
        throw new Error(`Question ${index + 1} (MCQ) must have exactly 1 correct answer`);
      }
      if (question.type === "MULTI_SELECT" && correctCount < 1) {
        throw new Error(`Question ${index + 1} needs at least 1 correct answer`);
      }

      normalized.push({
        text,
        type: question.type,
        options,
        explanation: question.explanation.trim(),
        points: Math.max(1, Math.min(10, Number(question.points) || 1)),
        order: index,
      });
    }

    return normalized;
  }

  async function handleCreateQuiz() {
    if (!title.trim()) {
      setError("Quiz title is required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          topic: topic.trim() || undefined,
          description: description.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to create quiz");
      }
      const quiz = await res.json();
      setQuizId(quiz.id);
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) =>
      setUploadedText((ev.target?.result as string).slice(0, 10000));
    reader.readAsText(file);
  }

  async function handleGenerate() {
    if (!quizId) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/quiz/${quizId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim() || title.trim(),
          count: questionCount,
          type: questionType,
          context: contentContext.slice(0, 5000) || undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Generation failed");
      }
      const { questions: qs } = await res.json();
      setQuestions(qs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish() {
    if (!quizId || questions.length === 0) {
      setError("Need at least 1 question");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const normalizedQuestions = normalizeQuestionsForSave(questions);

      const saveRes = await fetch(`/api/quiz/${quizId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: normalizedQuestions,
        }),
      });

      if (!saveRes.ok) {
        const payload = await saveRes.json().catch(() => null);
        throw new Error(payload?.error || "Failed to save questions");
      }

      const pubRes = await fetch(`/api/quiz/${quizId}/publish`, {
        method: "POST",
      });
      if (!pubRes.ok) {
        const payload = await pubRes.json().catch(() => null);
        throw new Error(payload?.error || "Failed to publish quiz");
      }

      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#121414] text-[#E2E2E2]">
      <AmbientBackground />

      {/* Header */}
      <GlassCard className="fixed inset-x-0 top-0 z-10 flex h-16 items-center justify-between px-8 rounded-none border-x-0 border-t-0">
        <div className="font-['Space_Grotesk'] text-2xl font-black uppercase tracking-[0.12em] text-white drop-shadow-[0_0_15px_#7030EF]">
          IntelliQ
        </div>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 font-['Space_Grotesk'] text-xs font-semibold uppercase tracking-widest text-[#CBC3D8] transition hover:text-white"
        >
          <X className="h-4 w-4" /> Exit Creator
        </button>
      </GlassCard>

      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 pt-24 pb-32 md:px-8">
        <div className="mb-8">
          <h1 className="mb-2 font-['Space_Grotesk'] text-4xl font-semibold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            {HEADINGS[step - 1].title}
          </h1>
          <p className="text-base text-[#CBC3D8]">{HEADINGS[step - 1].desc}</p>
        </div>

        <ProgressBar currentStep={step} />

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* ── Step 1: Topic Selection ── */}
        {step === 1 && (
          <GlassCard className="rounded-2xl p-8">
            <div className="flex flex-col gap-6">
              <div>
                <label className="mb-2 block font-['Space_Grotesk'] text-sm font-semibold uppercase tracking-widest text-[#CBC3D8]">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Introduction to Machine Learning"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-[#E2E2E2] placeholder-[#CBC3D8]/50 outline-none transition focus:border-[#DB1FFF] focus:ring-1 focus:ring-[#DB1FFF]"
                />
              </div>
              <div>
                <label className="mb-2 block font-['Space_Grotesk'] text-sm font-semibold uppercase tracking-widest text-[#CBC3D8]">
                  Topic / Subject
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Neural Networks, Python, World History"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-[#E2E2E2] placeholder-[#CBC3D8]/50 outline-none transition focus:border-[#DB1FFF] focus:ring-1 focus:ring-[#DB1FFF]"
                />
              </div>
              <div>
                <label className="mb-2 block font-['Space_Grotesk'] text-sm font-semibold uppercase tracking-widest text-[#CBC3D8]">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this quiz..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-[#E2E2E2] placeholder-[#CBC3D8]/50 outline-none transition focus:border-[#DB1FFF] focus:ring-1 focus:ring-[#DB1FFF]"
                />
              </div>
            </div>
          </GlassCard>
        )}

        {/* ── Step 2: Content Input ── */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex gap-2">
              {(["paste", "upload", "url"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 font-['Space_Grotesk'] text-xs font-semibold uppercase tracking-widest transition ${activeTab === tab ? "bg-[#7030EF] text-white" : "bg-white/5 text-[#CBC3D8] hover:bg-white/10"}`}
                >
                  {tab === "paste" && <FileText className="h-4 w-4" />}
                  {tab === "upload" && <Upload className="h-4 w-4" />}
                  {tab === "url" && <Link2 className="h-4 w-4" />}
                  {tab === "paste"
                    ? "Paste Text"
                    : tab === "upload"
                      ? "Upload File"
                      : "Import URL"}
                </button>
              ))}
            </div>

            {activeTab === "paste" && (
              <GlassCard className="rounded-2xl p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-['Space_Grotesk'] text-xl font-semibold text-white">
                    <FileText className="h-5 w-5 text-[#F8ACFF]" /> Paste Text
                  </h2>
                  <span className="rounded-full border border-[#7030EF] bg-[#7030EF]/10 px-3 py-1 font-['Space_Grotesk'] text-[11px] font-medium text-[#7030EF]">
                    {pastedText.trim().split(/\s+/).filter(Boolean).length} /
                    10,000 words
                  </span>
                </div>
                <textarea
                  className="min-h-[300px] w-full resize-y rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-[#E2E2E2] placeholder-[#CBC3D8]/50 outline-none transition focus:border-[#DB1FFF] focus:ring-1 focus:ring-[#DB1FFF]"
                  placeholder="Paste your article, study notes, or raw content here. The AI will extract key concepts to build your quiz..."
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                />
              </GlassCard>
            )}

            {activeTab === "upload" && (
              <GlassCard
                className="flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#DB1FFF]/50 bg-[#DB1FFF]/5 p-6 text-center transition hover:border-[#DB1FFF] hover:bg-[#DB1FFF]/10"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.csv,.text"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#DB1FFF]/20">
                  <Upload className="h-8 w-8 text-[#DB1FFF]" />
                </div>
                {uploadedFileName ? (
                  <>
                    <div className="mb-2 flex items-center gap-2 text-[#DB1FFF]">
                      <Check className="h-5 w-5" />
                      <span className="font-['Space_Grotesk'] font-semibold">
                        {uploadedFileName}
                      </span>
                    </div>
                    <p className="text-sm text-[#CBC3D8]">
                      {uploadedText.length.toLocaleString()} characters ready
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFileName("");
                        setUploadedText("");
                      }}
                      className="mt-3 text-xs text-red-400 hover:text-red-300"
                    >
                      Remove file
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="mb-2 font-['Space_Grotesk'] text-xl font-semibold text-white">
                      Upload Document
                    </h3>
                    <p className="mb-4 text-sm text-[#CBC3D8]">
                      TXT, MD, CSV (Max 10MB)
                    </p>
                    <NeonButton
                      variant="outline"
                      className="rounded-full px-6 py-2 text-[11px]"
                    >
                      Browse Files
                    </NeonButton>
                  </>
                )}
              </GlassCard>
            )}

            {activeTab === "url" && (
              <GlassCard className="rounded-2xl p-6">
                <h3 className="mb-4 flex items-center gap-2 font-['Space_Grotesk'] text-xl font-semibold text-white">
                  <Link2 className="h-5 w-5 text-[#F8ACFF]" /> Import from URL
                </h3>
                <p className="mb-4 text-sm text-[#CBC3D8]">
                  Enter a reference URL — it will be passed as context to the AI
                  generator.
                </p>
                <div className="relative">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-4 pr-12 text-sm text-[#E2E2E2] placeholder-[#CBC3D8]/50 outline-none transition focus:border-[#DB1FFF] focus:ring-1 focus:ring-[#DB1FFF]"
                    placeholder="https://example.com/article"
                  />
                  <span className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-[#7030EF] text-white">
                    <Link2 className="h-4 w-4" />
                  </span>
                </div>
              </GlassCard>
            )}
          </div>
        )}

        {/* ── Step 3: AI Settings ── */}
        {step === 3 && (
          <div className="space-y-6">
            <GlassCard className="rounded-2xl p-6">
              <h2 className="mb-6 flex items-center gap-2 font-['Space_Grotesk'] text-xl font-semibold text-white">
                <Settings className="h-5 w-5 text-[#F8ACFF]" /> Generation
                Settings
              </h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div>
                  <label className="mb-3 block font-['Space_Grotesk'] text-sm font-semibold uppercase tracking-widest text-[#CBC3D8]">
                    Number of Questions:{" "}
                    <span className="text-[#DB1FFF]">{questionCount}</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full accent-[#DB1FFF]"
                  />
                  <div className="mt-1 flex justify-between text-xs text-[#CBC3D8]/60">
                    <span>1</span>
                    <span>20</span>
                  </div>
                </div>
                <div>
                  <label className="mb-3 block font-['Space_Grotesk'] text-sm font-semibold uppercase tracking-widest text-[#CBC3D8]">
                    Question Type
                  </label>
                  <div className="flex flex-col gap-3">
                    {(["MCQ", "MULTI_SELECT", "MIXED"] as const).map((t) => (
                      <label
                        key={t}
                        className="flex cursor-pointer items-center gap-3"
                      >
                        <input
                          type="radio"
                          name="qtype"
                          value={t}
                          checked={questionType === t}
                          onChange={() => setQuestionType(t)}
                          className="accent-[#DB1FFF]"
                        />
                        <span className="text-sm text-[#E2E2E2]">
                          {t === "MCQ"
                            ? "Multiple Choice (1 correct)"
                            : t === "MULTI_SELECT"
                              ? "Multi-Select (multiple correct)"
                              : "Mixed (both types)"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="mt-8 flex items-center gap-2 rounded-xl px-8 py-4 font-['Space_Grotesk'] font-bold text-white transition hover:brightness-110 disabled:opacity-50"
                style={{
                  background: "linear-gradient(90deg, #7030EF, #DB1FFF)",
                  boxShadow: "0 0 20px rgba(219,31,255,0.3)",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Brain className="h-5 w-5" /> Generate {questionCount}{" "}
                    Questions
                  </>
                )}
              </button>
            </GlassCard>

            {questions.length > 0 && (
              <GlassCard className="rounded-2xl p-6">
                <h3 className="mb-4 font-['Space_Grotesk'] text-lg font-semibold text-white">
                  Preview ({questions.length} questions generated)
                </h3>
                <div className="max-h-72 overflow-y-auto space-y-3 pr-2">
                  {questions.map((q, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-white/10 bg-white/5 p-4"
                    >
                      <p className="text-sm text-[#E2E2E2]">
                        <span className="text-[#DB1FFF] font-semibold mr-2">
                          Q{i + 1}.
                        </span>
                        {q.text}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {q.options.map((o) => (
                          <span
                            key={o.id}
                            className={`text-xs px-2 py-1 rounded-full ${o.isCorrect ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-white/5 text-[#CBC3D8]"}`}
                          >
                            {o.text}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>
        )}

        {/* ── Step 4: Review ── */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={addCustomQuestion}
                className="flex items-center gap-2 rounded-lg border border-[#DB1FFF]/40 bg-[#DB1FFF]/10 px-4 py-2 font-['Space_Grotesk'] text-xs font-semibold uppercase tracking-widest text-[#DB1FFF] transition hover:bg-[#DB1FFF]/20"
              >
                <Plus className="h-4 w-4" /> Add Custom Question
              </button>
            </div>

            {questions.length === 0 ? (
              <GlassCard className="rounded-2xl p-8 text-center">
                <p className="text-[#CBC3D8]">
                  No questions yet. Add one manually or generate questions in
                  Step 3.
                </p>
              </GlassCard>
            ) : (
              questions.map((q, i) => (
                <GlassCard key={i} className="rounded-2xl p-6">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <span className="rounded-full bg-[#7030EF]/20 px-3 py-1 font-['Space_Grotesk'] text-xs font-semibold text-[#DB1FFF]">
                      Q{i + 1} · {q.type}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuestions((qs) => qs.filter((_, idx) => idx !== i))
                      }
                      className="rounded-lg p-2 text-red-400/60 transition hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-[11px] uppercase tracking-widest text-[#CBC3D8]">
                        Type
                      </label>
                      <select
                        value={q.type}
                        onChange={(e) => {
                          const nextType = e.target.value as "MCQ" | "MULTI_SELECT";
                          updateQuestionAt(i, (question) => {
                            if (nextType === "MCQ") {
                              const firstCorrect =
                                question.options.find((option) => option.isCorrect)?.id ??
                                question.options[0]?.id;
                              return {
                                ...question,
                                type: nextType,
                                options: question.options.map((option) => ({
                                  ...option,
                                  isCorrect: option.id === firstCorrect,
                                })),
                              };
                            }
                            return { ...question, type: nextType };
                          });
                        }}
                        className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-[#DB1FFF]"
                      >
                        <option value="MCQ">MCQ</option>
                        <option value="MULTI_SELECT">MULTI_SELECT</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] uppercase tracking-widest text-[#CBC3D8]">
                        Points
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={q.points}
                        onChange={(e) => {
                          const nextPoints = Number(e.target.value);
                          updateQuestionAt(i, (question) => ({
                            ...question,
                            points: Number.isFinite(nextPoints)
                              ? Math.max(1, Math.min(10, nextPoints))
                              : 1,
                          }));
                        }}
                        className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-[#DB1FFF]"
                      />
                    </div>
                  </div>

                  <input
                    type="text"
                    value={q.text}
                    onChange={(e) =>
                      updateQuestionAt(i, (question) => ({
                        ...question,
                        text: e.target.value,
                      }))
                    }
                    placeholder="Enter your question"
                    className="mb-3 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white outline-none focus:border-[#DB1FFF]"
                  />

                  <div className="space-y-2">
                    {q.options.map((o) => (
                      <div key={o.id} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleOptionCorrect(i, o.id)}
                          className={`rounded-lg border px-2 py-1 text-[10px] font-semibold uppercase tracking-widest transition ${o.isCorrect ? "border-green-500/40 bg-green-500/20 text-green-300" : "border-white/20 bg-white/5 text-[#CBC3D8] hover:border-[#DB1FFF]/40"}`}
                        >
                          {o.isCorrect ? "Correct" : "Mark"}
                        </button>

                        <input
                          type="text"
                          value={o.text}
                          onChange={(e) =>
                            updateQuestionAt(i, (question) => ({
                              ...question,
                              options: question.options.map((option) =>
                                option.id === o.id
                                  ? { ...option, text: e.target.value }
                                  : option
                              ),
                            }))
                          }
                          placeholder="Option text"
                          className="flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-[#DB1FFF]"
                        />

                        <button
                          type="button"
                          disabled={q.options.length <= 2}
                          onClick={() => removeOption(i, o.id)}
                          className="rounded-lg p-2 text-red-400/70 transition hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      disabled={q.options.length >= 6}
                      onClick={() => addOption(i)}
                      className="mt-2 flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-xs uppercase tracking-widest text-[#CBC3D8] transition hover:border-[#DB1FFF]/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Option
                    </button>
                  </div>

                  <textarea
                    value={q.explanation}
                    onChange={(e) =>
                      updateQuestionAt(i, (question) => ({
                        ...question,
                        explanation: e.target.value,
                      }))
                    }
                    placeholder="Optional explanation"
                    rows={2}
                    className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-[#CBC3D8] outline-none focus:border-[#DB1FFF]"
                  />
                </GlassCard>
              ))
            )}
          </div>
        )}

        {/* ── Footer Navigation ── */}
        <GlassCard className="mt-8 flex items-center justify-between rounded-xl border-t border-white/10 p-4">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => {
              setError("");
              setStep((s) => Math.max(1, s - 1) as 1 | 2 | 3 | 4);
            }}
            className="flex items-center gap-2 font-['Space_Grotesk'] text-[11px] font-semibold uppercase tracking-widest text-[#CBC3D8] transition hover:text-white disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          {step < 4 ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                if (step === 1) {
                  handleCreateQuiz();
                } else {
                  setError("");
                  setStep((s) => (s + 1) as 1 | 2 | 3 | 4);
                }
              }}
              className="flex items-center gap-2 rounded-lg px-8 py-3 font-['Space_Grotesk'] text-[11px] font-semibold uppercase tracking-widest text-white transition hover:brightness-110 disabled:opacity-50"
              style={{
                background: "linear-gradient(90deg, #7030EF, #DB1FFF)",
                boxShadow: "0 0 15px rgba(219,31,255,0.3)",
              }}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {step === 3 ? "Review Questions" : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              disabled={loading || questions.length === 0}
              className="flex items-center gap-2 rounded-lg px-8 py-3 font-['Space_Grotesk'] text-[11px] font-semibold uppercase tracking-widest text-white transition hover:brightness-110 disabled:opacity-50"
              style={{
                background: "linear-gradient(90deg, #7030EF, #DB1FFF)",
                boxShadow: "0 0 15px rgba(219,31,255,0.3)",
              }}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Publish Quiz
            </button>
          )}
        </GlassCard>
      </main>
    </div>
  );
}
