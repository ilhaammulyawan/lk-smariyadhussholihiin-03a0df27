import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import type { User } from "@supabase/supabase-js";
import { getMyAdminAccess } from "@/lib/admin-auth.functions";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const checkAdminAccess = useServerFn(getMyAdminAccess);

  useEffect(() => {
    let active = true;

    const syncAuth = async (nextUser: User | null) => {
      if (!active) return;
      setUser(nextUser);
      setIsAdmin(false);

      if (!nextUser) {
        setLoading(false);
        return;
      }

      try {
        const result = await checkAdminAccess();
        if (active) setIsAdmin(result.isAdmin);
      } catch {
        if (active) setIsAdmin(false);
      } finally {
        if (active) setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoading(true);
      setTimeout(() => void syncAuth(session?.user ?? null), 0);
    });

    supabase.auth.getUser().then(({ data, error }) => {
      void syncAuth(error ? null : data.user);
    });

    return () => subscription.unsubscribe();
  }, [checkAdminAccess]);

  return { user, isAdmin, loading };
}
