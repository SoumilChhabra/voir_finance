import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonInput,
  IonButton,
  IonIcon,
  IonChip,
  IonModal,
  IonDatetimeButton,
  IonDatetime,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import { add } from "ionicons/icons";
import Shell from "../components/Shell";
import DateRangeButton from "../components/DateRangeButton";
import { useStore } from "../data/store";
import { formatCurrency } from "../utils/money";
import { useMemo, useState } from "react";
import type { Category } from "../types";

export default function Budget() {
  const {
    accounts,
    categories,
    transactions,
    dateRange,
    period,
    allocations,
    incomes,

    addIncome,
    setPlanned,
  } = useStore() as any;

  const [incomeForm, setIncomeForm] = useState({
    source: "",
    date: dateRange.start,
    amount: "",
    accountId: "",
  });

  const [showIncomeModal, setShowIncomeModal] = useState(false);

  const catById = useMemo<Record<string, Category>>(
    () =>
      Object.fromEntries(
        (categories as Category[]).map((c: Category) => [c.id, c] as const)
      ),
    [categories]
  );

  // Use the spentByCategory from the store instead of recalculating here
  const { spentByCategory } = useStore() as any;

  const incomeTotal = incomes.reduce(
    (s: number, i: any) => s + i.amount_cents,
    0
  );
  const plannedTotal = allocations.reduce(
    (s: number, a: any) => s + a.planned_cents,
    0
  );
  const unassigned = incomeTotal - plannedTotal;

  // Show ALL categories, not just those with allocations
  const rows = categories
    .map((cat: Category) => {
      const allocation = allocations.find((a: any) => a.category_id === cat.id);
      const planned_cents = allocation?.planned_cents ?? 0;
      const carryover_cents = allocation?.carryover_cents ?? 0;
      const spent = spentByCategory.get(cat.id) ?? 0;
      const left = planned_cents + carryover_cents - spent;

      return {
        id: allocation?.id || `new-${cat.id}`,
        category_id: cat.id,
        planned_cents,
        carryover_cents,
        spent,
        left,
        isNew: !allocation,
      };
    })
    .sort((x: any, y: any) =>
      (catById[x.category_id]?.name || "").localeCompare(
        catById[y.category_id]?.name || ""
      )
    );

  const onSaveIncome = async () => {
    await addIncome({
      source: incomeForm.source,
      date: incomeForm.date,
      amountDollars: incomeForm.amount,
      accountId: incomeForm.accountId || undefined,
    });
    setIncomeForm({
      source: "",
      date: dateRange.start,
      amount: "",
      accountId: "",
    });
    setShowIncomeModal(false);
  };

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false}>
        <Shell
          title="Budget"
          className="compact-header"
          actions={
            <>
              <DateRangeButton />
              <IonButton onClick={() => setShowIncomeModal(true)}>
                <IonIcon icon={add} slot="start" />
                Add Income
              </IonButton>
            </>
          }
        >
          {/* Top summary cards */}
          <div className="budget-cards">
            <div className="card">
              <div>Income</div>
              <strong>{formatCurrency(incomeTotal)}</strong>
            </div>
            <div className="card">
              <div>Planned</div>
              <strong>{formatCurrency(plannedTotal)}</strong>
            </div>
            <div className={`card ${unassigned < 0 ? "warn" : ""}`}>
              <div>Unassigned</div>
              <strong>{formatCurrency(unassigned)}</strong>
            </div>
          </div>

          {/* Instructions */}
          {/* <div
            style={{
              padding: "16px",
              margin: "16px 0",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <h4 style={{ margin: "0 0 8px 0", color: "#ffffff" }}>
              How to Budget:
            </h4>
            <ol
              style={{
                margin: 0,
                paddingLeft: "20px",
                color: "rgba(255, 255, 255, 0.8)",
              }}
            >
              <li>Add income using the form above</li>
              <li>Allocate money to categories by setting planned amounts</li>
              <li>Track your spending progress with the bars below</li>
              <li>
                Categories with no budget show "No Budget" - click to allocate
              </li>
            </ol>
          </div> */}

          {/* Unassigned amount alert */}
          {unassigned > 0 && (
            <div
              style={{
                padding: "16px",
                margin: "16px 0",
                backgroundColor: "rgba(13, 110, 253, 0.1)",
                borderRadius: "8px",
                border: "1px solid rgba(13, 110, 253, 0.2)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong style={{ color: "#ffffff" }}>
                  You have {formatCurrency(unassigned)} unassigned
                </strong>
                <div
                  style={{
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: "14px",
                    marginTop: "4px",
                  }}
                >
                  Allocate this money to categories below to complete your
                  budget
                </div>
              </div>
              <IonButton
                size="small"
                color="primary"
                onClick={() => {
                  // Quick distribute evenly among categories with no budget
                  const unbudgetedCategories = rows.filter(
                    (r: any) => r.isNew || r.planned_cents === 0
                  );
                  if (unbudgetedCategories.length > 0) {
                    const amountPerCategory = Math.floor(
                      unassigned / unbudgetedCategories.length
                    );
                    unbudgetedCategories.forEach((r: any) => {
                      if (amountPerCategory > 0) {
                        setPlanned(
                          r.category_id,
                          (amountPerCategory / 100).toFixed(2)
                        );
                      }
                    });
                  }
                }}
              >
                Distribute Evenly
              </IonButton>
            </div>
          )}

          {/* Over budget warning */}
          {unassigned < 0 && (
            <div
              style={{
                padding: "16px",
                margin: "16px 0",
                backgroundColor: "rgba(220, 53, 69, 0.1)",
                borderRadius: "8px",
                border: "1px solid rgba(220, 53, 69, 0.2)",
                color: "#ffffff",
              }}
            >
              <strong>
                ⚠️ You're over budget by {formatCurrency(-unassigned)}
              </strong>
              <div
                style={{
                  fontSize: "14px",
                  marginTop: "4px",
                  color: "rgba(255, 255, 255, 0.8)",
                }}
              >
                Reduce planned amounts in categories below or add more income
              </div>
            </div>
          )}

          {/* Category table */}
          <div style={{ margin: "16px 0" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 80px 96px",
                gap: "16px",
                padding: "8px 16px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: "8px 8px 0 0",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderBottom: "none",
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.8)",
                fontWeight: "500",
              }}
            >
              <span>Category & Progress</span>
              <span style={{ textAlign: "center" }}>Planned</span>
              <span style={{ textAlign: "center" }}>Remaining</span>
            </div>
          </div>
          <IonList inset style={{ marginTop: 0 }}>
            {rows.map((r: any) => {
              const cat = catById[r.category_id];
              const plannedPlusCarry = r.planned_cents + r.carryover_cents;
              const pct =
                plannedPlusCarry <= 0
                  ? 0
                  : Math.min(
                      100,
                      Math.round((r.spent / plannedPlusCarry) * 100)
                    );
              return (
                <IonItem key={r.id} className="list-row row-lg">
                  <IonLabel>
                    <div className="budget-row">
                      <div className="head">
                        <span className="name">{cat?.name ?? "Category"}</span>
                        {r.isNew ? (
                          <IonChip color="warning">No Budget</IonChip>
                        ) : (
                          <IonChip
                            color={
                              pct > 90
                                ? "danger"
                                : pct > 75
                                ? "warning"
                                : "success"
                            }
                          >
                            {pct}%
                          </IonChip>
                        )}
                      </div>
                      {!r.isNew && (
                        <>
                          <div
                            className="bar"
                            style={{ margin: "12px 0 8px 0" }}
                          >
                            <div
                              className="fill"
                              style={{
                                width: `${pct}%`,
                                height: "8px",
                                borderRadius: "4px",
                                backgroundColor:
                                  pct > 90
                                    ? "#ff6b6b"
                                    : pct > 75
                                    ? "#ffd93d"
                                    : "#51cf66",
                                transition: "width 0.3s ease",
                              }}
                            ></div>
                          </div>
                          <div
                            className="nums"
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(3, 1fr)",
                              gap: "12px",
                              marginTop: "8px",
                            }}
                          >
                            <div style={{ textAlign: "center" }}>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "rgba(255, 255, 255, 0.6)",
                                  marginBottom: "2px",
                                }}
                              >
                                Spent
                              </div>
                              <div style={{ fontWeight: "500" }}>
                                {formatCurrency(r.spent)}
                              </div>
                            </div>
                            <div style={{ textAlign: "center" }}>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "rgba(255, 255, 255, 0.6)",
                                  marginBottom: "2px",
                                }}
                              >
                                Planned
                              </div>
                              <div style={{ fontWeight: "500" }}>
                                {formatCurrency(plannedPlusCarry)}
                              </div>
                            </div>
                            <div style={{ textAlign: "center" }}>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "rgba(255, 255, 255, 0.6)",
                                  marginBottom: "2px",
                                }}
                              >
                                Left
                              </div>
                              <div
                                style={{
                                  fontWeight: "500",
                                  color: r.left < 0 ? "#ff6b6b" : "#ffffff",
                                }}
                              >
                                {formatCurrency(r.left)}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      {r.isNew && (
                        <div
                          className="nums"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: "12px",
                            marginTop: "8px",
                          }}
                        >
                          <div style={{ textAlign: "center" }}>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "rgba(255, 255, 255, 0.6)",
                                marginBottom: "2px",
                              }}
                            >
                              Spent
                            </div>
                            <div style={{ fontWeight: "500" }}>
                              {formatCurrency(0)}
                            </div>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "rgba(255, 255, 255, 0.6)",
                                marginBottom: "2px",
                              }}
                            >
                              Planned
                            </div>
                            <div
                              style={{
                                fontWeight: "500",
                                color: "rgba(255, 255, 255, 0.4)",
                              }}
                            >
                              Not Set
                            </div>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "rgba(255, 255, 255, 0.6)",
                                marginBottom: "2px",
                              }}
                            >
                              Left
                            </div>
                            <div
                              style={{
                                fontWeight: "500",
                                color: "rgba(255, 255, 255, 0.4)",
                              }}
                            >
                              N/A
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </IonLabel>

                  {/* Remaining amount */}
                  <IonNote
                    slot="end"
                    className="money"
                    style={{ minWidth: "80px", textAlign: "center" }}
                  >
                    {formatCurrency(r.left)}
                  </IonNote>

                  {/* Planned amount input */}
                  <IonInput
                    type="number"
                    inputmode="decimal"
                    placeholder="0"
                    value={(r.planned_cents / 100).toFixed(2)}
                    onIonChange={(e) =>
                      setPlanned(r.category_id, String(e.detail.value ?? "0"))
                    }
                    style={{ width: 96, textAlign: "right" }}
                  />
                </IonItem>
              );
            })}
          </IonList>

          {/* Overall Budget Summary Cards */}
          <div style={{ margin: "24px 0" }}>
            <h4 style={{ margin: "0 0 16px 0", color: "#ffffff" }}>
              Overall Budget Summary
            </h4>
            <div className="budget-cards">
              <div className="card">
                <div>Total Spent</div>
                <strong>
                  {formatCurrency(
                    rows.reduce((sum: number, r: any) => sum + r.spent, 0)
                  )}
                </strong>
              </div>
              <div className="card">
                <div>Total Planned</div>
                <strong>{formatCurrency(plannedTotal)}</strong>
              </div>
              <div className="card">
                <div>Total Remaining</div>
                <strong>
                  {formatCurrency(
                    rows.reduce((sum: number, r: any) => sum + r.left, 0)
                  )}
                </strong>
              </div>
              <div className="card">
                <div>Budget Utilization</div>
                <strong>
                  {plannedTotal > 0
                    ? Math.round(
                        (rows.reduce(
                          (sum: number, r: any) => sum + r.spent,
                          0
                        ) /
                          plannedTotal) *
                          100
                      )
                    : 0}
                  %
                </strong>
              </div>
            </div>
          </div>
        </Shell>

        {/* Income Modal */}
        <IonModal
          isOpen={showIncomeModal}
          onDidDismiss={() => setShowIncomeModal(false)}
          breakpoints={[0, 1]}
          initialBreakpoint={1}
          style={{
            "--background": "transparent",
            "--backdrop-opacity": "0.8",
          }}
        >
          <IonContent
            className="ion-padding"
            style={{
              "--background": "transparent",
            }}
          >
            <div
              style={{
                padding: "24px 20px",
                maxWidth: "480px",
                margin: "0 auto",
                background: "rgba(0, 0, 0, 0.85)",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    color: "#ffffff",
                    fontSize: "24px",
                    fontWeight: "500",
                  }}
                >
                  Add Income
                </h2>
                <IonButton
                  fill="clear"
                  onClick={() => setShowIncomeModal(false)}
                  style={{
                    color: "rgba(255, 255, 255, 0.6)",
                    fontSize: "20px",
                    minWidth: "40px",
                    height: "40px",
                  }}
                >
                  ✕
                </IonButton>
              </div>

              <IonList
                inset={false}
                style={{
                  background: "transparent",
                  margin: "0 0 20px 0",
                }}
              >
                <IonItem
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    borderRadius: "8px",
                    marginBottom: "16px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <IonLabel
                    position="stacked"
                    style={{ color: "rgba(255, 255, 255, 0.9)" }}
                  >
                    Income Source
                  </IonLabel>
                  <IonInput
                    placeholder="e.g., Salary, Freelance"
                    value={incomeForm.source}
                    onIonInput={(e) =>
                      setIncomeForm({
                        ...incomeForm,
                        source: String(e.detail.value ?? ""),
                      })
                    }
                    style={{
                      color: "#ffffff",
                      "--placeholder-color": "rgba(255, 255, 255, 0.4)",
                    }}
                  />
                </IonItem>

                <IonItem
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    borderRadius: "8px",
                    marginBottom: "16px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <IonLabel
                    position="stacked"
                    style={{ color: "rgba(255, 255, 255, 0.9)" }}
                  >
                    Date Received
                  </IonLabel>
                  <div slot="end">
                    <IonDatetimeButton
                      datetime="income-date"
                      className="dt-trigger"
                    />
                  </div>
                </IonItem>

                <IonModal keepContentsMounted className="dt-pop">
                  <IonDatetime
                    id="income-date"
                    presentation="date"
                    value={incomeForm.date}
                    onIonChange={(e) =>
                      setIncomeForm({
                        ...incomeForm,
                        date: String(e.detail.value).slice(0, 10),
                      })
                    }
                  />
                </IonModal>

                <IonItem
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    borderRadius: "8px",
                    marginBottom: "16px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <IonLabel
                    position="stacked"
                    style={{ color: "rgba(255, 255, 255, 0.9)" }}
                  >
                    Amount
                  </IonLabel>
                  <IonInput
                    type="number"
                    inputmode="decimal"
                    placeholder="0.00"
                    value={incomeForm.amount}
                    onIonInput={(e) =>
                      setIncomeForm({
                        ...incomeForm,
                        amount: String(e.detail.value ?? ""),
                      })
                    }
                    style={{
                      color: "#ffffff",
                      "--placeholder-color": "rgba(255, 255, 255, 0.4)",
                    }}
                  />
                </IonItem>

                <IonItem
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    borderRadius: "8px",
                    marginBottom: "16px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <IonLabel
                    position="stacked"
                    style={{ color: "rgba(255, 255, 255, 0.9)" }}
                  >
                    Account (Optional)
                  </IonLabel>
                  <IonSelect
                    interface="popover"
                    value={incomeForm.accountId}
                    onIonChange={(e) =>
                      setIncomeForm({
                        ...incomeForm,
                        accountId: e.detail.value,
                      })
                    }
                    style={{
                      color: "#ffffff",
                    }}
                  >
                    <IonSelectOption value="">
                      No specific account
                    </IonSelectOption>
                    {accounts.map((a: any) => (
                      <IonSelectOption key={a.id} value={a.id}>
                        {a.name}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
              </IonList>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                }}
              >
                <IonButton
                  fill="clear"
                  onClick={() => setShowIncomeModal(false)}
                  style={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "16px",
                    fontWeight: "500",
                  }}
                >
                  Cancel
                </IonButton>
                <IonButton
                  onClick={onSaveIncome}
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "#ffffff",
                    borderRadius: "8px",
                    padding: "12px 20px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    "--background": "rgba(255, 255, 255, 0.1)",
                    "--background-activated": "rgba(255, 255, 255, 0.15)",
                    "--background-hover": "rgba(255, 255, 255, 0.12)",
                    "--color": "#ffffff",
                    "--color-activated": "#ffffff",
                    "--color-hover": "#ffffff",
                  }}
                >
                  <IonIcon icon={add} slot="start" />
                  Add Income
                </IonButton>
              </div>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
}
