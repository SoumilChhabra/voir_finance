import { IonIcon } from "@ionic/react";
import { waterOutline } from "ionicons/icons";

export default function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div slot="start" className="brand-pill">
      <IonIcon icon={waterOutline} />
      <span>{compact ? "V" : "Voir"}</span>
    </div>
  );
}
