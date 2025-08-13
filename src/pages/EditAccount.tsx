// src/pages/EditAccount.tsx
import { useEffect, useState } from "react";
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
import { useHistory, useParams } from "react-router";
import Shell from "../components/Shell";
import { useStore } from "../data/store";

type Props = { id?: string; onClose?: () => void; asPage?: boolean };

export default function EditAccount({ id: propId, onClose, asPage }: Props) {
  const { id: routeId } = useParams<{ id: string }>();
  const id = propId ?? routeId;

  const history = useHistory();
  const { accountById, updateAccount } = useStore();

  const acct = id ? accountById[id] : undefined;

  const [name, setName] = useState(acct?.name ?? "");
  const [type, setType] = useState<"credit" | "debit" | "cash">(
    (acct?.type as any) ?? "credit"
  );
  const [last4, setLast4] = useState(acct?.last4 ?? "");
  const [currency, setCurrency] = useState(acct?.currency ?? "CAD");

  // if the account loads later, seed the form
  useEffect(() => {
    if (!acct) return;
    setName(acct.name ?? "");
    setType((acct.type as any) ?? "credit");
    setLast4(acct.last4 ?? "");
    setCurrency(acct.currency ?? "CAD");
  }, [acct]);

  const handleClose = () => (onClose ? onClose() : history.goBack());

  const canSave = !!id && name.trim().length > 0;

  const onSave = async () => {
    if (!canSave) return;
    await updateAccount({
      id: id as string,
      name,
      type,
      last4,
      currency,
    });
    handleClose();
  };

  const Body = (
    <Shell
      title="Edit Account"
      className="dialog"
      actions={
        <IonButton fill="outline" onClick={handleClose}>
          <IonIcon icon={close} slot="start" /> Close
        </IonButton>
      }
    >
      {!acct ? (
        <div style={{ padding: 16 }}>
          <p>Account not found.</p>
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
