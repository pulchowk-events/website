'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminProductForm from './AdminProductForm';
import AdminUserForm from './AdminUserForm';
import AdminEventForm from './AdminEventForm';
import PendingProducts from './PendingProducts';
import AdminStats from './AdminStats';
import AdminEditDonations from './AdminEditDonations';
import AdminNotificationAdder from './AdminNotificationAdder';


interface AdminDashboardProps {
  session: any;
  dashboardStats: {
    totalProducts: number;
    approvedProducts: number;
    pendingProducts: number;
    totalUsers: number;
    totalEvents: number;
    totalDonations: number;
  };
}

export default function AdminDashboard({ session, dashboardStats }: AdminDashboardProps) {
  return (
    <>
{/* Assuming this is part of a component function */}
    <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 md:px-8 border-x dotted-border-vertical">
      
      <div className="mb-8">
        <AdminStats stats={dashboardStats} />
      </div>
      
      <Tabs defaultValue="donations" className="mt-8">
          {/* Responsive Tabs Layout */}
          <div className="pb-2">
            <TabsList className="flex flex-col sm:flex-row flex-nowrap xs:min-w-max w-full mb-4 sm:mb-6 bg-zinc-800 rounded-md shadow-md">
              
                <TabsTrigger 
                    value="donations" 
                    className="whitespace-nowrap text-sm md:text-base py-3 sm:border-none border-b xs:border-b-0 xs:border-r border-zinc-700 last:border-0"
                  >
                    Manage Donations
                </TabsTrigger>
                

              <TabsTrigger 
                value="pending" 
                className="whitespace-nowrap text-sm md:text-base py-3 sm:border-none border-b xs:border-b-0 xs:border-r border-zinc-700 last:border-0"
              >
                Pending Products
              </TabsTrigger>
              <TabsTrigger 
                value="add-product" 
                className="whitespace-nowrap text-sm md:text-base py-3  sm:border-none border-b xs:border-b-0 xs:border-r border-zinc-700 last:border-0"
              >
                Add Product
              </TabsTrigger>
              <TabsTrigger 
                value="add-event" 
                className="whitespace-nowrap text-sm md:text-base py-3  sm:border-none  border-b xs:border-b-0 xs:border-r border-zinc-700 last:border-0"
              >
                Add Event
              </TabsTrigger>
              <TabsTrigger 
                value="manage-admins" 
                className="whitespace-nowrap text-sm md:text-base py-3  sm:border-none  border-b xs:border-b-0 xs:border-r border-zinc-700 last:border-0"
              >
                Manage Admins
              </TabsTrigger>
                <TabsTrigger value="notifications" className="whitespace-nowrap text-sm md:text-base py-3  sm:border-none  border-b xs:border-b-0 xs:border-r border-zinc-700 last:border-0">
                  Broadcast
                </TabsTrigger>
            </TabsList>
          </div>

                <TabsContent value="donations">
          <Card className="bg-zinc-800/50 shadow-md border border-zinc-800">
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <AdminEditDonations />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending">
          <Card className="bg-zinc-800/50 shadow-md border border-zinc-800">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl md:text-2xl text-white">Pending Product Approvals</CardTitle>
              <CardDescription className="text-sm sm:text-base text-zinc-400">
                Review and approve or reject submitted products
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <PendingProducts />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="add-product">
          <Card className="border border-zinc-800 bg-zinc-800/50 shadow-md">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl md:text-2xl text-white">Add New Product</CardTitle>
              <CardDescription className="text-sm sm:text-base text-zinc-400">
                Directly add an approved product to the marketplace
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <AdminProductForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="add-event">
          <Card className="border border-zinc-800 bg-zinc-800/50 shadow-md">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl md:text-2xl text-white">Add New Event</CardTitle>
              <CardDescription className="text-sm sm:text-base text-zinc-400">
                Schedule and publish new events to the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <AdminEventForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="manage-admins">
          <Card className="bg-zinc-800/50 shadow-md border border-zinc-800">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl md:text-2xl text-white">Admin User Management</CardTitle>
              <CardDescription className="text-sm sm:text-base text-zinc-400">
                Add or remove administrator privileges
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <AdminUserForm />
            </CardContent>
          </Card>
        </TabsContent>
        
          <TabsContent value="notifications">
            <Card className="bg-zinc-800/50 shadow-md border border-zinc-800">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl md:text-2xl text-white">
                  Broadcast Notifications
                </CardTitle>
                <CardDescription className="text-sm sm:text-base text-zinc-400">
                  Send notifications to all users
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <AdminNotificationAdder />
              </CardContent>
            </Card>
          </TabsContent>
      </Tabs>
    </div>
    </>
  );
  
}