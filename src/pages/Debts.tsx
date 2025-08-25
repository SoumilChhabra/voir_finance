import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonButton,
  IonIcon,
  IonChip,
  IonFab,
  IonFabButton,
  IonModal,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonDatetime,
  IonAlert,
  IonToast,
  IonDatetimeButton,
} from "@ionic/react";
import {
  add,
  checkmark,
  close,
  person,
  business,
  save,
  calendar,
} from "ionicons/icons";
import { useState, useRef } from "react";
import Shell from "../components/Shell";
import { useStore } from "../data/store";
import { formatCurrency } from "../utils/money";
import { formatDateLocal } from "../utils/date";
import { useIonAlert, useIonToast } from "@ionic/react";

export default function Debts() {
  const { debts, addDebt, updateDebt, deleteDebt, markDebtAsPaid } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDebt, setEditingDebt] = useState<any>(null);
  const [dueDate, setDueDate] = useState<string>("");
  const [presentAlert] = useIonAlert();
  const [toast] = useIonToast();

  const pendingDebts = debts.filter((d) => d.status === "pending");
  const paidDebts = debts.filter((d) => d.status === "paid");

  const handleSubmit = async (formData: any) => {
    try {
      if (editingDebt) {
        await updateDebt({ ...formData, dueDate, id: editingDebt.id });
        toast({ message: "Debt updated", duration: 1200 });
      } else {
        await addDebt({ ...formData, dueDate });
        toast({ message: "Debt added", duration: 1200 });
      }
      setShowAddModal(false);
      setEditingDebt(null);
      setDueDate("");
    } catch (e: any) {
      toast({ message: e.message, color: "danger", duration: 2000 });
    }
  };

  const confirmDelete = (id: string) => {
    presentAlert({
      header: "Delete debt?",
      message: "This cannot be undone.",
      buttons: [
        { text: "Cancel", role: "cancel" },
        {
          text: "Delete",
          role: "destructive",
          handler: () => deleteDebt(id),
        },
      ],
    });
  };

  const openAddModal = () => {
    setEditingDebt(null);
    setDueDate("");
    setShowAddModal(true);
  };

  const openEditModal = (debt: any) => {
    setEditingDebt(debt);
    setDueDate(debt.dueDate || "");
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingDebt(null);
    setDueDate("");
  };

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false}>
        <Shell title="Debts & IOUs">
          <div className="debt-list">
            <IonList inset>
              <IonItem lines="full" className="debt-header">
                <IonLabel>
                  <h2>Pending</h2>
                  <p>{pendingDebts.length} active debts</p>
                </IonLabel>
              </IonItem>

              {pendingDebts.map((debt) => (
                <IonItem key={debt.id} className="debt-row" lines="full">
                  <div slot="start" className="debt-info">
                    <div className="debt-title">
                      <h2>{debt.title}</h2>
                      <div className="debt-type-badge">
                        <IonChip
                          color={
                            debt.debtType === "owed_to_me"
                              ? "success"
                              : "warning"
                          }
                        >
                          {debt.debtType === "owed_to_me"
                            ? "Owed to me"
                            : "I owe"}
                        </IonChip>
                      </div>
                    </div>

                    <div className="debt-details">
                      <p className="debt-person">
                        <IonIcon icon={person} />
                        {debt.personName}
                        {debt.companyName && (
                          <span className="debt-company">
                            <IonIcon icon={business} />
                            {debt.companyName}
                          </span>
                        )}
                      </p>

                      {debt.dueDate && (
                        <p className="debt-due-date">
                          <IonIcon icon={calendar} />
                          Due: {formatDateLocal(debt.dueDate)}
                        </p>
                      )}

                      {debt.description && (
                        <p className="debt-description">{debt.description}</p>
                      )}
                    </div>
                  </div>

                  <div slot="end" className="debt-actions-compact">
                    <div className="debt-amount">
                      {formatCurrency(debt.amountCents, debt.currency)}
                    </div>

                    <div className="debt-buttons-compact">
                      <IonButton
                        fill="clear"
                        size="small"
                        color="success"
                        onClick={async () => {
                          try {
                            console.log("Marking debt as paid:", debt.id);
                            await markDebtAsPaid(debt.id);
                            console.log("Debt marked as paid successfully");
                          } catch (error: any) {
                            console.error("Error marking debt as paid:", error);
                            toast({
                              message: `Failed to mark debt as paid: ${error.message}`,
                              color: "danger",
                              duration: 3000,
                            });
                          }
                        }}
                        className="action-btn-compact"
                      >
                        <IonIcon icon={checkmark} slot="start" />
                        Mark Paid
                      </IonButton>

                      <IonButton
                        fill="clear"
                        size="small"
                        onClick={() => openEditModal(debt)}
                        className="action-btn-compact"
                      >
                        Edit
                      </IonButton>

                      <IonButton
                        fill="clear"
                        size="small"
                        color="danger"
                        onClick={() => confirmDelete(debt.id)}
                        className="action-btn-compact"
                      >
                        Delete
                      </IonButton>
                    </div>
                  </div>
                </IonItem>
              ))}
            </IonList>

            {paidDebts.length > 0 && (
              <IonList inset>
                <IonItem lines="full" className="debt-header">
                  <IonLabel>
                    <h2>Paid</h2>
                    <p>{paidDebts.length} completed debts</p>
                  </IonLabel>
                </IonItem>

                {paidDebts.map((debt) => (
                  <IonItem key={debt.id} className="debt-row paid" lines="full">
                    <div slot="start" className="debt-info">
                      <div className="debt-title">
                        <h2>{debt.title}</h2>
                        <div className="debt-type-badge">
                          <IonChip
                            color={
                              debt.debtType === "owed_to_me"
                                ? "success"
                                : "warning"
                            }
                          >
                            {debt.debtType === "owed_to_me"
                              ? "Owed to me"
                              : "I owe"}
                          </IonChip>
                        </div>
                      </div>

                      <div className="debt-details">
                        <p className="debt-person">
                          <IonIcon icon={person} />
                          {debt.personName}
                          {debt.companyName && (
                            <span className="debt-company">
                              <IonIcon icon={business} />
                              {debt.companyName}
                            </span>
                          )}
                        </p>

                        {debt.dueDate && (
                          <p className="debt-due-date">
                            <IonIcon icon={calendar} />
                            Due: {formatDateLocal(debt.dueDate)}
                          </p>
                        )}

                        {debt.description && (
                          <p className="debt-description">{debt.description}</p>
                        )}
                      </div>
                    </div>

                    <div slot="end" className="debt-actions-compact">
                      <div className="debt-amount">
                        {formatCurrency(debt.amountCents, debt.currency)}
                      </div>

                      <div className="debt-buttons-compact">
                        <IonButton
                          fill="clear"
                          size="small"
                          onClick={() => openEditModal(debt)}
                          className="action-btn-compact"
                        >
                          Edit
                        </IonButton>

                        <IonButton
                          fill="clear"
                          size="small"
                          color="danger"
                          onClick={() => confirmDelete(debt.id)}
                          className="action-btn-compact"
                        >
                          Delete
                        </IonButton>
                      </div>
                    </div>
                  </IonItem>
                ))}
              </IonList>
            )}

            <IonFab slot="fixed" vertical="bottom" horizontal="end">
              <IonFabButton onClick={openAddModal}>
                <IonIcon icon={add} />
              </IonFabButton>
            </IonFab>
          </div>
        </Shell>

        <IonModal
          isOpen={showAddModal}
          key={editingDebt?.id || "new"}
          onDidDismiss={closeModal}
          className="dialog-modal"
          backdropDismiss
        >
          <Shell
            title={editingDebt ? "Edit Debt" : "Add New Debt"}
            className="dialog"
            actions={
              <IonButton fill="outline" onClick={closeModal}>
                <IonIcon icon={close} slot="start" /> Close
              </IonButton>
            }
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSubmit({
                  title: formData.get("title"),
                  description: formData.get("description"),
                  amountDollars: formData.get("amount"),
                  debtType: formData.get("debtType"),
                  personName: formData.get("personName"),
                  companyName: formData.get("companyName"),
                  dueDate: formData.get("dueDate"),
                });
              }}
            >
              <div className="form-content">
                <IonList inset>
                  <IonItem>
                    <IonLabel position="stacked">Title</IonLabel>
                    <IonInput
                      name="title"
                      placeholder="e.g., Dinner with friends"
                      value={editingDebt?.title || ""}
                      required
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">Type</IonLabel>
                    <IonSelect
                      name="debtType"
                      interface="popover"
                      interfaceOptions={{ cssClass: "select-pop" }}
                      value={editingDebt?.debtType || "i_owe"}
                      required
                    >
                      <IonSelectOption value="i_owe">
                        I owe money
                      </IonSelectOption>
                      <IonSelectOption value="owed_to_me">
                        Someone owes me
                      </IonSelectOption>
                    </IonSelect>
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">Person Name</IonLabel>
                    <IonInput
                      name="personName"
                      placeholder="e.g., John Doe"
                      value={editingDebt?.personName || ""}
                      required
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">Company (optional)</IonLabel>
                    <IonInput
                      name="companyName"
                      placeholder="e.g., Company Inc."
                      value={editingDebt?.companyName || ""}
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">Amount ($)</IonLabel>
                    <IonInput
                      name="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={
                        editingDebt
                          ? (editingDebt.amountCents / 100).toFixed(2)
                          : ""
                      }
                      required
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">Due Date (optional)</IonLabel>
                    <div slot="end">
                      <IonDatetimeButton
                        datetime="debt-due-date"
                        className="dt-trigger"
                      />
                    </div>
                    <input type="hidden" name="dueDate" value={dueDate} />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">
                      Description (optional)
                    </IonLabel>
                    <IonTextarea
                      name="description"
                      placeholder="Additional notes..."
                      value={editingDebt?.description || ""}
                      rows={3}
                    />
                  </IonItem>
                </IonList>
              </div>

              <IonModal keepContentsMounted className="dt-pop">
                <IonDatetime
                  id="debt-due-date"
                  presentation="date"
                  value={dueDate}
                  onIonChange={(e) => {
                    setDueDate(String(e.detail.value).slice(0, 10));
                  }}
                />
              </IonModal>

              <div className="form-actions">
                <IonButton fill="outline" onClick={closeModal}>
                  <IonIcon icon={close} slot="start" /> Cancel
                </IonButton>
                <IonButton strong type="submit">
                  <IonIcon icon={save} slot="start" />{" "}
                  {editingDebt ? "Update Debt" : "Add Debt"}
                </IonButton>
              </div>
            </form>
          </Shell>
        </IonModal>
      </IonContent>
    </IonPage>
  );
}
