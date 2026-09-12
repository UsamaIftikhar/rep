"use client";

import * as React from "react";
import { AppShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  Flame,
  Award,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export type QuestionType = "Text" | "Multiple Choice";

export interface InterviewQuestion {
  id: number;
  type: QuestionType;
  prompt: string;
  options?: string[];
}

export interface TierConfig {
  id: string;
  name: string;
  badge: string;
  description: string;
  focus: string;
  questions: InterviewQuestion[];
}

export const INTERVIEW_TIERS: Record<string, TierConfig> = {
  beginner: {
    id: "beginner",
    name: "Beginner",
    badge: "Tier 1",
    description:
      "Core fundamentals, handling coach benching and adversity, and teammate accountability.",
    focus: "Character & Coachability",
    questions: [
      {
        id: 1,
        type: "Text",
        prompt:
          "Tell me about a time you had to bounce back after a tough loss or a bad performance. What did you do?",
      },
      {
        id: 2,
        type: "Multiple Choice",
        prompt:
          "Your coach benches you for a game without much explanation. What's your first move?",
        options: [
          "Ask the coach privately after practice what you can improve",
          "Post about it on social media to get support from friends",
          "Ignore it and hope it blows over",
          "Confront the coach angrily in front of the team",
        ],
      },
      {
        id: 3,
        type: "Text",
        prompt:
          "Why do you want to play at the next level, and what does success look like for you?",
      },
      {
        id: 4,
        type: "Multiple Choice",
        prompt:
          "A teammate keeps showing up late to practice. As a leader on the team, what do you do?",
        options: [
          "Talk to them one-on-one about it",
          "Report them straight to the coach",
          "Say nothing, it's not your business",
          "Call them out in front of the team",
        ],
      },
      {
        id: 5,
        type: "Text",
        prompt:
          "Describe a goal you set for yourself this season and how you're tracking toward it.",
      },
    ],
  },
  intermediate: {
    id: "intermediate",
    name: "Intermediate",
    badge: "Tier 2",
    description:
      "Handling tough coaching, in-game disagreement, leading older teammates, and school-sport-life balance.",
    focus: "Tactics & Team Leadership",
    questions: [
      {
        id: 1,
        type: "Text",
        prompt:
          "Tell me about the hardest coaching feedback you've ever received. How did you respond?",
      },
      {
        id: 2,
        type: "Multiple Choice",
        prompt:
          "You disagree with a play call your coach makes in a close game. What's the right approach in the moment?",
        options: [
          "Run the play as called and discuss it after the game",
          "Call your own play instead",
          "Argue with the coach on the sideline",
          "Complain to teammates during the play",
        ],
      },
      {
        id: 3,
        type: "Text",
        prompt:
          "Describe a time you had to lead teammates who were older or more experienced than you.",
      },
      {
        id: 4,
        type: "Multiple Choice",
        prompt:
          "Recruiters ask why they should pick you over another athlete with similar stats. What's the best way to answer?",
        options: [
          "Talk about your specific work ethic, character, and what you'd bring to their program",
          "Say you're just better than the other athlete",
          "List your stats again",
          "Say you're not sure, it's up to them",
        ],
      },
      {
        id: 5,
        type: "Text",
        prompt:
          "Tell me about a time you had to balance school, sport, and your personal life under pressure. How did you manage it?",
      },
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    badge: "Tier 3",
    description:
      "High-pressure recruiting scrums, separating delivery from message, recruiting trade-offs, and public failure.",
    focus: "Executive Poise & NIL Maturity",
    questions: [
      {
        id: 1,
        type: "Text",
        prompt:
          "Describe a moment when your team was down and you had to be the one to keep everyone believing. What did you actually say or do?",
      },
      {
        id: 2,
        type: "Multiple Choice",
        prompt:
          "You're being recruited by two programs — one with a bigger name, one where you'd start immediately. How do you approach that decision in an interview?",
        options: [
          "Talk through the real trade-offs and what fits your development best",
          "Say you'd obviously pick the bigger name",
          "Say fit doesn't matter, only exposure matters",
          "Avoid answering directly",
        ],
      },
      {
        id: 3,
        type: "Text",
        prompt:
          "Tell me about a time you failed publicly — in front of a crowd, your team, or coaches. How did you handle the aftermath?",
      },
      {
        id: 4,
        type: "Multiple Choice",
        prompt:
          "A recruiter asks how you handle being coached hard, even yelled at, in high-pressure moments. What's the strongest response?",
        options: [
          "Explain how you separate the message from the delivery and use it to improve",
          "Say you don't respond well to being yelled at",
          "Say you'd yell back",
          "Say it's never happened to you",
        ],
      },
      {
        id: 5,
        type: "Text",
        prompt:
          "If you had to describe your character to a coach who's never met you, in under 30 seconds, what would you say?",
      },
    ],
  },
};

export default function InterviewPage() {
  const [selectedTier, setSelectedTier] = React.useState<string>("beginner");
  const [isSessionActive, setIsSessionActive] = React.useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<number, string>>({});
  const [isEvaluating, setIsEvaluating] = React.useState(false);
  const [isCompleted, setIsCompleted] = React.useState(false);

  const activeTier = INTERVIEW_TIERS[selectedTier] || INTERVIEW_TIERS.beginner;
  const currentQuestion = activeTier.questions[currentQuestionIndex];

  const handleSelectOption = (option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: e.target.value,
    }));
  };

  const handleStartInterview = () => {
    setIsSessionActive(true);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsCompleted(false);
  };

  const handleNext = () => {
    if (currentQuestionIndex < activeTier.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Final question - evaluate
      setIsEvaluating(true);
      setTimeout(() => {
        setIsEvaluating(false);
        setIsCompleted(true);
      }, 1500);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setIsSessionActive(false);
    setIsCompleted(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-5xl pb-16">
        {/* Top Header Card (Matches Screenshot 1) */}
        <div className="rounded-2xl bg-gradient-to-b from-[#1E1E1E] to-[#121212] border border-white/10 p-8 md:p-10 shadow-xl">
          <span className="text-[11px] font-bold tracking-widest text-[#F21717] uppercase block mb-3">
            MOCK AI INTERVIEW
          </span>
          <h2 className="font-display uppercase text-3xl md:text-5xl font-black text-white leading-tight">
            Practice your athletic interview skills with AI feedback
          </h2>
        </div>

        {/* ===================== VIEW 1: TIER SELECTION ===================== */}
        {!isSessionActive && !isCompleted && (
          <div className="space-y-6">
            <div>
              <p className="text-sm text-[#A3A3A3]">
                Ready to test your interview skills? Start a mock AI interview session below. Select your difficulty level:
              </p>
            </div>

            {/* 3 Appealing Tier Option Cards (Beginner, Intermediate, Pro) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {Object.values(INTERVIEW_TIERS).map((tier) => {
                const isSelected = selectedTier === tier.id;
                return (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`relative rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between border ${
                      isSelected
                        ? "bg-[#171717] border-[#F21717] shadow-[0_0_25px_rgba(242,23,23,0.3)] ring-1 ring-[#F21717]"
                        : "bg-[#111111] border-white/10 hover:border-white/20 hover:bg-[#141414]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            isSelected
                              ? "bg-[#F21717] text-white"
                              : "bg-white/10 text-[#A3A3A3]"
                          }`}
                        >
                          {tier.badge}
                        </span>

                        {isSelected && (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#F21717] animate-ping" />
                        )}
                      </div>

                      <h3 className="font-display uppercase text-2xl font-black text-white tracking-wide mb-1.5">
                        {tier.name}
                      </h3>

                      <p className="text-xs text-[#F21717] font-semibold uppercase tracking-wider mb-2">
                        {tier.focus}
                      </p>

                      <p className="text-xs text-[#A3A3A3] leading-relaxed">
                        {tier.description}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-white/5 mt-5 flex items-center justify-between">
                      <span className="text-[11px] text-[#737373] font-mono">
                        5 Scenarios
                      </span>
                      <span
                        className={`text-xs font-bold uppercase tracking-wider ${
                          isSelected ? "text-[#F21717]" : "text-[#737373]"
                        }`}
                      >
                        {isSelected ? "Selected ✓" : "Select Tier"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dropdown Selection & Start Button Form (Matches client flow) */}
            <div className="pt-2 space-y-4 max-w-lg">
              <div className="space-y-3">
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="w-full h-11 rounded-lg bg-[#141414] border border-white/15 px-3.5 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#F21717] cursor-pointer"
                >
                  <option value="beginner" className="bg-[#171717]">
                    Tier 1 — Beginner (Fundamentals & Character)
                  </option>
                  <option value="intermediate" className="bg-[#171717]">
                    Tier 2 — Intermediate (Tactics & Leadership)
                  </option>
                  <option value="pro" className="bg-[#171717]">
                    Tier 3 — Pro (Media Scrum & Poise)
                  </option>
                </select>

                <Button
                  onClick={handleStartInterview}
                  variant="primary"
                  size="md"
                  className="bg-[#F21717] hover:bg-[#D90F0F] text-white px-7 font-bold text-sm h-11 shadow-[0_0_20px_rgba(242,23,23,0.4)]"
                >
                  Start Interview
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== VIEW 2: ACTIVE QUESTION SESSION ===================== */}
        {isSessionActive && !isCompleted && !isEvaluating && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Step Navigation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-[#F21717] text-white">
                  {activeTier.badge} • {activeTier.name}
                </span>
                <span className="text-sm font-semibold text-white">
                  Question {currentQuestionIndex + 1} of{" "}
                  {activeTier.questions.length}
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Progress Indicators */}
                <div className="flex items-center gap-1.5">
                  {activeTier.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentQuestionIndex
                          ? "w-8 bg-[#F21717]"
                          : answers[q.id]
                          ? "w-4 bg-white/60"
                          : "w-2 bg-white/20"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleReset}
                  className="text-xs text-[#737373] hover:text-white transition-colors"
                >
                  Exit Session
                </button>
              </div>
            </div>

            {/* Question Card */}
            <div className="rounded-2xl bg-[#111111] border border-white/10 p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#A3A3A3]">
                  {currentQuestion.type === "Multiple Choice"
                    ? "Multiple Choice Scenario"
                    : "Written Reflection"}
                </span>
              </div>

              <h3 className="font-display uppercase text-2xl md:text-3xl font-bold text-white leading-snug">
                {currentQuestion.prompt}
              </h3>

              {/* RENDER MULTIPLE CHOICE OPTIONS */}
              {currentQuestion.type === "Multiple Choice" &&
                currentQuestion.options && (
                  <div className="space-y-3 pt-2">
                    {currentQuestion.options.map((option, idx) => {
                      const isSelected =
                        answers[currentQuestion.id] === option;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleSelectOption(option)}
                          className={`flex items-center gap-4 p-4 md:p-5 rounded-xl border transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? "bg-[#1A1111] border-[#F21717] shadow-[0_0_15px_rgba(242,23,23,0.25)] ring-1 ring-[#F21717]"
                              : "bg-[#141414] border-white/10 hover:border-white/20 hover:bg-[#171717]"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected
                                ? "border-[#F21717] bg-[#F21717]"
                                : "border-white/30"
                            }`}
                          >
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          <span
                            className={`text-sm leading-relaxed ${
                              isSelected
                                ? "text-white font-medium"
                                : "text-[#D1D1D1]"
                            }`}
                          >
                            {option}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

              {/* RENDER TEXT / OPEN-ENDED PROMPT */}
              {currentQuestion.type === "Text" && (
                <div className="space-y-3 pt-2">
                  <textarea
                    rows={5}
                    value={answers[currentQuestion.id] || ""}
                    onChange={handleTextChange}
                    placeholder="Type your response here. Speak with composure, accountability, and maturity..."
                    className="w-full rounded-xl bg-[#141414] border border-white/15 p-4 text-sm text-white placeholder:text-[#666] focus:outline-none focus:border-[#F21717] focus:ring-1 focus:ring-[#F21717] transition-all resize-none"
                  />
                  <div className="flex items-center justify-between text-xs text-[#737373]">
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-[#F21717]" />
                      Tip: Frame your answer around how you handled the outcome and supported your team.
                    </span>
                    <span>
                      {(answers[currentQuestion.id] || "").length} characters
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="gap-2 text-xs"
              >
                <ArrowLeft className="w-4 h-4" /> Previous Question
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={handleNext}
                className="gap-2 bg-[#F21717] hover:bg-[#D90F0F] text-xs font-bold px-6 shadow-[0_0_20px_rgba(242,23,23,0.3)]"
              >
                {currentQuestionIndex === activeTier.questions.length - 1 ? (
                  <>
                    <Sparkles className="w-4 h-4" /> Complete & Analyze with AI
                  </>
                ) : (
                  <>
                    Next Question <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ===================== VIEW 3: AI EVALUATION LOADING ===================== */}
        {isEvaluating && (
          <div className="rounded-2xl bg-[#111111] border border-white/10 p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#F21717]/20 border border-[#F21717]/40 flex items-center justify-center text-[#F21717] mx-auto animate-pulse">
              <Sparkles className="w-8 h-8 fill-current" />
            </div>
            <h3 className="font-display uppercase text-2xl font-black text-white">
              AI Grading Your Interview...
            </h3>
            <p className="text-xs text-[#A3A3A3] max-w-sm mx-auto leading-relaxed">
              Evaluating your response composure, leadership tone, coachability, and decision-making maturity.
            </p>
          </div>
        )}

        {/* ===================== VIEW 4: AI FEEDBACK RESULTS ===================== */}
        {isCompleted && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Score Overview Card */}
            <div className="rounded-2xl bg-gradient-to-r from-[#1E1111] via-[#141414] to-[#0D0D0D] border border-[#F21717]/40 p-8 shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-[#F21717] uppercase block mb-1">
                    PERFORMANCE SCORE • {activeTier.name.toUpperCase()} TIER
                  </span>
                  <div className="flex items-baseline gap-3 my-2">
                    <span className="font-display font-black text-5xl md:text-6xl text-white">
                      94
                    </span>
                    <span className="text-sm font-semibold text-[#A3A3A3]">
                      / 100 Overall Score
                    </span>
                  </div>
                  <p className="text-xs text-[#2ECC71] flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Excellent collegiate interview readiness
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleStartInterview}
                    className="gap-2 bg-[#F21717] hover:bg-[#D90F0F] text-xs font-bold"
                  >
                    <RotateCcw className="w-4 h-4" /> Retake This Tier
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={handleReset}
                    className="text-xs"
                  >
                    Try Another Tier
                  </Button>
                </div>
              </div>
            </div>

            {/* AI Breakdown Grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="rounded-xl bg-[#111111] border border-white/10 p-6 space-y-3">
                <div className="flex items-center gap-2 text-[#2ECC71]">
                  <Flame className="w-4 h-4" />
                  <h4 className="font-display uppercase text-lg font-bold text-white">
                    Key Strengths Observed
                  </h4>
                </div>
                <ul className="space-y-2 text-xs text-[#A3A3A3]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2ECC71] flex-shrink-0 mt-0.5" />
                    <span>Prioritizes team-first accountability over personal ego when facing benching or mistakes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2ECC71] flex-shrink-0 mt-0.5" />
                    <span>Demonstrated high coachability: separating the emotional delivery from the underlying coaching adjustment.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2ECC71] flex-shrink-0 mt-0.5" />
                    <span>Direct, concise answers avoiding filler words or defensiveness.</span>
                  </li>
                </ul>
              </div>

              {/* Opportunities for Growth */}
              <div className="rounded-xl bg-[#111111] border border-white/10 p-6 space-y-3">
                <div className="flex items-center gap-2 text-[#F59E0B]">
                  <Award className="w-4 h-4" />
                  <h4 className="font-display uppercase text-lg font-bold text-white">
                    Next Level Adjustments
                  </h4>
                </div>
                <ul className="space-y-2 text-xs text-[#A3A3A3]">
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                    <span>In recruiting trade-off questions, be even more specific about how your skill set complements the offensive/defensive scheme.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                    <span>Reference specific combine metrics or measurable progress when discussing season goals.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
