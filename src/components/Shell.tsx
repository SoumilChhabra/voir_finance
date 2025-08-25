import { createPortal } from "react-dom";
import { forwardRef } from "react";
import { IonButton, IonIcon } from "@ionic/react";
import { arrowBack } from "ionicons/icons";
import { useHistory } from "react-router";

// Shell.tsx (additions)
type Props = {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  dialog?: boolean;
  onDismiss?: () => void;
  className?: string;
  backButton?: boolean;
  backTo?: string;
};

const Shell = forwardRef<HTMLDivElement, Props>(
  (
    {
      title,
      actions,
      children,
      dialog,
      onDismiss,
      className,
      backButton,
      backTo,
    },
    ref
  ) => {
    const history = useHistory();

    const handleBack = () => {
      if (backTo) {
        history.push(backTo);
      } else {
        history.goBack();
      }
    };

    const panel = (
      <>
        {dialog && <div className="overlay-scrim" onClick={onDismiss} />}
        <div
          className={`app-panel ${dialog ? "dialog" : ""} ${className ?? ""}`}
          ref={ref}
        >
          <div
            className={`panel-header ${
              className?.includes("compact") ? "compact" : ""
            }`}
          >
            <div className="panel-header-left">
              {backButton && (
                <IonButton
                  fill="clear"
                  onClick={handleBack}
                  className="back-button"
                >
                  <IonIcon icon={arrowBack} slot="icon-only" />
                </IonButton>
              )}
              <h2>{title}</h2>
            </div>
            <div
              className={`panel-actions ${
                className?.includes("compact") ? "compact" : ""
              }`}
            >
              {actions}
            </div>
          </div>
          <div className="panel-body">{children}</div>
        </div>
      </>
    );

    return dialog ? createPortal(panel, document.body) : panel;
  }
);

Shell.displayName = "Shell";

export default Shell;
