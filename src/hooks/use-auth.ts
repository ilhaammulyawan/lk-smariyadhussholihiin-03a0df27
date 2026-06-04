import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

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
        const { supabase } = await import("@/integrations/supabase/client");
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", nextUser.id)
          .eq("role", "admin")
          .maybeSingle();
        if (active) setIsAdmin(!error && data?.role === "admin");
      } catch {
        if (active) setIsAdmin(false);
      } finally {
        if (active) setLoading(false);
      }
    };

    let unsubscribe = () => {};

    import("@/integrations/supabase/client").then(({ supabase }) => {
      if (!active) return;

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setLoading(true);
        setTimeout(() => void syncAuth(session?.user ?? null), 0);
      });
      unsubscribe = () => subscription.unsubscribe();

      supabase.auth.getUser().then(({ data, error }) => {
        void syncAuth(error ? null : data.user);
      });
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return { user, isAdmin, loading };
}
