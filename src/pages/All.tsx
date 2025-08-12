import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
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
  IonButtons,
} from "@ionic/react";
import { add, downloadOutline } from "ionicons/icons";
import DateRangeButton from "../components/DateRangeButton";
import { useStore } from "../data/store";
import { formatCurrency } from "../utils/money";
import { formatDateLocal } from "../utils/date";
import {
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  useIonAlert,
  useIonToast,
} from "@ionic/react";
import { downloadCsv, toCsv } from "../utils/csv";
import Shell from "../components/Shell";

export default function All() {
  const {
    transactions,
    accountById,
    categoryById,
    dateRange,
    deleteTransaction,
  } = useStore();
  const txns = [...transactions];
  const totalCents = txns.reduce((s, t) => s + t.amountCents, 0);
  const [presentAlert] = useIonAlert();
  const [toast] = useIonToast();

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
      .slice() // copy if needed
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .map((t) => ({
        Date: t.date, // keep YYYY-MM-DD for sheets
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
              <p>No transactions in this date range.</p>
              <IonButton routerLink="/add" size="default">
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
                    <IonItemOption routerLink={`/edit/${t.id}`}>
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
            <IonFabButton routerLink="/add">
              <IonIcon icon={add} />
            </IonFabButton>
          </IonFab>
        </Shell>
      </IonContent>
    </IonPage>
  );
}
