// src/pages/CategoryDetail.tsx
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonChip,
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
import { formatDateLocal } from "../utils/date";
import { useState } from "react";
import { txMatchesQuery } from "../utils/search";

export default function CategoryDetail() {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { transactions, accountById, categoryById } = useStore();

  const category = categoryById[id];
  const txns = transactions
    .filter((t) => t.categoryId === id)
    .sort((a, b) => (a.date > b.date ? -1 : 1));

  // search query
  const [query, setQuery] = useState("");

  const filtered = txns.filter((t) =>
    txMatchesQuery(t, query, accountById, categoryById)
  );

  const total = filtered.reduce((s, t) => s + t.amountCents, 0);
  const totalCurrency = filtered[0]?.currency ?? "CAD";

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false}>
        <Shell
          title={category?.name ?? "Category"}
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
              {formatCurrency(total, totalCurrency)}
            </IonNote>
          </IonItem>

          <IonList inset>
            {filtered.map((t) => {
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
              );
            })}
          </IonList>
        </Shell>
      </IonContent>
    </IonPage>
  );
}
