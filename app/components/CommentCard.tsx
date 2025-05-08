'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../lib/supabase';
import Image from 'next/image';
import { User } from 'lucide-react';

interface CommentCardProps {
  comment: {
    id: number;
    comment: string;
    created_at: string;
    user_id: string;
  };
  isOwner: boolean;
  onDelete: (id: number) => void;
}

export function CommentCard({ comment, isOwner, onDelete }: CommentCardProps) {
  const [userData, setUserData] = useState<{ name: string; image: string | null } | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      const { data } = await supabase
        .from('users')
        .select('name, image')
        .eq('id', comment.user_id)
        .single();
      
      if (data) setUserData(data);
    }

    fetchUserData();
  }, [comment.user_id]);

  return (
    <div className="flex gap-4 p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
      <div className="flex-shrink-0">
        {userData?.image ? (
          <Image
            src={userData.image}
            alt={userData.name || 'User'}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
            <User className="w-6 h-6 text-zinc-400" />
          </div>
        )}
      </div>
      
      <div className="flex-grow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-zinc-200">
              {userData?.name || 'Anonymous'}
            </span>
            <span className="text-xs text-zinc-400">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          {isOwner && (
            <button
              onClick={() => onDelete(comment.id)}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              Delete
            </button>
          )}
        </div>
        
        <p className="mt-1 text-zinc-300">{comment.comment}</p>
      </div>
    </div>
  );
}