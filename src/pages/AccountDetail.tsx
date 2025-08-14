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

export default function AccountDetail() {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { transactions, accountById, categoryById } = useStore();
  const account = accountById[id];

  const txns = transactions.filter((t) => t.accountId === id).sort(sortNewest);

  // search query
  const [query, setQuery] = useState("");

  const filtered = txns.filter((t) =>
    txMatchesQuery(t, query, accountById, categoryById)
  );

  const total = filtered.reduce((s, t) => s + t.amountCents, 0);

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false}>
        <Shell
          title={account?.name ?? "Account"}
          actions={
            <>
              <IonButton fill="outline" onClick={() => history.goBack()}>
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
              </IonItem>
            ))}
          </IonList>
        </Shell>
      </IonContent>
    </IonPage>
  );
}
