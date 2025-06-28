"use client"

import { useEffect, useState } from "react"
import {
  ArrowUpRight, BadgeCheck, Coins,
  Filter, MessageSquare, Search,
  Sparkles, Video
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TaskCard } from "@/components/task-card"
import { RewardNotification } from "@/components/reward-notification"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface SurveyTask {
  id: number
  title: string
  type: "lock" | "invest" | "link" | "deposit"
  reward_amount: number
  deadline: string
}

const PERIOD_OPTIONS = [
  { label: "7 days", value: 1, rate: 10 },
  { label: "30 days", value: 1, rate: 15 },
  { label: "4 months", value: 4, rate: 20 },
  { label: "6 months", value: 6, rate: 25 },
  { label: "8 months", value: 8, rate: 30 },
  { label: "1 year", value: 12, rate: 40 },
]

export default function TasksPage() {
  const { toast } = useToast()
  const router = useRouter()

  const [tasks, setTasks] = useState<SurveyTask[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("reward-high")
  const [showReward, setShowReward] = useState(false)
  const [rewardAmount, setRewardAmount] = useState(0)

  // Get token from cookies
  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null
    return null
  }
  const token = getCookie("access_token")

  // Fetch tasks and activities
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [tasksRes, activitiesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/surveys/`, {
            credentials: "include",
            headers: { "Authorization": `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/`, {
            credentials: "include",
            headers: { "Authorization": `Bearer ${token}` },
          })
        ])
        const tasksData = await tasksRes.json()
        const activitiesData = await activitiesRes.json()
        setTasks(tasksData)
        setActivities(activitiesData)
      } catch (error) {
        toast({ title: "Error", description: "Failed to load tasks or activities.", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Map completed task IDs
  const completedTaskIds = new Set(activities.map((a: any) => a.task))

  const now = new Date()
  const filteredTasks = tasks.filter((task) => {
    const notCompleted = !completedTaskIds.has(task.id)
    const notExpired = !task.deadline || new Date(task.deadline) > now
    return notCompleted && notExpired && task.title.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Filter and sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case "reward-high":
        return Number(b.reward_amount) - Number(a.reward_amount)
      case "reward-low":
        return Number(a.reward_amount) - Number(b.reward_amount)
      default:
        return 0
    }
  })

  // TaskCard onComplete handler
  const handleTaskComplete = (result: { taskId: string; amount?: number; period?: number; reward?: number }) => {
    setRewardAmount(result.reward || 0)
    setShowReward(true)
    setTimeout(() => setShowReward(false), 3000)
    // Optionally, refetch activities to update completed state
    // ...
  }

  // Helper to get period options for lock/invest
  const getTaskPeriods = (type: string) => {
    if (["lock", "invest", "deposit"].includes(type)) return PERIOD_OPTIONS
    return undefined
  }

  // Helper to get min/max for lock/invest
  const getMinMax = (type: string) => {
    if (["lock", "invest", "deposit"].includes(type)) return { minAmount: 1000, maxAmount: 1000000 }
    return {}
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "survey": return MessageSquare
      case "video": return Video
      case "link": return ArrowUpRight
      case "deposit": return Coins
      case "lock": return Coins
      case "invest": return Coins
      default: return MessageSquare
    }
  }

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      {showReward && <RewardNotification amount={rewardAmount} />}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Complete tasks to earn rewards</p>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm">
            <BadgeCheck className="w-4 h-4 text-green-500" />
            <span className="font-medium">{filteredTasks.length} Tasks Available</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-medium">615 Tokens Earned</span>
          </div>
        </div>
      </div>
      <Card className="bg-background/60 backdrop-blur-sm border border-border/50">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl">Available Tasks</CardTitle>
              <CardDescription>Find tasks that match your interests</CardDescription>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm">
              <BadgeCheck className="w-4 h-4 text-green-500" />
              <span className="font-medium">{filteredTasks.length} Tasks Available</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">Loading tasks...</div>
          ) : (
            <Tabs defaultValue="all">
              <TabsList className="mb-4 grid w-full grid-cols-6 lg:w-auto lg:grid-cols-6">
                <TabsTrigger value="all">All Tasks</TabsTrigger>
                <TabsTrigger value="lock">Lock</TabsTrigger>
                <TabsTrigger value="invest">Invest</TabsTrigger>
                <TabsTrigger value="link">Links</TabsTrigger>
                <TabsTrigger value="deposit">Deposits</TabsTrigger>
              </TabsList>
              {["all", "lock", "invest", "link", "deposit"].map((tab) => (
                <TabsContent key={tab} value={tab}>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {sortedTasks
                      .filter((task) => (tab === "all" ? true : task.type === tab))
                      .filter((task) => {
                        const notCompleted = !completedTaskIds.has(task.id)
                        const notExpired = !task.deadline || new Date(task.deadline) > now
                        return notCompleted && notExpired
                      })
                      .map((task) => (
                        <Card key={task.id} className="flex flex-col h-full justify-between">
                          <CardHeader className="p-4 pb-2">
                            <div className="flex items-start justify-between">
                              <Badge variant="outline" className="mb-2">
                                {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                              </Badge>
                            </div>
                            <CardTitle className="text-base line-clamp-2">{task.title}</CardTitle>
                            {task.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {task.description.length > 80 ? `${task.description.slice(0, 80)}...` : task.description}
                              </p>
                            )}
                          </CardHeader>
                          <CardContent className="p-4 pt-0 flex-1 flex flex-col justify-end">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <div className="flex items-center gap-1 text-primary">
                                <span className="font-bold">₦{task.reward_amount}</span>
                              </div>
                              {task.deadline && <div className="text-muted-foreground text-xs">Expires: {new Date(task.deadline).toLocaleString()}</div>}
                            </div>
                            <Link href={`/tasks/${task.id}`} className="w-full">
                              <Button className="w-full mt-2" variant="default">View</Button>
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
