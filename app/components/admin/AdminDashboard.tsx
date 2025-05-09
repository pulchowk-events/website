'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminProductForm from './AdminProductForm';
import AdminUserForm from './AdminUserForm';
import AdminEventForm from './AdminEventForm';
import PendingProducts from './PendingProducts';
import AdminStats from './AdminStats';

interface AdminDashboardProps {
  session: any;
  dashboardStats: {
    totalProducts: number;
    approvedProducts: number;
    pendingProducts: number;
    totalUsers: number;
    totalEvents: number;
  };
}

export default function AdminDashboard({ session, dashboardStats }: AdminDashboardProps) {
  return (
    <div className="max-w-6xl mx-auto py-3 px-4 sm:px-6">
      
      <div className="mb-8">
        <AdminStats stats={dashboardStats} />
      </div>
      
      <Tabs defaultValue="pending" className="mt-8">
        <TabsList className="flex flex-row  w-full mb-6 bg-zinc-800 rounded-md shadow-md">
          <TabsTrigger value="pending">Pending Products</TabsTrigger>
          <TabsTrigger value="add-product">Add Product</TabsTrigger>
          <TabsTrigger value="add-event">Add Event</TabsTrigger>
          <TabsTrigger value="manage-admins">Manage Admins</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <Card className="bg-zinc-800/50 shadow-md border border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Pending Product Approvals</CardTitle>
              <CardDescription className="text-zinc-400">
                Review and approve or reject submitted products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PendingProducts />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="add-product">
          <Card className="border border-zinc-800 bg-zinc-800/50 shadow-md">
            <CardHeader>
              <CardTitle className="text-white">Add New Product</CardTitle>
              <CardDescription className="text-zinc-400">
                Directly add an approved product to the marketplace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminProductForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="add-event">
          <Card className="border border-zinc-800 bg-zinc-800/50 shadow-md">
            <CardHeader>
              <CardTitle className="text-white">Add New Event</CardTitle>
              <CardDescription className="text-zinc-400">
                Schedule and publish new events to the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminEventForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="manage-admins">
          <Card className="bg-zinc-800/50 shadow-md border border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Admin User Management</CardTitle>
              <CardDescription className="text-zinc-400">
                Add or remove administrator privileges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminUserForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card className="border border-zinc-800 bg-zinc-800/50 shadow-md">
            <CardHeader>
              <CardTitle className="text-white">Dashboard Settings</CardTitle>
              <CardDescription className="text-zinc-400">
                Configure your admin dashboard preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-400">Settings panel coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}