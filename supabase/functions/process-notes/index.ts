import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    if (!audioFile) throw new Error("No audio file provided");

    // For now, since ElevenLabs STT requires a connector, we'll use the AI to generate
    // a sample summary and quiz based on the filename as a placeholder
    // TODO: Integrate ElevenLabs STT connector for actual transcription

    const prompt = `Представь, что ты получил аудиозапись школьного урока (файл: "${audioFile.name}").

Создай:
1. **Структурированный конспект** урока с выделенными ключевыми терминами (выдели их **жирным**). Конспект должен быть полезным и информативным.
2. **Проверочный тест** из 5 вопросов с 4 вариантами ответа каждый.

Ответь строго в JSON формате:
{
  "summary": "текст конспекта в формате markdown",
  "quiz": [
    {
      "question": "текст вопроса",
      "options": ["вариант1", "вариант2", "вариант3", "вариант4"],
      "correct": 0
    }
  ]
}

Тема урока должна быть правдоподобной и образовательной. Отвечай на русском.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Ты создаёшь учебные конспекты и тесты. Всегда отвечай валидным JSON." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_notes",
            description: "Create structured notes and quiz from audio",
            parameters: {
              type: "object",
              properties: {
                summary: { type: "string", description: "Markdown formatted summary" },
                quiz: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      question: { type: "string" },
                      options: { type: "array", items: { type: "string" } },
                      correct: { type: "integer" }
                    },
                    required: ["question", "options", "correct"]
                  }
                }
              },
              required: ["summary", "quiz"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "create_notes" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Слишком много запросов." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Закончились кредиты ИИ." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI error");
    }

    const data = await response.json();
    
    // Extract from tool call
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let result;
    if (toolCall) {
      result = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback: try to parse from content
      const content = data.choices?.[0]?.message?.content || "{}";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: "Ошибка обработки", quiz: [] };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("process-notes error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
