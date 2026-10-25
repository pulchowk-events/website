'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

export default function AdminProductForm() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
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

    if (!formData.name || !formData.description || !formData.url) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      setLoading(true)

      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('url', formData.url)
      if (image) {
        formDataToSend.append('image', image)
      }

      const response = await fetch('/api/products/submit', {
        method: 'POST',
        body: formDataToSend,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add product')
      }

      toast.success('Product added successfully')
      setFormData({
        name: '',
        description: '',
        url: '',
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Product Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-background border border-border rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 text-foreground px-4 py-2"
            required
          />
        </div>

        <div>
          <label
            htmlFor="url"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Product URL *
          </label>
          <input
            type="text"
            id="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            className="w-full bg-background border border-border rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 text-foreground px-4 py-2"
            required
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full bg-background border border-border rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 text-foreground px-4 py-2 resize-y"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Product Image
        </label>

        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
            id="product-image"
            className="sr-only"
          />

          <label
            htmlFor="product-image"
            className="inline-block px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-accent rounded cursor-pointer"
          >
            Upload Image
          </label>

          {image && (
            <p className="mt-2 text-xs text-muted-foreground truncate">
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
            'Add Product'
          )}
        </button>
      </div>
    </form>
  )
}