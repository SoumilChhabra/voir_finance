// src/pages/Categories.tsx
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
  IonModal,
  useIonAlert,
  useIonToast,
} from "@ionic/react";
import { add } from "ionicons/icons";
import DateRangeButton from "../components/DateRangeButton";
import Shell from "../components/Shell";
import { useStore } from "../data/store";
import { formatCurrency } from "../utils/money";
import AddCategory from "./AddCategory";
import EditCategory from "./EditCategory";
import { useState, useEffect, useRef } from "react";
import { useLocation, useHistory } from "react-router";
import ItemActions from "../components/ItemActions";

export default function Categories() {
  const { categories, transactions, deleteCategory } = useStore();

  const totals = new Map<string, number>();
  for (const t of transactions)
    totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amountCents);

  const [showAddCat, setShowAddCat] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [presentAlert] = useIonAlert();
  const [toast] = useIonToast();

  const location = useLocation();
  const history = useHistory();
  const openedFromParam = useRef(false);

  // Auto-open Add modal if ?add=1 is present or if user has no categories yet
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const shouldOpen = sp.get("add") === "1" || categories.length === 0;

    if (!openedFromParam.current && shouldOpen) {
      openedFromParam.current = true;
      setShowAddCat(true);

      if (sp.get("add") === "1") {
        history.replace("/tabs/categories");
      }
    }
  }, [location.search, categories.length, history]);

  const confirmDelete = (id: string) =>
    presentAlert({
      header: "Delete category?",
      message: "Existing transactions will lose this category.",
      buttons: [
        { text: "Cancel", role: "cancel" },
        {
          text: "Delete",
          role: "destructive",
          handler: async () => {
            try {
              await deleteCategory(id);
              toast({ message: "Category deleted", duration: 1200 });
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
          title="Categories"
          className="compact-header"
          backButton={true}
          backTo="/tabs/manage"
          actions={
            <div className="panel-actions-dropdown">
              <DateRangeButton />
              <IonButton
                className="btn-add"
                onClick={() => setShowAddCat(true)}
              >
                <IonIcon icon={add} slot="start" />
                Add
              </IonButton>
            </div>
          }
        >
          {categories.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", opacity: 0.8 }}>
              <p>No categories yet.</p>
              <IonButton onClick={() => setShowAddCat(true)}>
                Add Category
              </IonButton>
            </div>
          ) : (
            <IonList inset>
              {categories.map((c) => (
                <IonItem
                  key={c.id}
                  className="list-row row-lg"
                  detail
                  routerLink={`/category/${c.id}`}
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
                  <ItemActions
                    onEdit={() => setEditId(c.id)}
                    onDelete={() => confirmDelete(c.id)}
                  />
                </IonItem>
              ))}
            </IonList>
          )}

          {/* Add modal */}
          <IonModal
            isOpen={showAddCat}
            onDidDismiss={() => setShowAddCat(false)}
            className="dialog-modal"
            backdropDismiss
          >
            <AddCategory onClose={() => setShowAddCat(false)} />
          </IonModal>

          {/* Edit modal */}
          <IonModal
            isOpen={!!editId}
            onDidDismiss={() => setEditId(null)}
            className="dialog-modal"
            backdropDismiss
          >
            {editId && (
              <EditCategory id={editId} onClose={() => setEditId(null)} />
            )}
          </IonModal>
        </Shell>
      </IonContent>
    </IonPage>
  );
}
