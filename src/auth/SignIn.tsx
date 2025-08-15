// src/auth/SignIn.tsx
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Capacitor } from "@capacitor/core";
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
} from "@ionic/react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const send = async () => {
    setErr(null);
    const isNative = Capacitor.getPlatform() !== "web";
    const nativeRedirect = "com.soumilchhabra.voir://auth/callback";
    const webRedirect = window.location.origin + "/auth/callback";

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: isNative ? nativeRedirect : webRedirect },
    });

    if (error) setErr(error.message);
    else setSent(true);
  };

  return (
    <IonPage>
      {/* dark, centered canvas; no hero/wave */}
      <IonContent fullscreen className="signin-content">
        <div className="signin-panel">
          {/* App title styled like the home hero */}
          <h1 className="signin-brand">Voir</h1>
          <p className="signin-tag">Sign in</p>

          <IonList inset className="signin-list">
            <IonItem>
              <IonLabel position="stacked">Email</IonLabel>
              <IonInput
                type="email"
                value={email}
                onIonInput={(e) => setEmail(String(e.detail.value ?? ""))}
                autocomplete="email"
                inputmode="email"
              />
            </IonItem>
          </IonList>

          <IonButton expand="block" onClick={send} disabled={!email}>
            Send magic link
          </IonButton>

          {sent && (
            <IonText color="success">
              <p className="signin-msg">Check your email to finish sign in.</p>
            </IonText>
          )}
          {err && (
            <IonText color="danger">
              <p className="signin-msg">{err}</p>
            </IonText>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
