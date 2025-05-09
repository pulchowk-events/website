'use client'

import Image from 'next/image'
import { formatDistanceToNow, format } from 'date-fns'
import Link from 'next/link'
import DeleteButton from './DeleteButton'

interface Event {
  id: string
  title: string
  description: string
  event_date: string
  form_link: string
  image_url: string | null
  created_at: string
}

interface EventCardProps {
  event: Event
  isPast?: boolean
  isAdmin?: boolean
  userId?: string 
}

export default function EventCard({ event, isPast = false, isAdmin = false, userId}: EventCardProps) {
  const eventDate = new Date(event.event_date)
  const formattedDate = format(eventDate, 'PPP')
  const formattedTime = format(eventDate, 'p')
  const timeUntil = formatDistanceToNow(eventDate, { addSuffix: true })
  
  const truncateDescription = (text: string, maxLength = 150) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  return (
    <div className="bg-zinc-800 rounded-lg overflow-hidden shadow-lg border border-zinc-700 flex flex-col h-full relative group">
      {/* Image section */}
      <div className="relative h-48 w-full">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="bg-zinc-700 h-full w-full flex items-center justify-center">
            <span className="text-zinc-500 text-lg">No Image</span>
          </div>
        )}
        
        {/* Admin delete button (shown only on hover for better UX) */}
          {isAdmin && (
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              <DeleteButton 
                eventId={event.id} 
                onSuccess={() => window.location.reload()} // or your preferred refresh method
              />
            </div>
          )}
        
        {/* Event status badge */}
        {isPast ? (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
            Past Event
          </div>
        ) : (
          <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
            {timeUntil}
          </div>
        )}
      </div>
      
      {/* Event details */}
      <div className="p-6 flex-grow">
        <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
        
        <div className="flex items-center text-zinc-400 text-sm mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formattedDate} at {formattedTime}</span>
        </div>
        
        <p className="text-zinc-300 mb-6">
          {truncateDescription(event.description)}
        </p>
      </div>
      
      {/* Action section */}
      <div className="p-6 pt-0 mt-auto">
        {!isPast ? (
          <Link 
            href={event.form_link}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-medium text-center transition-colors"
          >
            Register for Event
          </Link>
        ) : (
          <div className="text-zinc-500 text-center py-2">
            This event has ended
          </div>
        )}
      </div>
    </div>
  )
}