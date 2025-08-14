import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonChip,
  IonFab,
  IonFabButton,
  IonIcon,
  IonButton,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  useIonAlert,
  useIonToast,
  IonModal,
  IonSearchbar,
} from "@ionic/react";
import { add, downloadOutline } from "ionicons/icons";
import DateRangeButton from "../components/DateRangeButton";
import { useStore } from "../data/store";
import { formatCurrency } from "../utils/money";
import { formatDateLocal } from "../utils/date";
import { downloadCsv, toCsv } from "../utils/csv";
import Shell from "../components/Shell";
import { useState } from "react";
import AddTransaction from "./AddTransaction";
import EditTransaction from "./EditTransaction";
import { txMatchesQuery } from "../utils/search";

export default function All() {
  const {
    transactions,
    accountById,
    categoryById,
    dateRange,
    deleteTransaction,
  } = useStore();

  // search query
  const [query, setQuery] = useState("");

  // apply search filter
  const txns = transactions.filter((t) =>
    txMatchesQuery(t, query, accountById, categoryById)
  );

  const totalCents = txns.reduce((s, t) => s + t.amountCents, 0);
  const [presentAlert] = useIonAlert();
  const [toast] = useIonToast();

  // modal state
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const confirmDelete = (id: string) =>
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
              await deleteTransaction(id);
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

  const exportCurrentRange = () => {
    const rows = transactions
      .slice()
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .map((t) => ({
        Date: t.date,
        Merchant: t.merchant ?? "",
        Amount: (t.amountCents / 100).toFixed(2),
        Currency: t.currency,
        Account: accountById[t.accountId]?.name ?? "",
        Category: categoryById[t.categoryId]?.name ?? "",
        Notes: t.notes ?? "",
      }));

    const csv = toCsv(rows);
    const name = `transactions_${dateRange.start}_to_${dateRange.end}.csv`;
    downloadCsv(csv, name);
  };

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false}>
        <Shell
          title="All"
          actions={
            <>
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
              <IonButton fill="outline" onClick={exportCurrentRange}>
                <IonIcon slot="start" icon={downloadOutline} />
                Export
              </IonButton>
            </>
          }
        >
          <IonItem lines="full" className="total-row row-lg">
            <IonLabel>Total</IonLabel>
            <IonNote slot="end" className="money">
              {formatCurrency(totalCents)}
            </IonNote>
          </IonItem>

          {txns.length === 0 && (
            <div style={{ padding: 24, textAlign: "center", opacity: 0.8 }}>
              <p>No transactions match this search (or date range).</p>
              <IonButton size="default" onClick={() => setShowAdd(true)}>
                Add a transaction
              </IonButton>
            </div>
          )}

          <IonList inset>
            {txns.map((t) => {
              const account = accountById[t.accountId];
              const category = categoryById[t.categoryId];
              return (
                <IonItemSliding key={t.id}>
                  <IonItem detail={false} className="tx-row row-lg">
                    <IonLabel>
                      <h2>{t.merchant ?? "Transaction"}</h2>
                      <p>
                        {formatDateLocal(t.date)} · {account?.name}
                      </p>
                    </IonLabel>

                    {category && (
                      <IonChip
                        slot="end"
                        style={{ background: category.color, color: "white" }}
                      >
                        {category.name}
                      </IonChip>
                    )}

                    <IonNote
                      slot="end"
                      className="money"
                      style={{ marginLeft: 8 }}
                    >
                      {formatCurrency(t.amountCents, t.currency)}
                    </IonNote>
                  </IonItem>

                  <IonItemOptions side="start">
                    <IonItemOption onClick={() => setEditId(t.id)}>
                      Edit
                    </IonItemOption>
                  </IonItemOptions>
                  <IonItemOptions side="end">
                    <IonItemOption
                      color="danger"
                      onClick={() => confirmDelete(t.id)}
                    >
                      Delete
                    </IonItemOption>
                  </IonItemOptions>
                </IonItemSliding>
              );
            })}
          </IonList>

          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton onClick={() => setShowAdd(true)}>
              <IonIcon icon={add} />
            </IonFabButton>
          </IonFab>

          {/* Add modal */}
          <IonModal
            isOpen={showAdd}
            onDidDismiss={() => setShowAdd(false)}
            className="dialog-modal"
            backdropDismiss
          >
            <AddTransaction onClose={() => setShowAdd(false)} />
          </IonModal>

          {/* Edit modal */}
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
