import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

let cachedProjectId: string | null = null;

export function useBaloriaProject() {
  const [projectId, setProjectId] = useState<string | null>(cachedProjectId);

  useEffect(() => {
    if (cachedProjectId) {
      setProjectId(cachedProjectId);
      return;
    }
    supabase
      .rpc("get_project_id", { _slug: "baloria" })
      .then(({ data }) => {
        if (data) {
          cachedProjectId = data;
          setProjectId(data);
        }
      });
  }, []);

  return projectId;
}
