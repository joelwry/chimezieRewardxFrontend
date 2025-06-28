"use client"

import { useEffect, useState } from "react"
import {
  BadgeCheck,
  ChevronRight,
  DollarSign,
  Plus,
  Sparkles,
  MessageSquare,
  Video,
  ArrowUpRight,
  Coins,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BalanceChart } from "@/components/balance-chart"
import { TaskCard } from "@/components/task-card"
import { ActivityItem } from "@/components/activity-item"
import { useRouter } from "next/navigation"

const typeIconMap: Record<string, any> = {
  survey: MessageSquare,
  video: Video,
  link: ArrowUpRight,
  deposit: Coins,
}

function mapTaskFromBackend(task: any) {
  return {
    id: String(task.id),
    title: task.title,
    type: task.type,
    reward: Number(task.reward_amount),
    timeEstimate:
      task.type === "video"
        ? "10 min"
        : task.type === "survey"
        ? "5 min"
        : task.type === "link"
        ? "3 min"
        : task.type === "deposit"
        ? "7 days"
        : "",
    icon: typeIconMap[task.type] || MessageSquare,
    deadline: task.deadline
      ? new Date(task.deadline).toLocaleDateString()
      : "No deadline",
    description: task.description,
    video_url: task.video_url,
    link_to_share: task.link_to_share,
  }
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true)
      setError(null)
      // Get token from cookies
      const getCookie = (name: string) => {
        if (typeof document === "undefined") return null
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop()?.split(";").shift() || null
        return null
      }
      const token = getCookie("access_token")
      if (!token) {
        router.push("/login")
        return
      }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/`, {
          credentials: "include",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })
        if (res.status === 401) {
          router.push("/login")
          return
        }
        if (!res.ok) {
          setError("Failed to load dashboard data.")
          setLoading(false)
          return
        }
        const data = await res.json()
        setDashboard(data)
      } catch (err) {
        setError("An error occurred while loading dashboard data.")
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [router])

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>
  }
  if (!dashboard) {
    return <div className="p-8 text-center text-red-500">No dashboard data available.</div>
  }

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, let's earn some rewards!</p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Fund Wallet
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-background/60 backdrop-blur-sm border border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              ₦{dashboard.user_balance}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/60 backdrop-blur-sm border border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <BadgeCheck className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{dashboard.tasks_completed}</div>
          </CardContent>
        </Card>

        <Card className="bg-background/60 backdrop-blur-sm border border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available Tasks</CardTitle>
            <Sparkles className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{dashboard.available_tasks}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4 bg-background/60 backdrop-blur-sm border border-border/50">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Balance Overview</CardTitle>
            <CardDescription>Your balance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <BalanceChart data={dashboard.balance_overview} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 bg-background/60 backdrop-blur-sm border border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.recent_activity.map((activity: any) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-background/60 backdrop-blur-sm border border-border/50">
        <CardHeader>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <CardTitle className="text-lg sm:text-xl">Available Tasks</CardTitle>
              <CardDescription>Complete tasks to earn rewards</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              View All Tasks
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {dashboard.available_tasks_list.map((task: any) => (
              <TaskCard key={task.id} task={mapTaskFromBackend(task)} onComplete={() => {}} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
