import {
  IonButton,
  IonButtons,
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonDatetime,
  IonFooter,
} from "@ionic/react";
import { calendar } from "ionicons/icons";
import { useState } from "react";
import { useStore } from "../data/store";
import {
  formatRangeLabel,
  startOfMonthISO,
  endOfMonthISO,
  todayISO,
  addDaysISO,
} from "../utils/date";

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
      <IonButtons slot="end">
        <IonButton onClick={() => setOpen(true)}>
          <IonIcon icon={calendar} slot="start" />
          {formatRangeLabel(dateRange.start, dateRange.end)}
        </IonButton>
      </IonButtons>

      <IonModal isOpen={open} onDidDismiss={() => setOpen(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Select date range</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
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

          <IonList inset>
            <IonItem>
              <IonLabel position="stacked">Start</IonLabel>
              <IonDatetime
                presentation="date"
                value={start}
                onIonChange={(e) =>
                  setStart(String(e.detail.value).slice(0, 10))
                }
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">End</IonLabel>
              <IonDatetime
                presentation="date"
                value={end}
                onIonChange={(e) => setEnd(String(e.detail.value).slice(0, 10))}
              />
            </IonItem>
          </IonList>
        </IonContent>
        <IonFooter>
          <IonToolbar>
            <IonButtons slot="end">
              <IonButton onClick={() => setOpen(false)}>Cancel</IonButton>
              <IonButton strong onClick={apply}>
                Apply
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonFooter>
      </IonModal>
    </>
  );
}
