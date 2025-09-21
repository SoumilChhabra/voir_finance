// src/pages/AccountDetail.tsx
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonButton,
  IonIcon,
  IonSearchbar,
  useIonAlert,
  useIonToast,
  IonModal,
} from "@ionic/react";
import { useParams, useHistory } from "react-router";
import { chevronBack } from "ionicons/icons";
import Shell from "../components/Shell";
import DateRangeButton from "../components/DateRangeButton";
import { useStore } from "../data/store";
import { formatCurrency } from "../utils/money";
import { sortNewest } from "../utils/tx";
import { formatDateLocal } from "../utils/date";
import { useState } from "react";
import { txMatchesQuery } from "../utils/search";
import ItemActions from "../components/ItemActions";
import EditTransaction from "./EditTransaction";

export default function AccountDetail() {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { transactions, accountById, categoryById, deleteTransaction } =
    useStore();
  const account = accountById[id];

  const txns = transactions.filter((t) => t.accountId === id).sort(sortNewest);

  // search query
  const [query, setQuery] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [presentAlert] = useIonAlert();
  const [toast] = useIonToast();

  const filtered = txns.filter((t) =>
    txMatchesQuery(t, query, accountById, categoryById)
  );

  const total = filtered.reduce((s, t) => s + t.amountCents, 0);

  const confirmDelete = (txId: string) =>
    presentAlert({
      header: "Delete transaction?",
      message: "This cannot be undone.",
      buttons: [
        { text: "Cancel", role: "cancel" },
        {
          text: "Delete",
          role: "destructive",
          handler: async () => {
            try {
              await deleteTransaction(txId);
              toast({ message: "Deleted", duration: 1200 });
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
          title={account?.name ?? "Account"}
          actions={
            <>
              <IonButton
                fill="outline"
                className="btn-back"
                onClick={() => history.goBack()}
              >
                <IonIcon icon={chevronBack} slot="start" />
                Back
              </IonButton>
              <IonSearchbar
                className="tx-search"
                debounce={200}
                placeholder="Search…"
                value={query}
                onIonInput={(e) => setQuery(e.detail.value ?? "")}
                showCancelButton="focus"
                showClearButton="never"
              />
              <DateRangeButton />
            </>
          }
        >
          <IonItem lines="full" className="total-row row-lg">
            <IonLabel>Total</IonLabel>
            <IonNote slot="end" className="money">
              {formatCurrency(total, account?.currency ?? "CAD")}
            </IonNote>
          </IonItem>

          <IonList inset>
            {filtered.map((t) => (
              <IonItem key={t.id} className="tx-row row-lg">
                <IonLabel>
                  <h2>{t.merchant ?? "Transaction"}</h2>
                  <p>
                    {formatDateLocal(t.date)} · {account?.name}
                  </p>
                </IonLabel>
                <IonNote slot="end" className="money">
                  {formatCurrency(t.amountCents, t.currency)}
                </IonNote>
                <ItemActions
                  onEdit={() => setEditId(t.id)}
                  onDelete={() => confirmDelete(t.id)}
                />
              </IonItem>
            ))}
          </IonList>

          <IonModal
            isOpen={!!editId}
            onDidDismiss={() => setEditId(null)}
            className="dialog-modal"
            backdropDismiss
          >
            {editId && (
              <EditTransaction id={editId} onClose={() => setEditId(null)} />
            )}
          </IonModal>
        </Shell>
      </IonContent>
    </IonPage>
  );
}
