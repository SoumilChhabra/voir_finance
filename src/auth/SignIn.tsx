import { useState } from "react";
import { supabase } from "../lib/supabase";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
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
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) setErr(error.message);
    else setSent(true);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Sign in</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonList inset>
          <IonItem>
            <IonLabel position="stacked">Email</IonLabel>
            <IonInput
              type="email"
              value={email}
              onIonInput={(e) => setEmail(String(e.detail.value ?? ""))}
            />
          </IonItem>
        </IonList>
        <div style={{ padding: 16 }}>
          <IonButton expand="block" onClick={send} disabled={!email}>
            Send magic link
          </IonButton>
          {sent && (
            <IonText color="success">
              <p>Check your email to finish sign in.</p>
            </IonText>
          )}
          {err && (
            <IonText color="danger">
              <p>{err}</p>
            </IonText>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
