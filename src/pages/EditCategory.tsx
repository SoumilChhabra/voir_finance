// src/pages/EditCategory.tsx
import { useEffect, useState, useRef } from "react";
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
  const modalRef = useRef<HTMLDivElement>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const cat = id ? categoryById[id] : undefined;

  const [name, setName] = useState(cat?.name ?? "");
  const [color, setColor] = useState(cat?.color ?? "#10b981");

  // Keyboard detection
  useEffect(() => {
    let initialHeight = window.innerHeight;
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialHeight - currentHeight;

      // If height decreased significantly, keyboard is likely open
      if (heightDifference > 150) {
        setIsKeyboardOpen(true);
        if (modalRef.current) {
          modalRef.current.classList.add("keyboard-open");
        }
      } else {
        setIsKeyboardOpen(false);
        if (modalRef.current) {
          modalRef.current.classList.remove("keyboard-open");
        }
      }
    };

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "ION-INPUT") {
        // Add a small delay to allow the keyboard to open
        timeoutId = setTimeout(() => {
          if (modalRef.current) {
            modalRef.current.classList.add("keyboard-open");
          }
        }, 300);
      }
    };

    const handleBlur = () => {
      // Remove keyboard-open class when focus is lost
      timeoutId = setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.classList.remove("keyboard-open");
        }
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("focusin", handleFocus);
    document.addEventListener("focusout", handleBlur);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("focusin", handleFocus);
      document.removeEventListener("focusout", handleBlur);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!cat) return;
    setName(cat.name ?? "");
    setColor(cat.color ?? "#10b981");
  }, [cat]);

  const handleClose = () => (onClose ? onClose() : history.goBack());

  const canSave = !!id && name.trim().length > 0;

  const onSave = async () => {
    if (!canSave) return;

    try {
      await updateCategory({
        id: id as string,
        name,
        color,
      });
      handleClose();
    } catch (error: any) {
      console.error("Failed to update category:", error);

      // Show user-friendly error message
      if (error.code === "PGRST301" || error.message?.includes("403")) {
        alert("You do not have permission to edit this category.");
      } else {
        alert("Failed to update category. Please try again.");
      }
    }
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
      ref={modalRef}
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
          <div className="form-content">
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
          </div>

          <div className="form-actions">
            <IonButton fill="outline" onClick={handleClose}>
              <IonIcon icon={close} slot="start" /> Cancel
            </IonButton>
            <IonButton strong onClick={onSave} disabled={!canSave}>
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
