"use client"

import { useState, useEffect } from "react"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface RewardNotificationProps {
  amount: number
}

export function RewardNotification({ amount }: RewardNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 100)

    // Auto close after 3 seconds
    const timer = setTimeout(() => {
      setIsClosing(true)
      setTimeout(() => {
        setIsVisible(false)
      }, 500)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={cn(
        "fixed top-1/4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-in-out",
        isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-90",
        isClosing && "translate-y-[-50px] opacity-0",
      )}
    >
      <div className="flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20">
        <Sparkles className="h-5 w-5" />
        <span className="text-lg font-bold">+ ₦{amount}</span>
        <span>Naira earned!</span>
      </div>
    </div>
  )
}
