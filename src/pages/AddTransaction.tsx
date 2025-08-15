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
  IonButton,
  IonIcon,
  IonModal,
  IonDatetimeButton,
} from "@ionic/react";
import { close, save } from "ionicons/icons";
import { useHistory } from "react-router";
import Shell from "../components/Shell";
import { useStore } from "../data/store";
import { useEffect, useState } from "react";
import { getPrefStr, setPrefStr } from "../utils/prefs";

type AddTxProps = { onClose?: () => void; asPage?: boolean };

export default function AddTransaction(props: AddTxProps) {
  const history = useHistory();
  const go = (path: string) => {
    if (props?.onClose) {
      // close the modal, then navigate
      props.onClose();
      setTimeout(() => history.push(path), 0);
    } else {
      history.push(path);
    }
  };

  const { accounts, categories, addTransaction } = useStore();

  const hasBasics =
    (accounts?.length ?? 0) > 0 && (categories?.length ?? 0) > 0;

  const today = new Date().toISOString().slice(0, 10);
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [date, setDate] = useState(today);
  const [merchant, setMerchant] = useState("");
  const [notes, setNotes] = useState("");

  // Restore last-used selections when available
  useEffect(() => {
    (async () => {
      const a = await getPrefStr("last_account_id");
      if (a && accounts.some((x) => x.id === a)) setAccountId(a);
      const c = await getPrefStr("last_category_id");
      if (c && categories.some((x) => x.id === c)) setCategoryId(c);
    })();
  }, [accounts, categories]);

  const canSave =
    hasBasics &&
    amount.trim() !== "" &&
    !isNaN(Number(amount)) &&
    !!accountId &&
    !!categoryId;

  const handleClose = () => {
    if (props?.onClose) props.onClose();
    else history.goBack();
  };

  const onSave = async () => {
    if (!canSave) return;
    await addTransaction({
      accountId,
      categoryId,
      amountDollars: amount,
      date,
      merchant,
      notes,
    });
    await setPrefStr("last_account_id", accountId);
    await setPrefStr("last_category_id", categoryId);
    handleClose();
  };

  // Shared UI for both page and modal
  const Body = (
    <Shell
      title="Add Transaction"
      className="dialog"
      actions={
        <IonButton fill="outline" onClick={handleClose}>
          <IonIcon icon={close} slot="start" /> Close
        </IonButton>
      }
    >
      {!hasBasics ? (
        // New-user guard: guide them to create the basics first
        <div className="tx-setup">
          <h3>Finish setup</h3>
          <p>
            Add at least one account and one category to create a transaction.
          </p>
          <div className="tx-setup-actions">
            <IonButton onClick={() => go("/tabs/accounts?add=1")}>
              Add account
            </IonButton>
            <IonButton
              fill="outline"
              onClick={() => go("/tabs/categories?add=1")}
            >
              Add category
            </IonButton>
          </div>
        </div>
      ) : (
        <>
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
                interfaceOptions={{ cssClass: "select-pop" }}
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
                <IonDatetimeButton datetime="add-date" className="dt-trigger" />
              </div>
            </IonItem>

            <IonModal keepContentsMounted className="dt-pop">
              <IonDatetime
                id="add-date"
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

  // Page vs modal
  if (props.asPage) {
    return (
      <IonPage>
        <IonContent fullscreen scrollY={false}>
          {Body}
        </IonContent>
      </IonPage>
    );
  }

  // Modal version: no IonPage/IonContent wrapper
  return Body;
}
