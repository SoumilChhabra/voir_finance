import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Session } from "@supabase/supabase-js";
import SignIn from "./SignIn";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // inside AuthGate (after you update session)
  // src/auth/AuthGate.tsx

  useEffect(() => {
    document.body.classList.toggle("no-hero", !session);
    return () => document.body.classList.remove("no-hero");
  }, [session]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) return null;
  if (!session) return <SignIn />;
  return <>{children}</>;
}
