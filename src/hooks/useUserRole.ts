import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useUserRole(projectSlug: string = "baloria") {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      try {
        // Get project ID from slug
        const { data: projectId } = await supabase.rpc("get_project_id_by_slug", {
          slug_param: projectSlug,
        });

        if (!projectId) {
          setLoading(false);
          return;
        }

        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("project_id", projectId)
          .maybeSingle();

        setRole(data?.role ?? "user");
      } catch {
        setRole("user");
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user, projectSlug]);

  return { role, isAdmin: role === "admin", isModerator: role === "moderator", loading };
}
