'use client';

import { Users, Heart, Package, CheckCircle, Clock, CalendarDays } from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  approvedProducts: number;
  pendingProducts: number;
  totalUsers: number;
  totalEvents: number;
  totalDonations: number;
}

interface AdminStatsProps {
  stats: DashboardStats;
}

function formatUSD(n: number): string {
  return '$' + (n || 0).toLocaleString('en-US');
}

function formatInt(n: number): string {
  return (n || 0).toLocaleString('en-US');
}

export default function AdminStats({ stats }: AdminStatsProps) {
  const statCards = [
    { label: 'Total products', value: formatInt(stats.totalProducts), icon: Package, tone: 'var(--m)' },
    { label: 'Approved', value: formatInt(stats.approvedProducts), icon: CheckCircle, tone: 'var(--g)' },
    { label: 'Pending review', value: formatInt(stats.pendingProducts), icon: Clock, tone: 'var(--a)' },
    { label: 'Total donations', value: formatUSD(stats.totalDonations), icon: Heart, tone: 'var(--c)' },
    { label: 'Total users', value: formatInt(stats.totalUsers), icon: Users, tone: 'var(--v)' },
    { label: 'Total events', value: formatInt(stats.totalEvents), icon: CalendarDays, tone: 'var(--m)' },
  ];

  return (
    <dl className="admin-stats">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="admin-stat">
            <span
              className="admin-stat__icon"
              style={{ color: stat.tone }}
              aria-hidden="true"
            >
              <Icon size={16} />
            </span>
            <dd className="admin-stat__value">{stat.value}</dd>
            <dt className="admin-stat__label">{stat.label}</dt>
          </div>
        );
      })}
    </dl>
  );
}
