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
import { useState, useEffect, useRef } from "react";
import { useLocation, useHistory } from "react-router";

export default function Accounts() {
  const { accounts, transactions, deleteAccount } = useStore();
  const totals = new Map<string, number>();
  for (const t of transactions)
    totals.set(t.accountId, (totals.get(t.accountId) ?? 0) + t.amountCents);

  const [showAddAcc, setShowAddAcc] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [presentAlert] = useIonAlert();
  const [toast] = useIonToast();

  // Refs for all sliding items to reset their position
  const slidingRefs = useRef<{ [key: string]: HTMLIonItemSlidingElement }>({});

  const location = useLocation();
  const history = useHistory();
  const openedFromParam = useRef(false);

  // Function to reset all sliding items to closed position
  const resetAllSlidingItems = () => {
    Object.values(slidingRefs.current).forEach((slidingRef) => {
      if (slidingRef) {
        slidingRef.close();
      }
    });
  };

  // Handle edit modal close and reset sliding items
  const handleEditClose = () => {
    setEditId(null);
    // Reset all sliding items to closed position
    setTimeout(() => {
      resetAllSlidingItems();
    }, 100);
  };

  // Auto-open Add modal if ?add=1 is present or if user has no accounts yet
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const shouldOpen = sp.get("add") === "1" || accounts.length === 0;

    if (!openedFromParam.current && shouldOpen) {
      openedFromParam.current = true;
      setShowAddAcc(true);

      // Clean the URL so refresh/back doesn't keep reopening
      if (sp.get("add") === "1") {
        history.replace("/tabs/accounts");
      }
    }
  }, [location.search, accounts.length, history]);

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
          className="compact-header"
          actions={
            <div className="panel-actions-dropdown">
              <DateRangeButton />
              <IonButton
                className="btn-add"
                onClick={() => setShowAddAcc(true)}
              >
                <IonIcon icon={add} slot="start" />
                Add
              </IonButton>
            </div>
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
                  <IonItemSliding
                    key={a.id}
                    ref={(el) => {
                      if (el) {
                        slidingRefs.current[a.id] = el;
                      }
                    }}
                  >
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
            onDidDismiss={handleEditClose}
            className="dialog-modal"
            backdropDismiss
          >
            {editId && <EditAccount id={editId} onClose={handleEditClose} />}
          </IonModal>
        </Shell>
      </IonContent>
    </IonPage>
  );
}
