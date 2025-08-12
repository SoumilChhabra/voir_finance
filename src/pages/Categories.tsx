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
} from "@ionic/react";
import { add } from "ionicons/icons";
import DateRangeButton from "../components/DateRangeButton";
import Shell from "../components/Shell";
import { useStore } from "../data/store";
import { formatCurrency } from "../utils/money";

export default function Categories() {
  const { categories, transactions } = useStore();
  const totals = new Map<string, number>();
  for (const t of transactions)
    totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amountCents);

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false}>
        <Shell
          title="Categories"
          actions={
            <>
              <DateRangeButton />
              <IonButton routerLink="/add-category">
                <IonIcon icon={add} slot="start" />
                Add
              </IonButton>
            </>
          }
        >
          {categories.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", opacity: 0.8 }}>
              <p>No categories yet.</p>
              <IonButton routerLink="/add-category">Add Category</IonButton>
            </div>
          ) : (
            <IonList inset>
              {categories.map((c) => (
                <IonItem
                  key={c.id}
                  routerLink={`/category/${c.id}`}
                  className="list-row row-lg"
                >
                  <IonLabel>{c.name}</IonLabel>
                  <IonChip
                    slot="end"
                    style={{ background: c.color, color: "#fff" }}
                  >
                    {c.name}
                  </IonChip>
                  <IonNote
                    slot="end"
                    className="money"
                    style={{ marginLeft: 8 }}
                  >
                    {formatCurrency(totals.get(c.id) ?? 0)}
                  </IonNote>
                </IonItem>
              ))}
            </IonList>
          )}
        </Shell>
      </IonContent>
    </IonPage>
  );
}
