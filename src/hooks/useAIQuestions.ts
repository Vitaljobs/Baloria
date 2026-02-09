import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useBaloriaProject } from "./useBaloriaProject";
import { toast } from "sonner";

export const useAIQuestions = () => {
    const { user } = useAuth();
    const projectId = useBaloriaProject();

    const generateDailyQuestions = async () => {
        if (!user || !projectId) {
            console.log("Missing user or projectId:", { user: !!user, projectId });
            return;
        }

        try {
            console.log("Generating AI questions via direct fetch...");
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch("https://cwhcxazrmayjhaadtjqs.supabase.co/functions/v1/generate-daily-questions", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token || ''}`,
                    'apikey': (supabase as any).supabaseKey // Standard way to get the key from client
                },
                body: JSON.stringify({})
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Fetch error details:", errorData);
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("AI Questions success response:", data);
            toast.success("Nieuwe AI vragen zijn gegenereerd!");
            return data;
        } catch (err: any) {
            console.error("Error invoking AI question function:", err);
            const errMsg = err.message || "Netwerkfout bij aanroepen AI";
            toast.error(`Fout bij het genereren van AI vragen: ${errMsg}`);
        }
    };

    return { generateDailyQuestions };
};
