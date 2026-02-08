import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: "contact_confirmation" | "answer_notification" | "welcome";
  to: string;
  data: Record<string, string>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to, data }: EmailRequest = await req.json();

    if (!to || !type) {
      throw new Error("Missing required fields: to, type");
    }

    let subject = "";
    let html = "";

    switch (type) {
      case "contact_confirmation":
        subject = "Bedankt voor je bericht — Baloria";
        html = `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #0F172A; color: #F1F5F9; border-radius: 16px;">
            <h1 style="color: #4D96FF; font-size: 24px;">Baloria</h1>
            <p>Hoi ${data.name || "daar"},</p>
            <p>Bedankt voor je bericht! We hebben je vraag ontvangen en nemen zo snel mogelijk contact met je op.</p>
            <p style="color: #94A3B8; font-size: 14px;">Onderwerp: ${data.subject || ""}</p>
            <hr style="border-color: #334155; margin: 20px 0;" />
            <p style="color: #64748B; font-size: 12px;">Dit is een automatisch bericht van Baloria. Niet beantwoorden.</p>
          </div>
        `;
        break;

      case "answer_notification":
        subject = "Iemand heeft je vraag beantwoord! — Baloria";
        html = `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #0F172A; color: #F1F5F9; border-radius: 16px;">
            <h1 style="color: #4D96FF; font-size: 24px;">🎾 Baloria</h1>
            <p>Goed nieuws! Iemand heeft jouw vraag beantwoord:</p>
            <div style="background: #1E293B; padding: 16px; border-radius: 12px; margin: 16px 0;">
              <p style="color: #FFD93D; font-size: 13px;">${data.theme || ""}</p>
              <p style="font-weight: bold;">"${data.question || ""}"</p>
            </div>
            <p>Log in om het antwoord te lezen en een hartje te geven!</p>
            <hr style="border-color: #334155; margin: 20px 0;" />
            <p style="color: #64748B; font-size: 12px;">Baloria — Ontdek. Verbind. Groei.</p>
          </div>
        `;
        break;

      case "welcome":
        subject = "Welkom bij Baloria! 🎾";
        html = `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #0F172A; color: #F1F5F9; border-radius: 16px;">
            <h1 style="color: #4D96FF; font-size: 24px;">Welkom bij Baloria!</h1>
            <p>Hoi ${data.name || "daar"},</p>
            <p>Je account is aangemaakt! Je kunt nu:</p>
            <ul>
              <li>🎾 Vragen stellen als kleurrijke ballen</li>
              <li>💬 Antwoorden geven en hartjes verdienen</li>
              <li>⭐ Karma opbouwen en levels ontgrendelen</li>
            </ul>
            <p>Je dagelijkse limiet: <strong>3 vragen</strong> en <strong>6 antwoorden</strong> per dag.</p>
            <hr style="border-color: #334155; margin: 20px 0;" />
            <p style="color: #64748B; font-size: 12px;">Baloria — Ontdek. Verbind. Groei.</p>
          </div>
        `;
        break;

      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    const emailResponse = await resend.emails.send({
      from: "Baloria <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    console.log("Email sent:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
