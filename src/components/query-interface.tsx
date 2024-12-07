"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function QueryInterface() {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement query submission logic
    console.log('Submitted query:', query)
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <h2 className="text-2xl font-semibold mb-4">Ask about your coverage</h2>
      <Textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="E.g., What's my deductible for out-of-network services?"
        className="mb-4"
      />
      <Button type="submit">Submit Query</Button>
    </form>
  )
}

