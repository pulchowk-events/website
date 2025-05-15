'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { User, MessageSquare, Package } from 'lucide-react';
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
      {/* Profile Header */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-32 h-32 shrink-0">
            <Image
              src={user.image || '/default-avatar.png'}
              alt={user.name}
              fill
              className="rounded-full object-cover border-4 border-white/10"
            />
          </div>

          <div className="flex-grow text-center sm:text-left space-y-2">
            <h1 className="text-3xl font-semibold text-white">{user.name}</h1>
            {isOwnProfile && (
              <p className="text-white/70 text-sm">{user.email}</p>
            )}

            <div className="grid grid-cols-3  gap-4  max-w-md mx-auto sm:mx-0 mt-4">
              <StatCard label="Posts" value={stats.posts} />
              <StatCard label="Comments" value={stats.comments} />
              <StatCard label="Products" value={stats.products} />
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid grid-cols-3 bg-black border border-white/10 p-2 rounded-xl">
          <TabsTrigger
            value="posts"
            onClick={() => setActiveTab('posts')}
            className={`flex items-center justify-center rounded-full  gap-2 px-4 py-2  transition-all ${
              activeTab === 'posts'
                ? 'bg-green-500/10 text-green-400 hover:text-green-300/80'
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

// Mini stat card
function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white/5 border  border-white/10 rounded-xl p-4 hover:border-white/20 transition">
      <div className="text-xl font-bold text-white text-center">{value}</div>
      <div className="text-xs sm:text-sm text-white/60 text-center">{label}</div>
    </div>
  );
}
