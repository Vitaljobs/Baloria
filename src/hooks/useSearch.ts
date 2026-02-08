import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBaloriaProject } from "./useBaloriaProject";

export interface SearchResult {
    id: string;
    question: string;
    theme: string;
    theme_color: string;
    created_at: string;
}

export function useSearch() {
    const projectId = useBaloriaProject();
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    const search = useCallback(async (query: string) => {
        if (!query.trim() || !projectId) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            // Use the RPC function if possible, or fallback to simple ilike for now if RPC not set up
            // For simplicity/robustness without strictly depending on the RPC being run immediately:
            // We will try an 'or' filter with ilike on question and theme

            const { data, error } = await supabase
                .from("baloria_questions")
                .select("id, question, theme, theme_color, created_at")
                .eq("project_id", projectId)
                .or(`question.ilike.%${query}%,theme.ilike.%${query}%`)
                .limit(10);

            if (error) throw error;
            setResults(data || []);
        } catch (err) {
            console.error("Search error:", err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    const clear = useCallback(() => {
        setResults([]);
    }, []);

    return { search, results, loading, clear };
}
