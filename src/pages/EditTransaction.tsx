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
import { useEffect, useState } from "react";
import { useStore } from "../data/store";
import Shell from "../components/Shell";

export default function EditTransaction() {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { accounts, categories, transactions, updateTransaction } = useStore();

  const tx = transactions.find((t) => t.id === id);

  useEffect(() => {
    // If needed, fetch-by-id here when tx is undefined after refresh.
  }, [tx]);

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

  const hasBasics = accounts.length > 0 && categories.length > 0;
  const canSave =
    hasBasics &&
    !!id &&
    amount.trim() !== "" &&
    !isNaN(Number(amount)) &&
    accountId &&
    categoryId;

  const onSave = async () => {
    if (!canSave) return;
    await updateTransaction({
      id,
      accountId,
      categoryId,
      amountDollars: amount,
      date,
      merchant,
      notes,
    });
    history.goBack();
  };

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false}>
        <Shell
          title="Edit Transaction"
          actions={
            <IonButton fill="outline" onClick={() => history.goBack()}>
              <IonIcon icon={close} slot="start" /> Close
            </IonButton>
          }
        >
          {!hasBasics ? (
            <div style={{ padding: 16 }}>
              <p>You need at least one account and one category first.</p>
            </div>
          ) : !tx ? (
            <div style={{ padding: 16 }}>
              <p>Transaction not found in the current range.</p>
              <IonButton fill="outline" onClick={() => history.goBack()}>
                Back
              </IonButton>
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

                {/* Date row — button is now readable on dark */}
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
                    onIonInput={(e) =>
                      setMerchant(String(e.detail.value ?? ""))
                    }
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
                <IonButton fill="outline" onClick={() => history.goBack()}>
                  <IonIcon icon={close} slot="start" /> Cancel
                </IonButton>
                <IonButton onClick={onSave} disabled={!canSave}>
                  <IonIcon icon={save} slot="start" /> Save
                </IonButton>
              </div>
            </>
          )}
        </Shell>
      </IonContent>
    </IonPage>
  );
}
