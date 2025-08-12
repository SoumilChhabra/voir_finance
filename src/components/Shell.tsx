import { createPortal } from "react-dom";

// Shell.tsx (additions)
type Props = {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  dialog?: boolean;
  onDismiss?: () => void;
  className?: string;
};

export default function Shell({
  title,
  actions,
  children,
  dialog,
  onDismiss,
  className,
}: Props) {
  const panel = (
    <>
      {dialog && <div className="overlay-scrim" onClick={onDismiss} />}
      <div className={`app-panel ${dialog ? "dialog" : ""} ${className ?? ""}`}>
        <div className="panel-header">
          <h2>{title}</h2>
          <div className="panel-actions">{actions}</div>
        </div>
        <div className="panel-body">{children}</div>
      </div>
    </>
  );

  return dialog ? createPortal(panel, document.body) : panel;
}
