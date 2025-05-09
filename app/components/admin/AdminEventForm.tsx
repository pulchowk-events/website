'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

export default function AdminEventForm() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    formLink: '',
  })
  const [image, setImage] = useState<File | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!formData.title || !formData.description || !formData.eventDate || !formData.formLink) {
    toast.error('Please fill all required fields')
    return
  }

  try {
    setLoading(true)

    const formDataToSend = new FormData()
    formDataToSend.append('title', formData.title)
    formDataToSend.append('description', formData.description)
    formDataToSend.append('eventDate', formData.eventDate)
    formDataToSend.append('formLink', formData.formLink)
    
    // Add the image file if it exists (matching ProductForm approach)
    if (image instanceof File) {
      formDataToSend.append('image', image, image.name)
    }

    const response = await fetch('/api/events/submit', {
      method: 'POST',
      body: formDataToSend,
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to add event')
    }

    toast.success('Event added successfully')
    setFormData({
      title: '',
      description: '',
      eventDate: '',
      formLink: '',
    })
    setImage(null)
  } catch (err) {
    console.error('Error:', err)
    if (err instanceof Error) {
      toast.error(err.message)
    } else {
      toast.error('Something went wrong')
    }
  } finally {
    setLoading(false)
  }
}

const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0]
    if (file.size > 1024 * 1024) { // 1MB limit
      toast.error('Image must be less than 1MB')
      return
    }
    setImage(file)
  }
}

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-zinc-300 mb-2"
          >
            Event Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full bg-zinc-700 border-transparent rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50 text-zinc-100 px-4 py-2"
            required
          />
        </div>

        <div>
          <label
            htmlFor="eventDate"
            className="block text-sm font-medium text-zinc-300 mb-2"
          >
            Event Date *
          </label>
          <input
            type="datetime-local"
            id="eventDate"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleChange}
            className="w-full bg-zinc-700 border-transparent rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50 text-zinc-100 px-4 py-2"
            required
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="formLink"
          className="block text-sm font-medium text-zinc-300 mb-2"
        >
          Registration Form Link *
        </label>
        <input
          type="url"
          id="formLink"
          name="formLink"
          value={formData.formLink}
          onChange={handleChange}
          className="w-full bg-zinc-700 border-transparent rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50 text-zinc-100 px-4 py-2"
          required
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-zinc-300 mb-2"
        >
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full bg-zinc-700 border-transparent rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50 text-zinc-100 px-4 py-2 resize-y"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Event Image
        </label>

        <div className="relative">
                <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                id="event-image"
                className="sr-only"
                />

          <label
            htmlFor="event-image"
            className="inline-block px-4 py-2 text-sm font-medium text-zinc-200 bg-zinc-700 hover:bg-zinc-600 rounded cursor-pointer"
          >
            Upload Image
          </label>

          {image && (
            <p className="mt-2 text-xs text-zinc-400 truncate">
              Selected: {image.name}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-md font-medium text-white shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {loading ? (
            <>
              <span className="mr-2">Adding...</span>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            </>
          ) : (
            'Add Event'
          )}
        </button>
      </div>
    </form>
  )
}