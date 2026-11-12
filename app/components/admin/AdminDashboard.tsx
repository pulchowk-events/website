'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  LayoutDashboard,
  Calendar,
  Heart,
  Clock,
  Gift,
  CalendarDays,
  UserPlus,
  Bell,
  Flag,
  Menu,
  X,
} from 'lucide-react';

import AdminStats from './AdminStats';
import AdminEditDonations from './AdminEditDonations';
import PendingProducts from './PendingProducts';
import AdminProductForm from './AdminProductForm';
import AdminEventForm from './AdminEventForm';
import AdminUserForm from './AdminUserForm';
import AdminNotificationAdder from './AdminNotificationAdder';
import AdminReports from './AdminReports';
import AdminPendingEvents from './AdminPendingEvents';

interface DashboardStats {
  totalProducts: number;
  approvedProducts: number;
  pendingProducts: number;
  totalUsers: number;
  totalEvents: number;
  totalDonations: number;
}

interface AdminDashboardProps {
  session: any;
  dashboardStats: DashboardStats;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'pending-events', label: 'Pending events', icon: Calendar },
  { id: 'donations', label: 'Donations', icon: Heart },
  { id: 'pending', label: 'Pending products', icon: Clock },
  { id: 'add-product', label: 'Add product', icon: Gift },
  { id: 'add-event', label: 'Add event', icon: CalendarDays },
  { id: 'manage-admins', label: 'Manage admins', icon: UserPlus },
  { id: 'notifications', label: 'Broadcast', icon: Bell },
  { id: 'reports', label: 'Reports', icon: Flag },
] as const;

type NavId = typeof NAV_ITEMS[number]['id'];

export default function AdminDashboard({ session, dashboardStats }: AdminDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NavId>('dashboard');

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [sidebarOpen]);

  const activeLabel = NAV_ITEMS.find((i) => i.id === activeTab)?.label ?? 'Overview';

  return (
    <div className="admin-shell">
      {sidebarOpen && (
        <div className="admin-scrim" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      <aside
        className={'admin-sidebar' + (sidebarOpen ? ' admin-sidebar--open' : '')}
        aria-label="Admin navigation"
      >
        <header className="admin-sidebar__head">
          <a href="/" className="admin-sidebar__logo">
            Pulchowk Events
          </a>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="admin-sidebar__close"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </header>

        <nav className="admin-sidebar__nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className="admin-nav-btn"
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="admin-body">
        <header className="admin-header">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="admin-header__hamburger"
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>
          <h1 className="admin-header__title">{activeLabel}</h1>

          <div className="admin-header__actions">
            <div className="admin-user">
              <span className="admin-user__avatar">
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session?.user?.name || 'Admin'}
                    width={28}
                    height={28}
                    className="admin-user__avatar-img"
                  />
                ) : (
                  <span className="admin-user__initial">
                    {session?.user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                )}
              </span>
              <div className="admin-user__meta">
                <span className="admin-user__name">{session?.user?.name || 'Admin'}</span>
                <span className="admin-user__email">{session?.user?.email || ''}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-main">
          <div className="admin-content">
            {activeTab === 'dashboard' && (
              <div className="admin-panel-stack">
                <AdminStats stats={dashboardStats} />

                <div className="admin-two-col">
                  <section className="admin-panel">
                    <header className="admin-panel__head">
                      <h2 className="admin-panel__title">Recent activity</h2>
                      <p className="admin-panel__desc">Latest activity across the platform.</p>
                    </header>
                    <div className="admin-panel__body">
                      <ul className="admin-activity">
                        {[
                          { tone: 'g', label: 'New product approved', time: '2 hours ago' },
                          { tone: 'g', label: 'Donation received', time: '5 hours ago' },
                          { tone: 'a', label: 'New event added', time: 'Yesterday' },
                        ].map((row, i) => (
                          <li key={i} className="admin-activity__row">
                            <span
                              className="admin-activity__dot"
                              style={{ background: 'var(--' + row.tone + ')' }}
                              aria-hidden="true"
                            />
                            <div>
                              <p className="admin-activity__label">{row.label}</p>
                              <p className="admin-activity__time">{row.time}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>

                  <section className="admin-panel">
                    <header className="admin-panel__head">
                      <h2 className="admin-panel__title">Quick actions</h2>
                      <p className="admin-panel__desc">Common administrative tasks.</p>
                    </header>
                    <div className="admin-panel__body">
                      <div className="admin-quick">
                        {[
                          { label: 'Approve products', target: 'pending' },
                          { label: 'Add product', target: 'add-product' },
                          { label: 'New event', target: 'add-event' },
                          { label: 'Send broadcast', target: 'notifications' },
                        ].map((action) => (
                          <button
                            key={action.target}
                            type="button"
                            onClick={() => setActiveTab(action.target as NavId)}
                            className="admin-quick__btn"
                          >
                            <span className="admin-quick__title">{action.label}</span>
                            <span className="admin-quick__sub">Quick access</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            )}

            {activeTab === 'pending-events' && (
              <AdminPanel
                title="Pending events"
                description="Review and manage submitted events."
              >
                <AdminPendingEvents />
              </AdminPanel>
            )}

            {activeTab === 'donations' && (
              <AdminPanel
                title="Donations"
                description="View and manage all donation records."
              >
                <AdminEditDonations />
              </AdminPanel>
            )}

            {activeTab === 'pending' && (
              <AdminPanel
                title="Pending products"
                description="Review and approve or reject submitted products."
              >
                <PendingProducts />
              </AdminPanel>
            )}

            {activeTab === 'add-product' && (
              <AdminPanel
                title="Add product"
                description="Directly add an approved product to the marketplace."
              >
                <AdminProductForm />
              </AdminPanel>
            )}

            {activeTab === 'add-event' && (
              <AdminPanel
                title="Add event"
                description="Schedule and publish a new event."
              >
                <AdminEventForm />
              </AdminPanel>
            )}

            {activeTab === 'manage-admins' && (
              <AdminPanel
                title="Manage admins"
                description="Add or remove administrator privileges."
              >
                <AdminUserForm />
              </AdminPanel>
            )}

            {activeTab === 'notifications' && (
              <AdminPanel
                title="Broadcast notification"
                description="Send notifications to all users."
              >
                <AdminNotificationAdder />
              </AdminPanel>
            )}

            {activeTab === 'reports' && (
              <AdminPanel
                title="Reports"
                description="Review and manage reported content."
              >
                <AdminReports />
              </AdminPanel>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function AdminPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="admin-panel">
      <header className="admin-panel__head">
        <h2 className="admin-panel__title">{title}</h2>
        <p className="admin-panel__desc">{description}</p>
      </header>
      <div className="admin-panel__body">{children}</div>
    </section>
  );
}
