"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface PromptBubbleProps {
  message: string
  onClose: () => void
}

export function PromptBubble({ message, onClose }: PromptBubbleProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 100)

    // Auto close after 15 seconds
    const timer = setTimeout(() => {
      handleClose()
    }, 15000)

    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const handleClick = () => {
    // Handle different prompts
    if (message.includes("tasks")) {
      // Navigate to tasks page or show tasks
      console.log("Show tasks")
    } else if (message.includes("transactions")) {
      // Show transactions
      console.log("Show transactions")
    } else if (message.includes("earn more")) {
      // Show high-reward tasks
      console.log("Show high-reward tasks")
    } else if (message.includes("Hold rewards")) {
      // Show hold rewards modal
      console.log("Show hold rewards")
    }

    handleClose()
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out transform",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
        isClosing && "translate-y-10 opacity-0",
      )}
    >
      <Card className="w-64 bg-primary/10 backdrop-blur-md border border-primary/20 shadow-lg shadow-primary/10">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-xs font-medium text-primary">Assistant</p>
            </div>
            <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full" onClick={handleClose}>
              <X className="h-3 w-3" />
            </Button>
          </div>
          <p className="mt-2 text-sm">{message}</p>
          <Button variant="ghost" size="sm" className="mt-2 w-full text-xs hover:bg-primary/20" onClick={handleClick}>
            Show me
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
