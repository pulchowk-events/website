'use client';

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
  return (
    <div className="profile">
      <header className="profile__header">
        <div className="profile__identity">
          <span className="profile__avatar">
            <Image
              src={user.image || '/default-avatar.png'}
              alt={user.name}
              fill
              sizes="128px"
              className="profile__avatar-img"
            />
          </span>

          <div className="profile__info">
            <h1 className="profile__name">{user.name}</h1>
            {isOwnProfile && <p className="profile__email">{user.email}</p>}
            {isOwnProfile && (
              <button type="button" className="btn btn--secondary btn--sm" disabled>
                <span className="btn__label">
                  <Edit size={14} style={{ marginRight: 8 }} />
                  Edit profile
                </span>
                <span className="btn__label btn__label--dup" aria-hidden="true">
                  <Edit size={14} style={{ marginRight: 8 }} />
                  Edit profile
                </span>
              </button>
            )}
          </div>
        </div>

        <dl className="profile__stats">
          <StatCard label="Posts" value={stats.posts} icon={<User size={14} />} />
          <StatCard label="Comments" value={stats.comments} icon={<MessageSquare size={14} />} />
          <StatCard label="Projects" value={stats.products} icon={<Package size={14} />} />
        </dl>
      </header>

      <Tabs defaultValue="posts" className="profile__tabs">
        <TabsList className="profile__tablist" aria-label="Content">
          <TabsTrigger value="posts" className="tab profile__tab">
            <User size={14} />
            Posts
          </TabsTrigger>
          <TabsTrigger value="comments" className="tab profile__tab">
            <MessageSquare size={14} />
            Comments
          </TabsTrigger>
          <TabsTrigger value="products" className="tab profile__tab">
            <Package size={14} />
            Projects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="profile__panel">
          <UserPosts userId={user.id} />
        </TabsContent>
        <TabsContent value="comments" className="profile__panel">
          <UserComments userId={user.id} />
        </TabsContent>
        <TabsContent value="products" className="profile__panel">
          <UserProducts userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="profile__stat">
      <span className="profile__stat-icon">{icon}</span>
      <dd className="profile__stat-value">{value}</dd>
      <dt className="profile__stat-label">{label}</dt>
    </div>
  );
}
