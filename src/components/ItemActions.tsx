import { useState, useRef } from "react";
import {
  IonButton,
  IonIcon,
  IonPopover,
  IonList,
  IonItem,
  IonLabel,
} from "@ionic/react";
import { ellipsisVertical, createOutline, trashOutline } from "ionicons/icons";

interface ItemActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  label?: string; // aria label for trigger
  editLabel?: string;
  deleteLabel?: string;
}

/**
 * Reusable three-dots action menu for list rows.
 * Usage: <ItemActions onEdit={() => ...} onDelete={() => ...} />
 */
export default function ItemActions({
  onEdit,
  onDelete,
  label,
  editLabel = "Edit",
  deleteLabel = "Delete",
}: ItemActionsProps) {
  const [open, setOpen] = useState(false);
  const [event, setEvent] = useState<MouseEvent | undefined>();
  const triggerRef = useRef<HTMLIonButtonElement | null>(null);

  return (
    <>
      <IonButton
        ref={triggerRef}
        fill="clear"
        size="small"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // store the native event so popover can position relative to it
          setEvent(e.nativeEvent as MouseEvent);
          setOpen(true);
        }}
        aria-label={label ?? "Item actions"}
        className="item-actions-trigger"
      >
        <IonIcon icon={ellipsisVertical} />
      </IonButton>
      <IonPopover
        isOpen={open}
        onDidDismiss={() => setOpen(false)}
        translucent={true}
        event={event}
        side="bottom"
        alignment="end"
        showBackdrop={false}
        className="item-actions-popover-wrapper"
      >
        <IonList lines="none" className="item-actions-popover">
          {onEdit && (
            <IonItem
              button
              detail={false}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onEdit();
              }}
            >
              <IonIcon icon={createOutline} slot="start" />
              <IonLabel>{editLabel}</IonLabel>
            </IonItem>
          )}
          {onDelete && (
            <IonItem
              button
              detail={false}
              color="danger"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onDelete();
              }}
            >
              <IonIcon icon={trashOutline} slot="start" />
              <IonLabel>{deleteLabel}</IonLabel>
            </IonItem>
          )}
        </IonList>
      </IonPopover>
    </>
  );
}
