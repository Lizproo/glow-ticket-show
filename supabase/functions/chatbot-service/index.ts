// Microservice: chatbot-service
// Responds to chatbot queries using Lovable AI Gateway with event context.
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Eres "Glow Assistant", el asistente oficial de GlowTicket, una app móvil de venta de tickets para eventos en vivo.
Responde SIEMPRE en español, en tono amable, breve y entusiasta (máx 4 frases).
Usa emojis moderadamente (🎫 ✨ 🎶 🎭).
Puedes recomendar eventos, explicar cómo comprar, hablar de precios, ubicaciones y categorías (conciertos, teatro, ópera, deportes, festivales).
Si no sabes algo específico, sugiérele al usuario explorar las pestañas Inicio o Buscar.
Formato markdown ligero permitido (negritas, listas).`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, eventsContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY no configurada");

    const contextMsg = eventsContext
      ? {
          role: "system" as const,
          content: `Eventos actualmente disponibles (resumen):\n${eventsContext}`,
        }
      : null;

    const fullMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(contextMsg ? [contextMsg] : []),
      ...messages,
    ];

    const resp = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: fullMessages,
        }),
      },
    );

    if (resp.status === 429) {
      return new Response(
        JSON.stringify({ error: "Demasiadas peticiones, inténtalo en un momento." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (resp.status === 402) {
      return new Response(
        JSON.stringify({ error: "Sin créditos disponibles en Lovable AI." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI gateway error:", resp.status, t);
      return new Response(JSON.stringify({ error: "Error en el asistente" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const reply = data.choices?.[0]?.message?.content ?? "...";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chatbot-service error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
