"use client";

import { useState, useRef, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { Cond, sysPs } from "@/lib/prompts";

type Msg = { role: "user" | "assistant" | "system"; content: string };

const MAX_TOPICS = 2;
const MAX_TURNS_PER_TOPIC = 7;

type DomainId = "overspending" | "eating" | "sns" | "studying" | "exercise";

const domains: {
  id: DomainId;
  name: string;
  description: string;
  example: string;
}[] = [
  {
    id: "overspending",
    name: "Overspending",
    description: "Impulsive buying and difficulty resisting discounts or sales.",
    example: `"It's 50% off, so it feels like a loss if I don't buy it."`
  },
  {
    id: "eating",
    name: "Eating habits",
    description: "Late-night snacks or emotional eating after stress.",
    example: `"I need a late-night snack to relax and fall asleep after a stressful day."`
  },
  {
    id: "sns",
    name: "Social media use",
    description: "Endless scrolling at night or when you need to focus.",
    example: `"Just 10 more minutes of scrolling before I go to bed."`
  },
  {
    id: "studying",
    name: "Studying / work",
    description: "Productive procrastination before starting real work.",
    example: `"I should organize my desk before I actually start studying."`
  },
  {
    id: "exercise",
    name: "Exercise",
    description: "Repeating patterns of postponing or skipping exercise.",
    example: `"It seems better to rest today and start again tomorrow."`
  }
];

export default function Chat({ cond }: { cond: Cond }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isTyp, setIsTyp] = useState(false);
  const [turn, setTurn] = useState(0);
  const [selectedDomains, setSelectedDomains] = useState<DomainId[]>([]);
  const [currentDomain, setCurrentDomain] = useState<DomainId | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const topicIndex = selectedDomains.length; // 0, 1, or 2
  const isTopicComplete = currentDomain !== null && turn >= MAX_TURNS_PER_TOPIC;
  const isExperimentComplete = isTopicComplete && topicIndex >= MAX_TOPICS;

  const currentDomainInfo = currentDomain
    ? domains.find((d) => d.id === currentDomain) ?? null
    : null;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const startTopic = (domainId: DomainId) => {
    const nextIndex = selectedDomains.length + 1;
    if (nextIndex > MAX_TOPICS) return;

    const domain = domains.find((d) => d.id === domainId);
    const baseSys = sysPs[cond];
    const domainContext = `

[Current self-regulation topic]
- Topic index: ${nextIndex} out of ${MAX_TOPICS}
- Domain: ${domain?.name ?? ""}
- Brief description: ${domain?.description ?? ""}
- Example situation: ${domain?.example ?? ""}

In this conversation, focus only on this domain and the specific situation the user describes. Do not switch to other domains until this topic is finished.`;

    const sysMsg: Msg = {
      role: "system",
      content: `${baseSys}${domainContext}`
    };

    setMsgs([sysMsg]);
    setCurrentDomain(domainId);
    setSelectedDomains((prev) => [...prev, domainId]);
    setTurn(0);
  };

  const send = async () => {
    if (!input.trim() || isTyp || !currentDomain || turn >= MAX_TURNS_PER_TOPIC) {
      return;
    }

    const uMsg: Msg = { role: "user", content: input };
    const nMsgs = [...msgs, uMsg];
    setMsgs(nMsgs);
    setInput("");
    setIsTyp(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ msgs: nMsgs, cond })
      });

      const reader = res.body?.getReader();
      const dec = new TextDecoder();
      let aMsg = "";

      setMsgs([...nMsgs, { role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          aMsg += dec.decode(value);
          setMsgs([...nMsgs, { role: "assistant", content: aMsg }]);
        }
      }

      const finalMsgs = [...nMsgs, { role: "assistant", content: aMsg }];
      const nt = turn + 1;

      setTurn(nt);

      if (nt >= MAX_TURNS_PER_TOPIC) {
        try {
          const { db } = await import("@/lib/firebase");
          if (db) {
            await addDoc(collection(db, "chats"), {
              cond,
              domain: currentDomain,
              msgs: finalMsgs,
              turn: nt,
              topicIndex,
              time: new Date()
            });
          }
        } catch (e) {
          console.error("Firebase 저장 실패:", e);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setIsTyp(false);
  };

  return (
    <div className="flex flex-col h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900">
              AI Self-Regulation Coach
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Condition: {cond}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Topics completed: {topicIndex} / {MAX_TOPICS} · Turns in this topic:{" "}
              {turn} / {MAX_TURNS_PER_TOPIC}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-xs text-gray-500">
              <span>Two topics per session</span>
              <span>Seven turns per topic</span>
            </div>
            <div
              className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold ${
                isExperimentComplete
                  ? "bg-green-100 text-green-700"
                  : isTopicComplete
                  ? "bg-amber-100 text-amber-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {isExperimentComplete
                ? "Session complete"
                : isTopicComplete
                ? "Topic complete"
                : "In progress"}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8 flex flex-col md:flex-row gap-6 md:gap-8">
          <div className="w-full md:w-1/3 lg:w-1/4 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">
                Study flow
              </h2>
              <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                <li>Select your first self-regulation topic.</li>
                <li>Have a 7-turn conversation about that topic.</li>
                <li>Select a second topic and repeat.</li>
              </ol>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">
                Topic selection
              </h2>
              <p className="text-xs text-gray-600 mb-3">
                Please choose {MAX_TOPICS} different domains. Each conversation
                will focus on one concrete situation within the domain.
              </p>
              <div className="space-y-2">
                {domains.map((d) => {
                  const isChosen = selectedDomains.includes(d.id);
                  const disabled =
                    isExperimentComplete ||
                    (topicIndex === 0 && isChosen) ||
                    (topicIndex >= MAX_TOPICS && !currentDomain) ||
                    (topicIndex === 1 &&
                      isTopicComplete &&
                      isChosen &&
                      currentDomain !== d.id);

                  const canStartFirst =
                    topicIndex === 0 && !currentDomain && !isChosen;
                  const canStartSecond =
                    topicIndex === 1 && isTopicComplete && !isChosen;
                  const canClick = canStartFirst || canStartSecond;

                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        if (!canClick) return;
                        startTopic(d.id);
                      }}
                      disabled={!canClick}
                      className={`w-full text-left px-3 py-2 rounded-xl border text-xs md:text-sm transition-colors ${
                        isChosen
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : canClick
                          ? "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                          : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <div className="font-semibold">{d.name}</div>
                      <div className="text-[11px] md:text-xs mt-0.5">
                        {d.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {currentDomainInfo && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-1">
                  Current topic
                </h2>
                <p className="text-xs text-gray-500 mb-1">
                  Topic {topicIndex} of {MAX_TOPICS}
                </p>
                <p className="text-sm font-medium text-blue-700 mb-1">
                  {currentDomainInfo.name}
                </p>
                <p className="text-xs text-gray-600 mb-2">
                  {currentDomainInfo.description}
                </p>
                <p className="text-[11px] text-gray-500">
                  Example: {currentDomainInfo.example}
                </p>
              </div>
            )}
          </div>

          <div className="w-full md:flex-1 flex flex-col">
            {!currentDomain && (
              <div className="flex-1 flex items-center justify-center">
                <div className="bg-white rounded-3xl border border-dashed border-gray-300 px-6 py-8 md:px-10 md:py-12 text-center max-w-lg">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Choose your first topic
                  </h2>
                  <p className="text-sm text-gray-600">
                    Please select one domain on the left. After you finish a
                    7-turn conversation about that situation, you will be asked
                    to choose a second, different domain.
                  </p>
                </div>
              </div>
            )}

            {currentDomain && (
              <>
                <div className="flex-1 overflow-y-auto">
                  <div className="px-1 md:px-2 py-4 space-y-4">
                    {msgs.slice(1).map((m, i) => (
                      <div
                        key={i}
                        className={`flex ${
                          m.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex gap-3 max-w-[85%] ${
                            m.role === "user" ? "flex-row-reverse" : ""
                          }`}
                        >
                          <div
                            className={`shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-semibold ${
                              m.role === "user"
                                ? "bg-linear-to-br from-blue-500 to-blue-600"
                                : "bg-linear-to-br from-gray-600 to-gray-700"
                            }`}
                          >
                            {m.role === "user" ? "You" : "AI"}
                          </div>
                          <div
                            className={`rounded-2xl px-4 py-3 md:px-6 md:py-4 shadow-sm text-[13px] md:text-[15px] leading-relaxed whitespace-pre-wrap ${
                              m.role === "user"
                                ? "bg-linear-to-br from-blue-500 to-blue-600 text-white"
                                : "bg-white text-gray-900 border border-gray-200"
                            }`}
                          >
                            {m.content}
                          </div>
                        </div>
                      </div>
                    ))}

                    {isTyp && (
                      <div className="flex justify-start">
                        <div className="flex gap-3 max-w-[85%]">
                          <div className="shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full bg-linear-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white text-xs md:text-sm font-semibold">
                            AI
                          </div>
                          <div className="bg-white rounded-2xl px-4 py-3 md:px-6 md:py-4 border border-gray-200">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {isTopicComplete && !isExperimentComplete && (
                      <div className="text-center py-6">
                        <div className="inline-block px-6 py-4 bg-white rounded-2xl shadow-sm border border-blue-100">
                          <p className="text-sm font-semibold text-gray-900 mb-1">
                            Topic conversation finished
                          </p>
                          <p className="text-xs text-gray-600">
                            Please select a second, different domain on the left
                            to start the next 7-turn conversation.
                          </p>
                        </div>
                      </div>
                    )}

                    {isExperimentComplete && (
                      <div className="text-center py-8">
                        <div className="inline-block p-6 md:p-8 bg-white rounded-3xl shadow-lg border border-gray-200">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-linear-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                              className="w-6 h-6 md:w-8 md:h-8 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          <p className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                            All conversations are complete
                          </p>
                          <p className="text-sm text-gray-600">
                            Thank you for participating in this study.
                          </p>
                        </div>
                      </div>
                    )}

                    <div ref={endRef} />
                  </div>
                </div>

                <div className="bg-white border-t border-gray-200 shadow-lg">
                  <div className="px-4 md:px-6 py-3 md:py-4">
                    <div className="flex gap-3">
                      <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            send();
                          }
                        }}
                        placeholder={
                          isExperimentComplete
                            ? "All conversations are finished."
                            : isTopicComplete
                            ? "This topic is complete. Please select a new topic on the left."
                            : "Type your response here..."
                        }
                        className="flex-1 px-4 md:px-5 py-3 md:py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400 text-[13px] md:text-[15px] text-gray-900 placeholder:text-gray-500 transition-colors"
                        disabled={isTyp || isTopicComplete || isExperimentComplete}
                      />
                      <button
                        onClick={send}
                        disabled={
                          isTyp ||
                          isTopicComplete ||
                          isExperimentComplete ||
                          !input.trim()
                        }
                        className="px-4 md:px-6 lg:px-8 py-3 md:py-4 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-2xl text-sm md:text-base font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
