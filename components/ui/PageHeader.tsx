import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header__body">
        <p className="page-header__eyebrow">{eyebrow}</p>
        <h1 className="page-header__title">{title}</h1>
        {description && <p className="page-header__desc">{description}</p>}
      </div>
      {action && <div className="page-header__action">{action}</div>}
    </header>
  );
}
