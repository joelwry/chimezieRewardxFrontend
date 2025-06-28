"use client"

import { ArrowUpRight, BadgeCheck, Coins } from "lucide-react"

interface ActivityItemProps {
  activity: {
    id: string
    type: string
    title: string
    reward?: number
    amount?: number
    time: string
  }
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const getIcon = () => {
    switch (activity.type) {
      case "task_completed":
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10">
            <BadgeCheck className="w-4 h-4 text-green-500" />
          </div>
        )
      case "deposit":
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10">
            <Coins className="w-4 h-4 text-blue-500" />
          </div>
        )
      default:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-500/10">
            <ArrowUpRight className="w-4 h-4 text-gray-500" />
          </div>
        )
    }
  }

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-muted/50">
      {getIcon()}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{activity.title}</p>
        <p className="text-xs text-muted-foreground">{activity.time}</p>
      </div>
      {activity.reward && <div className="text-sm font-medium text-green-500">+{activity.reward} tokens</div>}
      {activity.amount && <div className="text-sm font-medium text-blue-500">+{activity.amount} tokens</div>}
    </div>
  )
}
