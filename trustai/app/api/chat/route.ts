import { NextRequest } from "next/server";
import { GoogleGenAI, type Content, type Part } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set.");
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function POST(req: NextRequest) {
  try {
    if (!ai) {
      return new Response("Gemini API key missing", { status: 500 });
    }

    const body = await req.json();
    const msgs = Array.isArray(body?.msgs) ? body.msgs : [];

    if (msgs.length === 0) {
      return new Response("No messages provided", { status: 400 });
    }

    // 시스템 프롬프트 추출
    const sysMsg = msgs.find((m: any) => m.role === "system");
    const sysInstruction: Content | undefined = sysMsg?.content
      ? { parts: [{ text: sysMsg.content as string }] }
      : undefined;

    // 대화 기록 변환
    const conversationHistory: Content[] = msgs
      .filter((m: any) => m.role !== "system" && m.content)
      .map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content as string } as Part],
      }));

    // 스트리밍 요청
    const resp = await ai.models.generateContentStream({
      model: "gemini-3-pro-preview",
      config: {
        systemInstruction: sysInstruction,
        temperature: 0.7,
      },
      contents: conversationHistory,
    });

    const enc = new TextEncoder();

    const stream = new ReadableStream({
      async start(ctrl) {
        try {
          for await (const chunk of resp) {
            // 수정: chunk.text는 getter 속성이므로 괄호 없이 접근
            const txt = chunk.text;
            
            if (txt) {
              ctrl.enqueue(enc.encode(txt));
            }
          }
        } catch (err) {
          console.error("Streaming error:", err);
          ctrl.error(err);
        } finally {
          ctrl.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });

  } catch (e) {
    console.error("General API Error:", e);
    return new Response(e instanceof Error ? e.message : "Internal Server Error", { status: 500 });
  }
}
