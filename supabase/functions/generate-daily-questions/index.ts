import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const AI_AUTHOR_ID = "00000000-0000-0000-0000-000000000000"; // Placeholder for System/AI user

Deno.serve(async (req) => {
    // Check if it's a POST request
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiApiKey) {
        return new Response(JSON.stringify({ error: "Missing GEMINI_API_KEY" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // 1. Generate questions using Gemini
        const prompt = `
      Genereer 5 diepe, reflecterende vragen voor een platform genaamd Baloria.
      De vragen moeten gaan over persoonlijke groei, welzijn, connectie of creativiteit.
      Geef de output terug als een JSON array van objecten, elk met:
      - "question": de tekst van de vraag (Nederlands)
      - "theme": een categorie (bijv. "Groei", "Reflectie", "Connectie")
      - "theme_color": een hex-kleurcode die past bij het thema.
    `;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { response_mime_type: "application/json" }
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        const generatedText = result.candidates[0].content.parts[0].text;
        const questions = JSON.parse(generatedText);

        // 2. Insert questions into database
        const { data: insertedData, error: insertError } = await supabase
            .from("baloria_questions")
            .insert(
                questions.map((q: any) => ({
                    question: q.question,
                    theme: q.theme,
                    theme_color: q.theme_color,
                    author_id: AI_AUTHOR_ID,
                    project_id: "cwhcxazrmayjhaadtjqs",
                    is_ai_generated: true,
                    status: "open"
                }))
            );

        if (insertError) throw insertError;

        return new Response(JSON.stringify({ message: "Questions generated", count: questions.length }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});
