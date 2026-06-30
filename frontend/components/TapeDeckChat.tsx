'use client'

import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { clientApi } from '@/lib/api-client'
import type { ChatMessage } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { fadeUp } from '@/lib/motion'
import { cn } from '@/lib/utils'

export function TapeDeckChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Yo — welcome to the Tape Deck. I'm the clerk who's been holding down this section since '93. Ask me about any artist in the chamber, trace a lineage, or tell me what you're feeling and I'll put you on.",
    },
  ])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || streaming) return

    setInput('')
    setError(null)
    const userMsg: ChatMessage = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setStreaming(true)

    const history = messages.map((m) => ({ role: m.role, content: m.content }))
    let assistantText = ''

    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    try {
      for await (const chunk of clientApi.streamChat(text, history)) {
        assistantText += chunk
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: assistantText }
          return updated
        })
        scrollToBottom()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chat failed')
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setStreaming(false)
      scrollToBottom()
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-120px)] max-w-2xl flex-col px-4 py-6 sm:px-6">
      <FadeInHeader />

      <Card className="flex flex-1 flex-col overflow-hidden rounded-none border-chamber-border bg-chamber-surface py-0 ring-0">
        <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[85%] px-4 py-3 text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-chamber-border bg-chamber-bg text-foreground',
                    )}
                  >
                    {msg.content || (streaming && i === messages.length - 1 ? '...' : '')}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-t border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
            >
              {error}
            </motion.p>
          )}
        </CardContent>

        <CardFooter className="border-t border-chamber-border bg-transparent p-0">
          <form onSubmit={handleSubmit} className="flex w-full">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about lineage, philosophy, or who to listen to..."
              disabled={streaming}
              className="flex-1 rounded-none border-0 border-r border-chamber-border bg-chamber-bg focus-visible:ring-0"
            />
            <Button
              type="submit"
              disabled={streaming || !input.trim()}
              className="rounded-none px-5 uppercase tracking-wider"
            >
              Send
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}

function FadeInHeader() {
  return (
    <motion.div
      className="mb-4"
      initial="hidden"
      animate="visible"
      variants={fadeUp}
    >
      <CardHeader className="px-0">
        <CardTitle className="font-heading text-2xl text-white">The Tape Deck</CardTitle>
        <p className="text-sm text-muted-foreground">Your hip-hop philosopher on call.</p>
      </CardHeader>
    </motion.div>
  )
}
