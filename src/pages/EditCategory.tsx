// src/pages/EditCategory.tsx
import { useEffect, useState } from "react";
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
import { useHistory, useParams } from "react-router";
import Shell from "../components/Shell";
import { useStore } from "../data/store";

type Props = { id?: string; onClose?: () => void; asPage?: boolean };

export default function EditCategory({ id: propId, onClose, asPage }: Props) {
  const { id: routeId } = useParams<{ id: string }>();
  const id = propId ?? routeId;

  const history = useHistory();
  const { categoryById, updateCategory } = useStore();

  const cat = id ? categoryById[id] : undefined;

  const [name, setName] = useState(cat?.name ?? "");
  const [color, setColor] = useState(cat?.color ?? "#10b981");

  useEffect(() => {
    if (!cat) return;
    setName(cat.name ?? "");
    setColor(cat.color ?? "#10b981");
  }, [cat]);

  const handleClose = () => (onClose ? onClose() : history.goBack());

  const canSave = !!id && name.trim().length > 0;

  const onSave = async () => {
    if (!canSave) return;
    await updateCategory({
      id: id as string,
      name,
      color,
    });
    handleClose();
  };

  const Body = (
    <Shell
      title="Edit Category"
      className="dialog"
      actions={
        <IonButton fill="outline" onClick={handleClose}>
          <IonIcon icon={close} slot="start" /> Close
        </IonButton>
      }
    >
      {!cat ? (
        <div style={{ padding: 16 }}>
          <p>Category not found.</p>
          <IonButton fill="outline" onClick={handleClose}>
            Back
          </IonButton>
        </div>
      ) : (
        <>
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

          <div className="form-actions">
            <IonButton fill="outline" onClick={handleClose}>
              <IonIcon icon={close} slot="start" /> Cancel
            </IonButton>
            <IonButton onClick={onSave} disabled={!canSave}>
              <IonIcon icon={save} slot="start" /> Save
            </IonButton>
          </div>
        </>
      )}
    </Shell>
  );

  return asPage ? (
    <IonPage>
      <IonContent fullscreen scrollY={false}>
        {Body}
      </IonContent>
    </IonPage>
  ) : (
    Body
  );
}
