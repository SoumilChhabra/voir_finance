// pages/AddAccount.tsx
import { useState, useEffect, useRef } from "react";
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { close, save } from "ionicons/icons";
import { useHistory } from "react-router";
import Shell from "../components/Shell";
import { useStore } from "../data/store";

type Props = { onClose?: () => void; asPage?: boolean };

export default function AddAccount({ onClose, asPage }: Props) {
  const { addAccount } = useStore();
  const history = useHistory();
  const modalRef = useRef<HTMLDivElement>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState<"credit" | "debit" | "cash">("credit");
  const [last4, setLast4] = useState("");
  const [currency, setCurrency] = useState("CAD");

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
      if (target.tagName === "ION-INPUT" || target.tagName === "ION-SELECT") {
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

  const canSave = name.trim().length > 0;

  const handleClose = () => (onClose ? onClose() : history.goBack());

  const onSave = async () => {
    if (!canSave) return;
    await addAccount({ name, type, last4, currency });
    handleClose();
  };

  const Body = (
    <Shell
      title="Add Account"
      className="dialog"
      actions={
        <IonButton fill="outline" onClick={handleClose}>
          <IonIcon icon={close} slot="start" /> Close
        </IonButton>
      }
      ref={modalRef}
    >
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
            <IonLabel>Type</IonLabel>
            <IonSelect
              interface="popover"
              interfaceOptions={{ cssClass: "select-pop" }}
              value={type}
              onIonChange={(e) => setType(e.detail.value)}
            >
              <IonSelectOption value="credit">Credit</IonSelectOption>
              <IonSelectOption value="debit">Debit</IonSelectOption>
              <IonSelectOption value="cash">Cash</IonSelectOption>
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Last 4 (optional)</IonLabel>
            <IonInput
              inputmode="numeric"
              maxlength={4}
              value={last4}
              onIonInput={(e) =>
                setLast4(String(e.detail.value ?? "").replace(/\D/g, ""))
              }
            />
          </IonItem>

          <IonItem>
            <IonLabel>Currency</IonLabel>
            <IonSelect
              interface="popover"
              interfaceOptions={{ cssClass: "select-pop" }}
              value={currency}
              onIonChange={(e) => setCurrency(e.detail.value)}
            >
              <IonSelectOption value="CAD">CAD</IonSelectOption>
              <IonSelectOption value="USD">USD</IonSelectOption>
              <IonSelectOption value="INR">INR</IonSelectOption>
            </IonSelect>
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
    </Shell>
  );

  // Support both routes (full page) and modal usage
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
