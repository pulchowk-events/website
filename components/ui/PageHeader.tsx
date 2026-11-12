import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  count?: string | number;
  actions?: ReactNode;
  action?: ReactNode;
  eyebrow?: string;
  description?: string;
  size?: "lg" | "sm";
}

export function PageHeader({ title, count, actions, action, description, size = "lg" }: PageHeaderProps) {
  const slot = actions ?? action;
  return (
    <header className="page-head" data-size={size}>
      <div className="page-head__row">
        <h1 className="page-head__title">{title}</h1>
        {count !== undefined && <span className="page-head__count">{count}</span>}
        {slot && <div className="page-head__actions">{slot}</div>}
      </div>
      {description && <p className="page-head__desc">{description}</p>}
    </header>
  );
}
