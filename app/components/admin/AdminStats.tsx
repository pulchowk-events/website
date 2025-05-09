'use client';

import { Users, Package, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface AdminStatsProps {
  stats: {
    totalProducts: number;
    approvedProducts: number;
    pendingProducts: number;
    totalUsers: number;
    totalEvents: number;
  };
}

export default function AdminStats({ stats }: AdminStatsProps) {
  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: <Package className="h-6 w-6 text-zinc-300" />,
    },
    {
      title: 'Approved Products',
      value: stats.approvedProducts,
      icon: <CheckCircle className="h-6 w-6 text-green-400" />,
    },
    {
      title: 'Pending Review',
      value: stats.pendingProducts,
      icon: <Clock className="h-6 w-6 text-yellow-300" />,
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <Users className="h-6 w-6 text-blue-300" />,
    },
        {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: <Users className="h-6 w-6 text-purple-300" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { delay: index * 0.1 },
          }}
          className="bg-neutral-950 border border-zinc-800 rounded-xl p-5 flex flex-col gap-3 shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-md bg-zinc-900">
              {stat.icon}
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground">{stat.title}</h3>
              <p className="text-2xl font-semibold text-zinc-100">{stat.value}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
