import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { subject, topic } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Get user profile for interests
    const authHeader = req.headers.get("Authorization");
    let interests: string[] = [];
    
    if (authHeader) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("interests")
          .eq("id", user.id)
          .single();
        interests = profile?.interests || [];
      }
    }

    const interestContext = interests.length > 0
      ? `Интересы ученика: ${interests.join(", ")}. Обязательно адаптируй условие задачи под эти интересы! Например, если ученик любит Minecraft, используй персонажей и мир Minecraft в условии.`
      : "Сделай задачу интересной и увлекательной для школьника.";

    const prompt = `Сгенерируй одну интересную задачу по предмету "${subject}"${topic ? ` на тему "${topic}"` : ""}.

${interestContext}

Требования:
- Задача должна быть школьного уровня
- Условие должно быть увлекательным и связанным с интересами ученика
- В конце задачи НЕ давай ответ
- Оформи задачу красиво с эмодзи
- Отвечай на русском языке`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Ты — генератор увлекательных учебных задач для школьников. Генерируй задачи, адаптированные под интересы ученика." },
          { role: "user", content: prompt },
        ],
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
    const task = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ task }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-task error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
