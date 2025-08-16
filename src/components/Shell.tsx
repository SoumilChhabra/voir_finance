import { createPortal } from "react-dom";
import { forwardRef } from "react";

// Shell.tsx (additions)
type Props = {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  dialog?: boolean;
  onDismiss?: () => void;
  className?: string;
};

const Shell = forwardRef<HTMLDivElement, Props>(
  ({ title, actions, children, dialog, onDismiss, className }, ref) => {
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
            <h2>{title}</h2>
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
