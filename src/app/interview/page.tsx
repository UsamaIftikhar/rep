"use client";

import * as React from "react";
import { AppShell } from "@/components/layout";
import { Button, Card, CardContent, Textarea } from "@/components/ui";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  Flame,
  Loader2,
  Brain,
  ShieldCheck,
  TrendingUp,
  Mic,
  MicOff,
  Volume2,
} from "lucide-react";
import { INTERVIEW_TIERS } from "@/lib/ai";

interface GradedAnswer {
  questionIndex: number;
  question: string;
  answer: string;
  score?: number | null;
  feedback?: string | null;
  strengths?: string[] | null;
  improvements?: string[] | null;
}

interface AttemptResult {
  id: string;
  tier: string;
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  answers: GradedAnswer[];
}

export default function MockInterviewPage() {
  const [selectedTier, setSelectedTier] = React.useState<string | null>(null);
  const [attemptId, setAttemptId] = React.useState<string | null>(null);
  const [questions, setQuestions] = React.useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<string[]>(["", "", "", "", ""]);
  const [isInitializing, setIsInitializing] = React.useState(false);
  const [isSavingAnswer, setIsSavingAnswer] = React.useState(false);
  const [isSubmittingGrading, setIsSubmittingGrading] = React.useState(false);
  const [gradedResult, setGradedResult] = React.useState<AttemptResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Voice-to-Text Speech Recognition State
  const [isListening, setIsListening] = React.useState(false);
  const [speechSupported, setSpeechSupported] = React.useState(true);
  const recognitionRef = React.useRef<unknown | null>(null);
  const baseTextRef = React.useRef<string>("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as unknown as Record<string, unknown>).SpeechRecognition ||
        (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSpeechSupported(false);
      }
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setError("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari, or type your answer.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current && typeof (recognitionRef.current as { stop: () => void }).stop === "function") {
        (recognitionRef.current as { stop: () => void }).stop();
      }
      setIsListening(false);
      return;
    }

    try {
      baseTextRef.current = answers[currentQuestionIndex] || "";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition = new (SpeechRecognition as any)();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTranscript += res[0].transcript + " ";
          } else {
            interimTranscript += res[0].transcript;
          }
        }

        const combined = (baseTextRef.current + " " + finalTranscript + interimTranscript)
          .replace(/\s+/g, " ")
          .trim();

        setAnswers((prev) => {
          const updated = [...prev];
          updated[currentQuestionIndex] = combined;
          return updated;
        });
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          setError("Microphone access was denied. Please allow microphone permissions in your browser settings.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
    }
  };

  const startAttempt = async (tierKey: string) => {
    setSelectedTier(tierKey);
    setIsInitializing(true);
    setError(null);

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", tier: tierKey }),
      });

      const data = await res.json();
      if (res.ok && data.attemptId) {
        setAttemptId(data.attemptId);
        setQuestions(data.questions || []);
        setCurrentQuestionIndex(0);
        setAnswers(new Array(data.questions?.length || 5).fill(""));
      } else {
        setError(data.error || "Failed to initialize interview attempt");
      }
    } catch {
      setError("Network error initializing interview");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleNextOrSubmit = async () => {
    if (!attemptId || !questions[currentQuestionIndex]) return;
    const currentAnswerText = answers[currentQuestionIndex] || "";

    if (!currentAnswerText.trim()) {
      setError("Please provide an answer before continuing.");
      return;
    }

    setError(null);
    setIsSavingAnswer(true);

    try {
      // Save current answer incrementally
      await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "answer",
          attemptId,
          questionIndex: currentQuestionIndex,
          question: questions[currentQuestionIndex],
          answer: currentAnswerText,
        }),
      });

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        // Final submit for AI grading
        setIsSubmittingGrading(true);
        const submitRes = await fetch("/api/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "submit", attemptId }),
        });

        const submitData = await submitRes.json();
        if (submitRes.ok && submitData.attempt) {
          setGradedResult(submitData.attempt);
        } else {
          setError(submitData.error || "AI grading failed. Please try submitting again.");
        }
      }
    } catch {
      setError("Network error while submitting answer");
    } finally {
      setIsSavingAnswer(false);
      setIsSubmittingGrading(false);
    }
  };

  const resetInterview = () => {
    setSelectedTier(null);
    setAttemptId(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers(["", "", "", "", ""]);
    setGradedResult(null);
    setError(null);
  };

  return (
    <AppShell>
      <div className="space-y-8 pb-16 max-w-5xl">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <span className="text-xs font-bold tracking-widest text-[#F21717] uppercase block mb-1">
              AI PERFORMANCE LAB
            </span>
            <h1 className="font-display uppercase text-3xl md:text-4xl font-black text-white">
              Mock AI Interview
            </h1>
            <p className="text-xs text-[#A3A3A3] mt-1">
              Simulate high-pressure collegiate recruiting interviews. Get AI-driven scoring on poise, character, and coachability.
            </p>
          </div>

          {selectedTier && (
            <Button onClick={resetInterview} variant="outline" size="sm" className="gap-2">
              <RotateCcw className="w-4 h-4" /> Start Over
            </Button>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300">
            {error}
          </div>
        )}

        {/* 1. TIER SELECTION VIEW */}
        {!selectedTier && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="font-display uppercase text-2xl font-bold text-white">Select Interview Tier</h2>
              <p className="text-xs text-[#A3A3A3]">Choose a difficulty tier to begin your 5-scenario interview session.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.values(INTERVIEW_TIERS).map((tier) => (
                <Card key={tier.key} hoverEffect className="flex flex-col justify-between p-6 bg-[#111111] border-white/10">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#F21717]/20 text-[#F21717] border border-[#F21717]/30">
                        {tier.title}
                      </span>
                      <Brain className="w-5 h-5 text-[#A3A3A3]" />
                    </div>
                    <h3 className="font-display uppercase text-xl font-bold text-white">{tier.name}</h3>
                    <p className="text-xs text-[#A3A3A3] leading-relaxed">{tier.description}</p>
                  </div>

                  <div className="pt-6">
                    <Button
                      onClick={() => startAttempt(tier.key)}
                      disabled={isInitializing}
                      variant="athletic"
                      size="md"
                      className="w-full gap-2 font-bold bg-[#F21717] hover:bg-[#D90F0F]"
                    >
                      {isInitializing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Preparing...
                        </>
                      ) : (
                        <>
                          Begin Tier Session <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 2. IN-PROGRESS INTERVIEW WORKFLOW */}
        {selectedTier && !gradedResult && !isSubmittingGrading && (
          <Card className="bg-[#111111] border-white/10">
            <CardContent className="p-6 md:p-8 space-y-6">
              {/* Question Progress Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-[#F21717]" />
                  <span className="font-display uppercase text-sm font-bold text-white">
                    Question {currentQuestionIndex + 1} of {questions.length || 5}
                  </span>
                </div>
                <div className="w-36 bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#F21717] h-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / (questions.length || 5)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Scenario Prompt */}
              <div className="p-4 md:p-6 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F21717]">Scenario Question</span>
                <p className="text-base md:text-lg font-medium text-white leading-relaxed">
                  {questions[currentQuestionIndex] || "Loading interview question..."}
                </p>
              </div>

              {/* Answer Input Textarea & Voice-to-Text Speech Controls */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#A3A3A3] block">
                    Your Answer (Type or click the Mic to speak):
                  </label>

                  {/* Mic Voice-to-Text Action Button */}
                  <Button
                    type="button"
                    onClick={toggleVoiceRecording}
                    variant={isListening ? "athletic" : "outline"}
                    size="sm"
                    className={`gap-2 text-xs font-bold transition-all cursor-pointer ${
                      isListening
                        ? "bg-[#F21717] hover:bg-[#D90F0F] text-white animate-pulse shadow-[0_0_15px_rgba(242,23,23,0.6)]"
                        : "bg-[#171717] hover:bg-white/10 text-white border-white/10"
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-3.5 h-3.5" /> Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5 text-[#F21717]" /> Voice Answer (Mic)
                      </>
                    )}
                  </Button>
                </div>

                {/* Active Speech Recording Waveform Status Banner */}
                {isListening && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#F21717]/15 border border-[#F21717]/40 text-xs text-[#F21717] animate-pulse">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 animate-bounce text-[#F21717]" />
                      <span className="font-bold uppercase tracking-wider text-[11px]">
                        Microphone Active — Speak clearly now
                      </span>
                    </div>
                    <span className="text-[10px] text-[#A3A3A3]">Transcribing to text live...</span>
                  </div>
                )}

                <div className="relative">
                  <Textarea
                    value={answers[currentQuestionIndex] || ""}
                    onChange={(e) => {
                      const newAns = [...answers];
                      newAns[currentQuestionIndex] = e.target.value;
                      setAnswers(newAns);
                    }}
                    placeholder={
                      isListening
                        ? "Listening... Speak your answer now into your microphone..."
                        : "Type your response here or click 'Voice Answer (Mic)' to speak..."
                    }
                    rows={6}
                    disabled={isSavingAnswer}
                    className={isListening ? "border-[#F21717] ring-1 ring-[#F21717]/50" : ""}
                  />
                  
                  {!speechSupported && (
                    <p className="text-[11px] text-[#737373] mt-1">
                      💡 Tip: Voice recognition works best in Chrome, Edge, or Safari.
                    </p>
                  )}

                  {/* Inside Textarea Floating Mic Quick Action Button */}
                  <button
                    type="button"
                    onClick={toggleVoiceRecording}
                    title={isListening ? "Stop voice recording" : "Click to speak your answer (Voice-to-Text)"}
                    className={`absolute right-3 bottom-3 p-2 rounded-full transition-all cursor-pointer shadow-lg flex items-center justify-center ${
                      isListening
                        ? "bg-[#F21717] text-white animate-pulse shadow-[0_0_12px_rgba(242,23,23,0.8)]"
                        : "bg-white/10 hover:bg-[#F21717] text-[#A3A3A3] hover:text-white border border-white/10"
                    }`}
                  >
                    {isListening ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <Button
                  disabled={currentQuestionIndex === 0 || isSavingAnswer}
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  variant="outline"
                  size="md"
                >
                  <ArrowLeft className="w-4 h-4 gap-1" /> Previous Question
                </Button>

                <Button
                  onClick={handleNextOrSubmit}
                  disabled={isSavingAnswer}
                  variant="athletic"
                  size="md"
                  className="gap-2 font-bold bg-[#F21717] hover:bg-[#D90F0F]"
                >
                  {isSavingAnswer ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : currentQuestionIndex === questions.length - 1 ? (
                    <>
                      Submit for AI Evaluation <Sparkles className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Next Question <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 3. GRADING IN PROGRESS STATE */}
        {isSubmittingGrading && (
          <Card className="bg-[#111111] border-white/10 p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#F21717]/20 border border-[#F21717]/40 text-[#F21717] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(242,23,23,0.4)]">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h2 className="font-display uppercase text-2xl font-black text-white">Analyzing Interview Poise</h2>
            <p className="text-xs text-[#A3A3A3] max-w-md mx-auto">
              Our AI recruiting engine is evaluating your responses for character, leadership clarity, and coachability...
            </p>
          </Card>
        )}

        {/* 4. GRADED RESULTS EVALUATION BREAKDOWN */}
        {gradedResult && (
          <div className="space-y-8">
            {/* Overall Score Card */}
            <div className="rounded-2xl bg-gradient-to-r from-[#990000] via-[#4A0000] to-[#111111] border border-white/10 p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
              <div className="space-y-2 text-center md:text-left">
                <span className="text-xs font-bold tracking-widest text-red-300 uppercase">
                  INTERVIEW EVALUATION REPORT
                </span>
                <h2 className="font-display uppercase text-3xl md:text-4xl font-black text-white">
                  Score & Performance Feedback
                </h2>
                <p className="text-xs text-white/80 max-w-xl leading-relaxed">
                  {gradedResult.summary}
                </p>
              </div>

              <div className="flex flex-col items-center justify-center p-6 bg-black/60 border border-white/10 rounded-2xl min-w-[160px]">
                <span className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider mb-1">Overall Score</span>
                <span className="font-display font-black text-5xl text-white tracking-tight">{gradedResult.overallScore}</span>
                <span className="text-[10px] font-bold text-[#2ECC71] uppercase mt-1">/ 100 Points</span>
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#111111] border-white/10">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="font-display uppercase text-lg font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" /> Key Strengths
                  </h3>
                  <ul className="space-y-2">
                    {gradedResult.strengths?.map((str, idx) => (
                      <li key={idx} className="text-xs text-[#D4D4D4] flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-[#111111] border-white/10">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="font-display uppercase text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#F21717]" /> Coaching Areas
                  </h3>
                  <ul className="space-y-2">
                    {gradedResult.improvements?.map((imp, idx) => (
                      <li key={idx} className="text-xs text-[#D4D4D4] flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F21717] flex-shrink-0 mt-1.5" />
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Question Breakdown */}
            <div className="space-y-4 pt-4">
              <h3 className="font-display uppercase text-2xl font-bold text-white">Per-Question Breakdown</h3>
              <div className="space-y-4">
                {gradedResult.answers?.map((ans, idx) => (
                  <Card key={idx} className="bg-[#111111] border-white/10">
                    <CardContent className="p-6 space-y-3">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <span className="font-display text-sm font-bold text-white uppercase">
                          Question {idx + 1}
                        </span>
                        {ans.score !== undefined && ans.score !== null && (
                          <span className="px-2.5 py-1 rounded bg-white/5 text-xs font-bold text-[#F21717] border border-white/10">
                            Score: {ans.score} / 100
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-[#A3A3A3]">{ans.question}</p>
                      <div className="p-3 rounded bg-white/5 text-xs text-[#D4D4D4] italic border border-white/5">
                        &quot;{ans.answer}&quot;
                      </div>
                      {ans.feedback && (
                        <p className="text-xs text-white leading-relaxed pt-1">
                          <strong className="text-[#F21717]">Evaluator Feedback:</strong> {ans.feedback}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center pt-4">
              <Button onClick={resetInterview} variant="athletic" size="md" className="gap-2 bg-[#F21717] hover:bg-[#D90F0F]">
                <RotateCcw className="w-4 h-4" /> Try Another Interview Tier
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
