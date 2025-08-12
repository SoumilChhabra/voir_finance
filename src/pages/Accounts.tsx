import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { add } from "ionicons/icons";
import DateRangeButton from "../components/DateRangeButton";
import Shell from "../components/Shell";
import { useStore } from "../data/store";
import { formatCurrency } from "../utils/money";

export default function Accounts() {
  const { accounts, transactions } = useStore();
  const totals = new Map<string, number>();
  for (const t of transactions)
    totals.set(t.accountId, (totals.get(t.accountId) ?? 0) + t.amountCents);

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false}>
        <Shell
          title="Accounts"
          actions={
            <>
              <DateRangeButton />
              <IonButton routerLink="/add-account">
                <IonIcon icon={add} slot="start" />
                Add
              </IonButton>
            </>
          }
        >
          {accounts.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", opacity: 0.8 }}>
              <p>No accounts yet.</p>
              <IonButton routerLink="/add-account">Add Account</IonButton>
            </div>
          ) : (
            <IonList inset>
              {accounts.map((a) => {
                const total = totals.get(a.id) ?? 0;
                return (
                  <IonItem
                    key={a.id}
                    routerLink={`/account/${a.id}`}
                    className="list-row row-lg"
                  >
                    <IonLabel>
                      {a.name}
                      {a.last4 ? ` •••• ${a.last4}` : ""}
                    </IonLabel>
                    <IonNote slot="end" className="money">
                      {formatCurrency(total, a.currency)}
                    </IonNote>
                  </IonItem>
                );
              })}
            </IonList>
          )}
        </Shell>
      </IonContent>
    </IonPage>
  );
}
