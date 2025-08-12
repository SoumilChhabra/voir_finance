// src/pages/CategoryDetail.tsx
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonChip,
} from "@ionic/react";
import { useParams } from "react-router";
import Shell from "../components/Shell";
import DateRangeButton from "../components/DateRangeButton";
import { useStore } from "../data/store";
import { formatCurrency } from "../utils/money";
import { formatDateLocal } from "../utils/date";

export default function CategoryDetail() {
  const { id } = useParams<{ id: string }>();
  const { transactions, accountById, categoryById } = useStore();

  const category = categoryById[id];
  const txns = transactions
    .filter((t) => t.categoryId === id)
    .sort((a, b) => (a.date > b.date ? -1 : 1));

  const total = txns.reduce((s, t) => s + t.amountCents, 0);
  // Choose a currency for the total: first txn’s currency or fallback
  const totalCurrency = txns[0]?.currency ?? "CAD";

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false}>
        <Shell
          title={category?.name ?? "Category"}
          actions={<DateRangeButton />}
        >
          <IonItem lines="full" className="total-row row-lg">
            <IonLabel>Total</IonLabel>
            <IonNote slot="end" className="money">
              {formatCurrency(total, totalCurrency)}
            </IonNote>
          </IonItem>

          <IonList inset>
            {txns.map((t) => {
              const account = accountById[t.accountId];
              return (
                <IonItem key={t.id} className="tx-row row-lg">
                  <IonLabel>
                    <h2>{t.merchant ?? "Transaction"}</h2>
                    <p>
                      {formatDateLocal(t.date)}
                      {account ? ` · ${account.name}` : ""}
                    </p>
                  </IonLabel>

                  {/* Category pill (shows current category color/name) */}
                  {category && (
                    <IonChip
                      slot="end"
                      style={{ background: category.color, color: "white" }}
                    >
                      {category.name}
                    </IonChip>
                  )}

                  <IonNote slot="end" style={{ marginLeft: 8 }}>
                    {formatCurrency(t.amountCents, t.currency)}
                  </IonNote>
                </IonItem>
              );
            })}
          </IonList>
        </Shell>
      </IonContent>
    </IonPage>
  );
}
