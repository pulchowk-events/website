'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { User, MessageSquare, Package, Edit } from 'lucide-react';
import UserPosts from './UserPosts';
import UserComments from './UserComments';
import UserProducts from './UserProducts';

interface ProfileContentProps {
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
  };
  stats: {
    posts: number;
    comments: number;
    products: number;
  };
  isOwnProfile: boolean;
}

export default function ProfileContent({ user, stats, isOwnProfile }: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState('posts');

  return (
    <div className="space-y-8">
      {/* Profile Header - Similar to Lounge page header with 3-column layout */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className='flex flex-col gap-2 md:flex-row md:gap-6'>
          {/* Column 1: Profile Image */}
          <div className="flex justify-center md:justify-start">
            <div className="relative w-32 h-32">
              <Image
                src={user.image || '/default-avatar.png'}
                alt={user.name}
                fill
                className="rounded-full object-cover border-4 border-white/10"
              />
            </div>
          </div>

          {/* Column 2: User Info */}
          <div className="flex flex-col justify-center text-center md:text-left space-y-2">
            <h1 className="text-3xl font-semibold text-white">{user.name}</h1>
            {isOwnProfile && (
              <p className="text-white/70 text-sm">{user.email}</p>
            )}
            {isOwnProfile && (
              <button className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg w-fit mx-auto md:mx-0 mt-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
          </div>
          {/* Column 3: Stats */}
          <div className="flex flex-row justify-end">
            <div className="grid grid-cols-3 gap-3 w-100">
              <StatCard label="Posts" value={stats.posts} icon={<User className="w-4 h-4" />} />
              <StatCard label="Comments" value={stats.comments} icon={<MessageSquare className="w-4 h-4" />} />
              <StatCard label="Products" value={stats.products} icon={<Package className="w-4 h-4" />} />
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs - Updated to match Lounge style */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid grid-cols-3 bg-black border border-white/10 p-2 rounded-xl">
          <TabsTrigger
            value="posts"
            onClick={() => setActiveTab('posts')}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'posts'
                ? 'bg-green-500/10 text-green-400'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            Posts
          </TabsTrigger>
          <TabsTrigger
            value="comments"
            onClick={() => setActiveTab('comments')}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'comments'
                ? 'bg-green-500/10 text-green-400'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Comments
          </TabsTrigger>
          <TabsTrigger
            value="products"
            onClick={() => setActiveTab('products')}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'products'
                ? 'bg-green-500/10 text-green-400'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            Products
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6">
          <UserPosts userId={user.id} />
        </TabsContent>

        <TabsContent value="comments" className="mt-6">
          <UserComments userId={user.id} />
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <UserProducts userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Enhanced stat card with icon - similar to Lounge style
function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 max-w-30 rounded-xl p-4 hover:bg-white/[0.07] transition">
      <div className="flex justify-center mb-2">
        <div className="p-2 rounded-full bg-green-500/10 text-green-400">
          {icon}
        </div>
      </div>
      <div className="text-xl font-bold text-white text-center">{value}</div>
      <div className="text-xs text-white/60 text-center">{label}</div>
    </div>
  );
}