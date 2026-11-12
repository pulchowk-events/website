'use client';

import { Toaster as Sonner, ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        style: {
          background: 'var(--surface-1)',
          color: 'var(--t)',
          border: '1px solid var(--l)',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          fontSize: '13px',
        },
      }}
      style={
        {
          '--normal-bg': 'var(--surface-1)',
          '--normal-text': 'var(--t)',
          '--normal-border': 'var(--l)',
          '--success-bg': 'var(--surface-1)',
          '--success-text': 'var(--g)',
          '--success-border': 'rgba(62, 207, 142, 0.35)',
          '--error-bg': 'var(--surface-1)',
          '--error-text': 'var(--danger)',
          '--error-border': 'rgba(255, 92, 92, 0.35)',
          '--warning-bg': 'var(--surface-1)',
          '--warning-text': 'var(--a)',
          '--warning-border': 'rgba(245, 166, 35, 0.35)',
          '--info-bg': 'var(--surface-1)',
          '--info-text': 'var(--c)',
          '--info-border': 'rgba(76, 201, 240, 0.35)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
