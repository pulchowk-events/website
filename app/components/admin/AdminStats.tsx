'use client';

import { Users, Heart, Package, CheckCircle, Clock, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';

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

export default function AdminStats({ stats }: AdminStatsProps) {
  
  
  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: <Package className="h-5 w-5 text-zinc-300" />,
      bgColor: 'bg-zinc-900/80',
      borderColor: 'border-zinc-800',
      textColor: 'text-zinc-100'
    },
    {
      title: 'Approved Products',
      value: stats.approvedProducts,
      icon: <CheckCircle className="h-5 w-5 text-emerald-400" />,
      bgColor: 'bg-emerald-950/30',
      borderColor: 'border-emerald-900/50',
      textColor: 'text-emerald-100'
    },
    {
      title: 'Pending Review',
      value: stats.pendingProducts,
      icon: <Clock className="h-5 w-5 text-amber-300" />,
      bgColor: 'bg-amber-950/30',
      borderColor: 'border-amber-900/50',
      textColor: 'text-amber-100'
    },
    {
      title: 'Total Donations',
      value: `$${stats.totalDonations}`,
      icon: <Heart className="h-5 w-5 text-rose-400" />,
      bgColor: 'bg-rose-950/30',
      borderColor: 'border-rose-900/50',
      textColor: 'text-rose-100'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <Users className="h-5 w-5 text-blue-400" />,
      bgColor: 'bg-blue-950/30',
      borderColor: 'border-blue-900/50',
      textColor: 'text-blue-100'
    },
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: <CalendarDays className="h-5 w-5 text-purple-400" />,
      bgColor: 'bg-purple-950/30',
      borderColor: 'border-purple-900/50', 
      textColor: 'text-purple-100'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { delay: index * 0.05 },
          }}
          className={`${stat.bgColor} border ${stat.borderColor} rounded-xl shadow-lg backdrop-blur-sm`}
        >
          <div className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-black/20 backdrop-blur-sm">
              {stat.icon}
            </div>
            <div>
              <h3 className="text-sm text-zinc-400">{stat.title}</h3>
              <p className={`text-xl font-semibold ${stat.textColor}`}>{stat.value}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}