// app/utils/voting.ts
export function calculateTimeUntilNextVote(lastVoteTime: string): {
  hours: number
  minutes: number
  seconds: number
  canVote: boolean
} {
  const lastVote = new Date(lastVoteTime)
  const now = new Date()
  
  // Set next vote time to midnight after last vote
  const nextVoteTime = new Date(lastVote)
  nextVoteTime.setDate(lastVote.getDate() + 1)
  nextVoteTime.setHours(0, 0, 0, 0)
  
  const diffMs = nextVoteTime.getTime() - now.getTime()
  
  if (diffMs <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, canVote: true }
  }
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)
  
  return { hours, minutes, seconds, canVote: false }
}