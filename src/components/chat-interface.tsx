"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type Message = {
  id: number
  content: string
  sender: 'user' | 'assistant'
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, content: "Hello! I'm your Insurance Claims Assistant. How can I help you today?", sender: 'assistant' },
  ])
  const [input, setInput] = useState('')

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      const newMessage: Message = { id: messages.length + 1, content: input, sender: 'user' }
      setMessages([...messages, newMessage])
      setInput('')
      // Simulate assistant response
      setTimeout(() => {
        const assistantMessage: Message = {
          id: messages.length + 2,
          content: "I'm processing your query about your insurance. Please note that I'm a demo and can't provide real answers yet. In a full implementation, I would use your current profile information to provide personalized responses.",
          sender: 'assistant'
        }
        setMessages(prevMessages => [...prevMessages, assistantMessage])
      }, 1000)
    }
  }

  return (
    <>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-2xl mx-auto">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-2 ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <Avatar>
                  <AvatarFallback>{message.sender === 'user' ? 'U' : 'A'}</AvatarFallback>
                  <AvatarImage src={message.sender === 'user' ? '/user-avatar.png' : '/assistant-avatar.png'} />
                </Avatar>
                <div className={`rounded-lg p-3 max-w-[80%] ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                  {message.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <form onSubmit={handleSend} className="p-4 border-t">
        <div className="max-w-2xl mx-auto flex">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your insurance coverage..."
            className="flex-1 mr-2"
          />
          <Button type="submit">Send</Button>
        </div>
      </form>
    </>
  )
}

