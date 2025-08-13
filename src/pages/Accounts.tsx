// src/pages/Accounts.tsx
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonButton,
  IonIcon,
  IonModal,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  useIonAlert,
  useIonToast,
} from "@ionic/react";
import { add } from "ionicons/icons";
import DateRangeButton from "../components/DateRangeButton";
import Shell from "../components/Shell";
import { useStore } from "../data/store";
import { formatCurrency } from "../utils/money";
import AddAccount from "./AddAccount";
import EditAccount from "./EditAccount";
import { useState } from "react";

export default function Accounts() {
  const { accounts, transactions, deleteAccount } = useStore();
  const totals = new Map<string, number>();
  for (const t of transactions)
    totals.set(t.accountId, (totals.get(t.accountId) ?? 0) + t.amountCents);

  const [showAddAcc, setShowAddAcc] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [presentAlert] = useIonAlert();
  const [toast] = useIonToast();

  const confirmDelete = (id: string) =>
    presentAlert({
      header: "Delete account?",
      message: "This will also remove it from transactions.",
      buttons: [
        { text: "Cancel", role: "cancel" },
        {
          text: "Delete",
          role: "destructive",
          handler: async () => {
            try {
              await deleteAccount(id);
              toast({ message: "Account deleted", duration: 1200 });
            } catch (e: any) {
              toast({
                message: e.message ?? "Failed to delete",
                color: "danger",
                duration: 2000,
              });
            }
          },
        },
      ],
    });

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false}>
        <Shell
          title="Accounts"
          actions={
            <>
              <DateRangeButton />
              <IonButton onClick={() => setShowAddAcc(true)}>
                <IonIcon icon={add} slot="start" />
                Add
              </IonButton>
            </>
          }
        >
          {accounts.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", opacity: 0.8 }}>
              <p>No accounts yet.</p>
              <IonButton onClick={() => setShowAddAcc(true)}>
                Add Account
              </IonButton>
            </div>
          ) : (
            <IonList inset>
              {accounts.map((a) => {
                const total = totals.get(a.id) ?? 0;
                return (
                  <IonItemSliding key={a.id}>
                    <IonItem
                      routerLink={`/account/${a.id}`}
                      className="list-row row-lg"
                      detail
                    >
                      <IonLabel>
                        {a.name}
                        {a.last4 ? ` •••• ${a.last4}` : ""}
                      </IonLabel>
                      <IonNote slot="end" className="money">
                        {formatCurrency(total, a.currency)}
                      </IonNote>
                    </IonItem>

                    <IonItemOptions side="start">
                      <IonItemOption onClick={() => setEditId(a.id)}>
                        Edit
                      </IonItemOption>
                    </IonItemOptions>
                    <IonItemOptions side="end">
                      <IonItemOption
                        color="danger"
                        onClick={() => confirmDelete(a.id)}
                      >
                        Delete
                      </IonItemOption>
                    </IonItemOptions>
                  </IonItemSliding>
                );
              })}
            </IonList>
          )}

          {/* Add modal */}
          <IonModal
            isOpen={showAddAcc}
            onDidDismiss={() => setShowAddAcc(false)}
            className="dialog-modal"
            backdropDismiss
          >
            <AddAccount onClose={() => setShowAddAcc(false)} />
          </IonModal>

          {/* Edit modal */}
          <IonModal
            isOpen={!!editId}
            onDidDismiss={() => setEditId(null)}
            className="dialog-modal"
            backdropDismiss
          >
            {editId && (
              <EditAccount id={editId} onClose={() => setEditId(null)} />
            )}
          </IonModal>
        </Shell>
      </IonContent>
    </IonPage>
  );
}
