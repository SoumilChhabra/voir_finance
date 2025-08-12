import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
} from "@ionic/react";
import { useParams } from "react-router";
import Shell from "../components/Shell";
import DateRangeButton from "../components/DateRangeButton";
import { useStore } from "../data/store";
import { formatCurrency } from "../utils/money";
import { sortNewest } from "../utils/tx";
import { formatDateLocal } from "../utils/date";

export default function AccountDetail() {
  const { id } = useParams<{ id: string }>();
  const { transactions, accountById } = useStore();
  const account = accountById[id];

  const txns = transactions.filter((t) => t.accountId === id).sort(sortNewest);
  const total = txns.reduce((s, t) => s + t.amountCents, 0);

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false}>
        <Shell title={account?.name ?? "Account"} actions={<DateRangeButton />}>
          <IonItem lines="full" className="total-row row-lg">
            <IonLabel>Total</IonLabel>
            <IonNote slot="end" className="money">
              {formatCurrency(total, account?.currency ?? "CAD")}
            </IonNote>
          </IonItem>

          <IonList inset>
            {txns.map((t) => (
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
              </IonItem>
            ))}
          </IonList>
        </Shell>
      </IonContent>
    </IonPage>
  );
}
