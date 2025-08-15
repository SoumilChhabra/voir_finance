// src/pages/Profile.tsx
import { useEffect, useState } from "react";
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonNote,
  IonIcon,
} from "@ionic/react";
import { logOutOutline, saveOutline } from "ionicons/icons";
import Shell from "../components/Shell";
import { supabase } from "../lib/supabase";

export default function Profile() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) return;
      setEmail(u.email ?? "");
      setFullName(String((u.user_metadata as any)?.full_name ?? ""));
    });
  }, []);

  const save = async () => {
    setSaving(true);
    setStatus(null);
    const updates: Parameters<typeof supabase.auth.updateUser>[0] = {};
    if (email) updates.email = email;
    updates.data = { full_name: fullName ?? "" };
    const { error } = await supabase.auth.updateUser(updates);
    setSaving(false);
    setStatus(error ? error.message : "Profile updated.");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/signin";
  };

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false}>
        <Shell title="Profile">
          <IonList inset>
            <IonItem>
              <IonLabel position="stacked">Email</IonLabel>
              <IonInput
                type="email"
                value={email}
                onIonInput={(e) => setEmail(String(e.detail.value ?? ""))}
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Full name</IonLabel>
              <IonInput
                value={fullName}
                onIonInput={(e) => setFullName(String(e.detail.value ?? ""))}
              />
            </IonItem>
          </IonList>

          {/* compact actions aligned right */}
          <div className="profile-actions">
            <IonButton fill="clear" color="medium" onClick={signOut}>
              <IonIcon icon={logOutOutline} slot="start" />
              Sign out
            </IonButton>

            <IonButton strong onClick={save} disabled={saving}>
              <IonIcon icon={saveOutline} slot="start" />
              {saving ? "Saving…" : "Save changes"}
            </IonButton>
          </div>

          {status && (
            <div className="profile-status">
              <IonText
                color={status.includes("updated") ? "success" : "danger"}
              >
                <p>{status}</p>
              </IonText>
            </div>
          )}

          <IonNote className="profile-note">
            Updating email may require re-verification by Supabase.
          </IonNote>
        </Shell>
      </IonContent>
    </IonPage>
  );
}
