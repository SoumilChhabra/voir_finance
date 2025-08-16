// EditTransaction.tsx
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { close, save } from "ionicons/icons";
import { useHistory, useParams } from "react-router";
import { useEffect, useState, useRef } from "react";
import { useStore } from "../data/store";
import Shell from "../components/Shell";

type EditTxProps = { id?: string; onClose?: () => void; asPage?: boolean };

export default function EditTransaction(props: EditTxProps) {
  const { id: routeId } = useParams<{ id: string }>();
  const id = props?.id ?? routeId;

  const history = useHistory();
  const { accounts, categories, transactions, updateTransaction } = useStore();
  const modalRef = useRef<HTMLDivElement>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const tx = transactions.find((t) => t.id === id);

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

  // Local state (seed from tx if present)
  const [amount, setAmount] = useState(
    tx ? (tx.amountCents / 100).toFixed(2) : ""
  );
  const [accountId, setAccountId] = useState(
    tx?.accountId ?? accounts[0]?.id ?? ""
  );
  const [categoryId, setCategoryId] = useState(
    tx?.categoryId ?? categories[0]?.id ?? ""
  );
  const [date, setDate] = useState(
    tx?.date ?? new Date().toISOString().slice(0, 10)
  );
  const [merchant, setMerchant] = useState(tx?.merchant ?? "");
  const [notes, setNotes] = useState(tx?.notes ?? "");

  // If tx appears later, sync the form once
  useEffect(() => {
    if (!tx) return;
    setAmount((tx.amountCents / 100).toFixed(2));
    setAccountId(tx.accountId);
    setCategoryId(tx.categoryId);
    setDate(tx.date);
    setMerchant(tx.merchant ?? "");
    setNotes(tx.notes ?? "");
  }, [tx]);

  const hasBasics = accounts.length > 0 && categories.length > 0;
  const canSave =
    hasBasics &&
    !!id &&
    amount.trim() !== "" &&
    !isNaN(Number(amount)) &&
    accountId &&
    categoryId;

  const handleClose = () => {
    if (props?.onClose) props.onClose();
    else history.goBack();
  };

  const onSave = async () => {
    if (!canSave) return;
    await updateTransaction({
      id: id as string,
      accountId,
      categoryId,
      amountDollars: amount,
      date,
      merchant,
      notes,
    });
    handleClose();
  };

  // Shared UI for both page and modal
  const Body = (
    <Shell
      title="Edit Transaction"
      className="dialog"
      actions={
        <IonButton fill="outline" onClick={handleClose}>
          <IonIcon icon={close} slot="start" /> Close
        </IonButton>
      }
      ref={modalRef}
    >
      {!hasBasics ? (
        <div style={{ padding: 16 }}>
          <p>You need at least one account and one category first.</p>
        </div>
      ) : !tx ? (
        <div style={{ padding: 16 }}>
          <p>Transaction not found in the current range.</p>
          <IonButton fill="outline" onClick={handleClose}>
            Back
          </IonButton>
        </div>
      ) : (
        <>
          <div className="form-content">
            <IonList inset>
              <IonItem>
                <IonLabel position="stacked">Amount (CAD)</IonLabel>
                <IonInput
                  type="number"
                  inputmode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onIonInput={(e) => setAmount(String(e.detail.value ?? ""))}
                />
              </IonItem>

              <IonItem>
                <IonLabel>Account</IonLabel>
                <IonSelect
                  interface="popover"
                  interfaceOptions={{ cssClass: "select-pop" }} // for styling
                  value={accountId}
                  onIonChange={(e) => setAccountId(e.detail.value)}
                >
                  {accounts.map((a) => (
                    <IonSelectOption key={a.id} value={a.id}>
                      {a.name}
                      {a.last4 ? ` •••• ${a.last4}` : ""}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              <IonItem>
                <IonLabel>Category</IonLabel>
                <IonSelect
                  interface="popover"
                  interfaceOptions={{ cssClass: "select-pop" }}
                  value={categoryId}
                  onIonChange={(e) => setCategoryId(e.detail.value)}
                >
                  {categories.map((c) => (
                    <IonSelectOption key={c.id} value={c.id}>
                      {c.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              {/* Date */}
              <IonItem>
                <IonLabel>Date</IonLabel>
                <div slot="end">
                  <IonDatetimeButton
                    datetime="edit-date"
                    className="dt-trigger"
                  />
                </div>
              </IonItem>

              <IonModal keepContentsMounted className="dt-pop">
                <IonDatetime
                  id="edit-date"
                  presentation="date"
                  value={date}
                  onIonChange={(e) =>
                    setDate(String(e.detail.value).slice(0, 10))
                  }
                />
              </IonModal>

              <IonItem>
                <IonLabel position="stacked">Merchant</IonLabel>
                <IonInput
                  value={merchant}
                  onIonInput={(e) => setMerchant(String(e.detail.value ?? ""))}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Notes</IonLabel>
                <IonInput
                  value={notes}
                  onIonInput={(e) => setNotes(String(e.detail.value ?? ""))}
                />
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

  // Page vs modal wrapper
  if (props.asPage) {
    return (
      <IonPage>
        <IonContent fullscreen scrollY={false}>
          {Body}
        </IonContent>
      </IonPage>
    );
  }
  return Body;
}
