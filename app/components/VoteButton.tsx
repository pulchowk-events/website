// app/components/VoteButton.tsx
'use client'

import { useState, useEffect } from 'react'
import { ArrowUpIcon } from '@heroicons/react/24/solid'
import { voteForProduct } from '../actions/vote'
import { calculateTimeUntilNextVote } from '../utils/voting'

export function VoteButton({ 
  productId,
  initialVotes,
  userLastVoteTime
}: {
  productId: number
  initialVotes: number
  userLastVoteTime?: string | null
}) {
  const [votes, setVotes] = useState(initialVotes)
  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(
    userLastVoteTime 
      ? calculateTimeUntilNextVote(userLastVoteTime) 
      : { hours: 0, minutes: 0, seconds: 0, canVote: true }
  )

  // Update cooldown timer every second
  useEffect(() => {
    if (!userLastVoteTime || cooldown.canVote) return
    
    const timer = setInterval(() => {
      setCooldown(calculateTimeUntilNextVote(userLastVoteTime))
    }, 1000)
    
    return () => clearInterval(timer)
  }, [userLastVoteTime, cooldown.canVote])

  const handleVote = async () => {
    setError(null)
    try {
      const result = await voteForProduct(productId)
      
      if (result?.success) {
        setVotes(votes + 1)
      } else if (result?.lastVoteTime) {
        setCooldown(calculateTimeUntilNextVote(result.lastVoteTime))
        throw new Error("You can only vote once per day")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to vote')
    }
  }

  return (
    <div className="flex flex-col items-center mr-6">
      <button
        onClick={handleVote}
        disabled={!cooldown.canVote}
        className={`group flex flex-col items-center ${
          !cooldown.canVote ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <ArrowUpIcon
          className={`h-6 w-6 ${
            cooldown.canVote
              ? 'text-gray-400 group-hover:text-primary'
              : 'text-gray-600'
          } transition-colors`}
        />
        <span className="text-lg font-medium mt-1">{votes}</span>
      </button>
      
      {!cooldown.canVote && (
        <div className="text-xs text-gray-400 mt-1">
          Next vote in: {cooldown.hours}h {cooldown.minutes}m {Math.floor(cooldown.seconds)}s
        </div>
      )}
      
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  )
}