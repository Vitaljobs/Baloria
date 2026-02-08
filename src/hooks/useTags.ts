import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Tag {
    id: string;
    name: string;
    usage_count: number;
}

export const useTags = () => {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTags = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from("baloria_tags")
                .select("*")
                .order("usage_count", { ascending: false })
                .limit(50);

            if (error) throw error;
            setTags(data || []);
        } catch (err) {
            console.error("Error fetching tags:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createTag = async (name: string) => {
        try {
            // Check if exists first
            const existing = tags.find(t => t.name.toLowerCase() === name.toLowerCase());
            if (existing) return existing;

            const { data, error } = await supabase
                .from("baloria_tags")
                .insert({ name })
                .select()
                .single();

            if (error) throw error;

            setTags(prev => [...prev, data]);
            return data;
        } catch (err) {
            console.error("Error creating tag:", err);
            toast.error("Kon tag niet aanmaken");
            return null;
        }
    };

    useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    return { tags, loading, createTag, refetch: fetchTags };
};
