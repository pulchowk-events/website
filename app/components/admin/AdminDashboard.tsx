'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Heart, 
  Package, 
  CheckCircle, 
  Clock, 
  LayoutDashboard, 
  Gift, 
  CalendarDays, 
  UserPlus, 
  Bell, 
  Flag,
  Menu,
  Calendar,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';

// Type definitions
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

interface AdminDashboardProps {
  session: any;
  dashboardStats: DashboardStats;
}

import AdminStats from './AdminStats';
import AdminEditDonations from './AdminEditDonations';
import PendingProducts from './PendingProducts';
import AdminProductForm from './AdminProductForm';
import AdminEventForm from './AdminEventForm';
import AdminUserForm from './AdminUserForm';
import AdminNotificationAdder from './AdminNotificationAdder';
import AdminReports from './AdminReports';
import AdminPendingEvents  from './AdminPendingEvents'

const navItems = [
  { id: "dashboard", label: "General", icon: <LayoutDashboard size={18} /> },
  { id: "pending-events", label: "Pending Events", icon: <Calendar size={18} /> },
  { id: "donations", label: "Donations", icon: <Heart size={18} /> },
  { id: "pending", label: "Pending Products", icon: <Clock size={18} /> },
  { id: "add-product", label: "Add Product", icon: <Gift size={18} /> },
  { id: "add-event", label: "Add Event", icon: <CalendarDays size={18} /> },
  { id: "manage-admins", label: "Manage Admins", icon: <UserPlus size={18} /> },
  { id: "notifications", label: "Broadcast", icon: <Bell size={18} /> },
  { id: "reports", label: "Reports", icon: <Flag size={18} /> }
];

export default function AdminDashboard({ session, dashboardStats}: AdminDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="flex bg-black text-zinc-100">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 right-4 z-101">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md bg-gray-900 text-zinc-200 hover:bg-black transition-colors border border-zinc-800"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div 
        className={`fixed lg:static inset-y-0 left-0 z-100 w-64 transform transition-transform duration-300 bg-black border-r border-gray-700 dotted-border-vertical
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col h-full ">
          <div className="p-4 border-b h-16 border-gray-700 dotted-border-horizontal">
            <h1 className="text-xl  text-white flex items-center">
              <a href="/">
              Pulchowk Events
              </a>
            </h1>
          </div>
          
          <nav className="flex-1 py-4 overflow-y-auto">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${activeTab === item.id 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/20' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          

        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-black">
        {/* Header */}
        <header className="border-b h-16 dotted-border-horizontal border-gray-700 bg-black bg-opacity-60 backdrop-blur-lg">
          <div className="h-full flex items-center justify-between px-6">
            <h2 className="text-xl font-medium text-white">
              {navItems.find(item => item.id === activeTab)?.label || "Dashboard"}
            </h2>
            <div className="flex items-center space-x-4">
          <div className="p-4 border-l border-gray-700 dotted-border-vertical">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                <img
                    src={session?.user?.image}
                    alt="A"
                    className="w-full h-full object-cover rounded-full"
                  />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{session?.user?.name || 'Admin User'}</p>
                <p className="text-xs text-zinc-400">{session?.user?.email || 'admin@example.com'}</p>
              </div>
            </div>
          </div>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {activeTab === "dashboard" && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-medium text-zinc-100">Dashboard Overview</h3>
                <AdminStats stats={dashboardStats} />
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Recent activity card */}
                  <Card className="bg-white/5 border-gray-700 dotted-border-horizontal">
                    <CardHeader>
                      <CardTitle className="text-white">Recent Activity</CardTitle>
                      <CardDescription className="text-zinc-400">Latest activities on the platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-gray-800">
                            <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-green-400' : i === 1 ? 'bg-green-400' : 'bg-amber-400'}`}></div>
                            <div>
                              <p className="text-sm text-zinc-300">
                                {i === 0 ? 'New product approved' : i === 1 ? 'Donation received' : 'New event added'}
                              </p>
                              <p className="text-xs text-zinc-500">{i === 0 ? '2 hours ago' : i === 1 ? '5 hours ago' : 'Yesterday'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Quick actions card */}
                  <Card className="bg-white/5 border-gray-700 dotted-border-horizontal">
                    <CardHeader>
                      <CardTitle className="text-white">Quick Actions</CardTitle>
                      <CardDescription className="text-zinc-400">Common administrative tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {['Approve Products', 'Add Product', 'New Event', 'Send Broadcast'].map((action, i) => (
                          <button 
                            key={i}
                            className="p-3 rounded-lg bg-white/5 border border-gray-800 text-sm text-zinc-300 hover:bg-white/10 transition-colors text-left flex flex-col"
                            onClick={() => {
                              if (i === 0) setActiveTab("pending");
                              if (i === 1) setActiveTab("add-product");
                              if (i === 2) setActiveTab("add-event");
                              if (i === 3) setActiveTab("notifications");
                            }}
                          >
                            <span className="font-medium">{action}</span>
                            <span className="text-xs text-zinc-500 mt-1">Quick access</span>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === "pending-events" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white/5 border-gray-700 dotted-border-horizontal">
                  <CardHeader>
                    <CardTitle className="text-white">Pending Events</CardTitle>
                    <CardDescription className="text-zinc-400">
                      Review and manage submitted events
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AdminPendingEvents />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "donations" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white/5 border-gray-700 dotted-border-horizontal">
                  <CardHeader>
                    <CardTitle className="text-white">Manage Donations</CardTitle>
                    <CardDescription className="text-zinc-400">View and manage all donation records</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AdminEditDonations />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "pending" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white/5 border-gray-700 dotted-border-horizontal">
                  <CardHeader>
                    <CardTitle className="text-white">Pending Product Approvals</CardTitle>
                    <CardDescription className="text-zinc-400">Review and approve or reject submitted products</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PendingProducts />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "add-product" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white/5 border-gray-700 dotted-border-horizontal">
                  <CardHeader>
                    <CardTitle className="text-white">Add New Product</CardTitle>
                    <CardDescription className="text-zinc-400">Directly add an approved product to the marketplace</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AdminProductForm />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "add-event" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white/5 border-gray-700 dotted-border-horizontal">
                  <CardHeader>
                    <CardTitle className="text-white">Add New Event</CardTitle>
                    <CardDescription className="text-zinc-400">Schedule and publish new events to the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AdminEventForm />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "manage-admins" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white/5 border-gray-700 dotted-border-horizontal">
                  <CardHeader>
                    <CardTitle className="text-white">Admin User Management</CardTitle>
                    <CardDescription className="text-zinc-400">Add or remove administrator privileges</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AdminUserForm />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "notifications" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white/5 border-gray-700 dotted-border-horizontal">
                  <CardHeader>
                    <CardTitle className="text-white">Broadcast Notifications</CardTitle>
                    <CardDescription className="text-zinc-400">Send notifications to all users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AdminNotificationAdder />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "reports" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white/5 border-gray-700 dotted-border-horizontal">
                  <CardHeader>
                    <CardTitle className="text-white">Reported Posts</CardTitle>
                    <CardDescription className="text-zinc-400">Review and manage reported content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AdminReports />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}