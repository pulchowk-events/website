'use client';
import { ReactNode } from 'react';

interface BtnProps {
  children: ReactNode;
  glass?: boolean;
  href?: string;
  onClick?: () => void;
  target?: string;
  rel?: string;
  className?: string;
  ariaLabel?: string;
}

export default function Btn({ children, glass, href, onClick, target, rel, className = '', ariaLabel }: BtnProps) {
  const cls = `b${glass ? ' g' : ''}${className ? ' ' + className : ''}`;
  const content = (
    <>
      <span className="label--primary">{children}</span>
      <span className="label--duplicate" aria-hidden="true">{children}</span>
    </>
  );
  if (href) return <a href={href} className={cls} target={target} rel={rel} aria-label={ariaLabel}>{content}</a>;
  return <button type="button" className={cls} onClick={onClick} aria-label={ariaLabel}>{content}</button>;
}
