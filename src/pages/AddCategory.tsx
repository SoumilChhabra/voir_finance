import { useState } from "react";
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { close, save } from "ionicons/icons";
import { useHistory } from "react-router";
import Shell from "../components/Shell";
import { useStore } from "../data/store";

export default function AddCategory() {
  const { addCategory } = useStore();
  const history = useHistory();
  const [name, setName] = useState("");
  const [color, setColor] = useState("#10b981");
  const canSave = name.trim().length > 0;

  const onSave = async () => {
    if (!canSave) return;
    await addCategory({ name, color });
    history.goBack();
  };

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false}>
        <Shell
          title="Add Category"
          actions={
            <IonButton fill="outline" onClick={() => history.goBack()}>
              <IonIcon icon={close} slot="start" /> Close
            </IonButton>
          }
        >
          <IonList inset>
            <IonItem>
              <IonLabel position="stacked">Name</IonLabel>
              <IonInput
                value={name}
                onIonInput={(e) => setName(String(e.detail.value ?? ""))}
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Color</IonLabel>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  paddingTop: 8,
                }}
              >
                <input
                  type="color"
                  value={color}
                  onChange={(e) =>
                    setColor((e.target as HTMLInputElement).value)
                  }
                  style={{
                    width: 44,
                    height: 32,
                    border: "none",
                    background: "transparent",
                    padding: 0,
                  }}
                />
                <code style={{ opacity: 0.7 }}>{color}</code>
              </div>
            </IonItem>
          </IonList>

          <div style={{ padding: 16 }}>
            <IonButton expand="block" onClick={onSave} disabled={!canSave}>
              <IonIcon icon={save} slot="start" /> Save
            </IonButton>
          </div>
        </Shell>
      </IonContent>
    </IonPage>
  );
}
