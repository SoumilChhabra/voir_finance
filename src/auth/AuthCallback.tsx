// src/auth/AuthCallback.tsx
import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useHistory } from "react-router";

export default function AuthCallback() {
  const history = useHistory();

  useEffect(() => {
    (async () => {
      try {
        const anyAuth: any = supabase.auth;
        if (typeof anyAuth.getSessionFromUrl === "function") {
          await anyAuth.getSessionFromUrl({ storeSession: true });
        } else if (typeof anyAuth.exchangeCodeForSession === "function") {
          await anyAuth.exchangeCodeForSession(window.location.href);
        }
      } catch (e) {
        console.error("Web auth callback failed", e);
      } finally {
        history.replace("/tabs/all");
      }
    })();
  }, [history]);

  return null;
}
