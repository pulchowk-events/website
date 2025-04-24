'use client';

import { VoteButton as BaseVoteButton } from './VoteButton';

export function ClientVoteButton({ productId }: { productId: number }) {
  return <BaseVoteButton productId={productId} />;
}