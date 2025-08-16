import {
  IonButton,
  IonButtons,
  IonIcon,
  IonModal,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonDatetime,
  IonDatetimeButton,
} from "@ionic/react";
import { calendar, close } from "ionicons/icons";
import { useState } from "react";
import { useStore } from "../data/store";
import {
  formatRangeLabel,
  startOfMonthISO,
  endOfMonthISO,
  todayISO,
  addDaysISO,
} from "../utils/date";
import Shell from "../components/Shell";

export default function DateRangeButton() {
  const { dateRange, setDateRange } = useStore();
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState(dateRange.start);
  const [end, setEnd] = useState(dateRange.end);

  const apply = () => {
    setDateRange({ start, end });
    setOpen(false);
  };

  const applyPreset = (p: "today" | "7d" | "month") => {
    if (p === "today") {
      const t = todayISO();
      setStart(t);
      setEnd(t);
    } else if (p === "7d") {
      const e = todayISO();
      setStart(addDaysISO(e, -6));
      setEnd(e);
    } else {
      setStart(startOfMonthISO());
      setEnd(endOfMonthISO());
    }
  };

  return (
    <>
      <IonButton onClick={() => setOpen(true)} className="date-range-button">
        <IonIcon icon={calendar} slot="start" />
        {formatRangeLabel(dateRange.start, dateRange.end)}
      </IonButton>

      {/* Centered glass dialog, like Add/Edit */}
      <IonModal
        isOpen={open}
        onDidDismiss={() => setOpen(false)}
        keepContentsMounted
        className="dialog-modal date-modal"
      >
        <Shell
          title="Select date range"
          className="dialog"
          actions={
            <IonButton fill="outline" onClick={() => setOpen(false)}>
              <IonIcon icon={close} slot="start" /> Close
            </IonButton>
          }
        >
          <div className="panel-body">
            {/* Presets */}
            <IonList inset>
              <IonItem button onClick={() => applyPreset("today")}>
                <IonLabel>Today</IonLabel>
              </IonItem>
              <IonItem button onClick={() => applyPreset("7d")}>
                <IonLabel>Last 7 days</IonLabel>
              </IonItem>
              <IonItem button onClick={() => applyPreset("month")}>
                <IonLabel>This month</IonLabel>
              </IonItem>
            </IonList>

            {/* Start / End as rows with pop-up calendars */}
            <IonList inset>
              <IonItem>
                <IonLabel>Start</IonLabel>
                <div slot="end">
                  <IonDatetimeButton
                    datetime="dr-start"
                    className="dt-trigger"
                  />
                </div>
              </IonItem>
              <IonItem>
                <IonLabel>End</IonLabel>
                <div slot="end">
                  <IonDatetimeButton datetime="dr-end" className="dt-trigger" />
                </div>
              </IonItem>
            </IonList>

            {/* Pop-up calendars (dark themed via .dt-pop in your CSS) */}
            <IonModal keepContentsMounted className="dt-pop">
              <IonDatetime
                id="dr-start"
                presentation="date"
                value={start}
                onIonChange={(e) =>
                  setStart(String(e.detail.value).slice(0, 10))
                }
              />
            </IonModal>

            <IonModal keepContentsMounted className="dt-pop">
              <IonDatetime
                id="dr-end"
                presentation="date"
                value={end}
                onIonChange={(e) => setEnd(String(e.detail.value).slice(0, 10))}
              />
            </IonModal>
          </div>

          {/* Footer actions */}
          <div className="form-actions">
            <IonButton fill="outline" onClick={() => setOpen(false)}>
              Cancel
            </IonButton>
            <IonButton onClick={apply}>Apply</IonButton>
          </div>
        </Shell>
      </IonModal>
    </>
  );
}
