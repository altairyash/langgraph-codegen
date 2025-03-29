"use client"

import type React from "react"
import "./globals.css"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import "./index.css"


const SendIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="icon-send"
  >
    <path d="M22 2 11 13"></path>
    <path d="m22 2-7 20-4-9-9-4 20-7z"></path>
  </svg>
)

const LoadingIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="icon-loading"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
  </svg>
)

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="icon-user"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)

const AIIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="icon-ai"
  >
    <path d="M12 2a8 8 0 0 0-8 8c0 1.5.5 2.5 1.5 3 .5.2 1 .6 1 1.5V17a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2.5c0-.9.5-1.3 1-1.5 1-.5 1.5-1.5 1.5-3a8 8 0 0 0-8-8Z"></path>
    <path d="M9.5 10.5a.5.5 0 0 1 0-1h5a.5.5 0 0 1 0 1z"></path>
    <path d="M12 7.5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1z"></path>
    <path d="M12 17.5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1z"></path>
  </svg>
)


const StarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="icon-star"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
)

const BoltIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="icon-bolt"
  >
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
  </svg>
)

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const threadId = 449
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isInputFocused, setIsInputFocused] = useState(false)


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])


  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return


    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const apiUrl = import.meta.env.VITE_API_URL

      if (!apiUrl) {
        throw new Error("API URL not configured. Please set VITE_API_URL environment variable.")
      }
      console.log("sending request to", apiUrl)
      const response = await fetch(`${apiUrl}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          thread_id: threadId,
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()
      console.log("response", data)
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: data,
        sender: "ai",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error generating response:", error)

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: "Sorry, I encountered an error while generating a response. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setTimeout(() => { 
        inputRef.current?.focus()
      }, 100)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="app">
      <motion.div
        className="chat-container"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
      >
        <motion.header
          className="chat-header"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4, type: "spring" }}
        >
          <div className="header-content">
            <motion.div className="logo" whileHover={{ scale: 1.05, rotate: 2 }} whileTap={{ scale: 0.95 }}>
              <motion.div
                className="logo-icon"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <BoltIcon />
              </motion.div>
              <h1>AI Chat</h1>
            </motion.div>
            <motion.div
              className="header-status"
              animate={{
                opacity: isLoading ? [0.7, 1, 0.7] : 1,
                scale: isLoading ? [0.98, 1, 0.98] : 1,
              }}
              transition={{
                repeat: isLoading ? Number.POSITIVE_INFINITY : 0,
                duration: 2,
              }}
            >
              {isLoading ? "Thinking..." : "Ready"}
            </motion.div>
          </div>
        </motion.header>

        <div className="messages-container">
          <div className="messages-wrapper">
            <AnimatePresence mode="popLayout">
              {messages.length === 0 ? (
                <motion.div
                  className="empty-state"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, type: "spring" }}
                >
                  <motion.div
                    className="empty-icon"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 4,
                    }}
                  >
                    <StarIcon />
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    Start a conversation
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                  >
                    Ask me anything and I'll do my best to help you.
                  </motion.p>
                </motion.div>
              ) : (
                messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    className={`message ${message.sender === "user" ? "user-message" : "ai-message"}`}
                    initial={{
                      opacity: 0,
                      y: 20,
                      scale: 0.95,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.1,
                      type: "spring",
                    }}
                  >
                    <motion.div
                      className="message-avatar"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {message.sender === "user" ? <UserIcon /> : <AIIcon />}
                    </motion.div>
                    <motion.div
                      className="message-bubble"
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <motion.div
                        className="message-content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p>{message.content}</p>
                      </motion.div>
                      <motion.div
                        className="message-timestamp"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        transition={{ delay: 0.2 }}
                      >
                        {formatTime(message.timestamp)}
                      </motion.div>
                    </motion.div>
                  </motion.div>
                ))
              )}

              {isLoading && (
                <motion.div
                  className="message ai-message loading-message"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="message-avatar"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <AIIcon />
                  </motion.div>
                  <div className="message-bubble">
                    <div className="message-content">
                      <motion.div className="loading-indicator">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="dot"
                            animate={{
                              y: ["0%", "-50%", "0%"],
                              opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                              repeat: Number.POSITIVE_INFINITY,
                              duration: 1,
                              delay: i * 0.2,
                              ease: "easeInOut",
                            }}
                          />
                        ))}
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>

        <motion.form
          className={`input-container ${isInputFocused ? "input-focused" : ""}`}
          onSubmit={handleSubmit}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
        >
          <motion.input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            placeholder="Type your message..."
            disabled={isLoading}
            whileFocus={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <motion.button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`send-button ${isLoading ? "loading" : ""} ${input.trim() ? "has-input" : ""}`}
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95, rotate: -5 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
              >
                <LoadingIcon />
              </motion.div>
            ) : (
              <SendIcon />
            )}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  )
}

export default App

