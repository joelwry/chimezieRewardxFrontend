"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TaskCard } from "@/components/task-card"
import { RewardNotification } from "@/components/reward-notification"
import { useToast } from "@/components/ui/use-toast"

const PERIOD_OPTIONS = [
  { label: "7 days", value: 1, rate: 25 },
  { label: "30 days", value: 1, rate: 40 },
  { label: "4 months", value: 4, rate: 60 },
  { label: "6 months", value: 6, rate: 80 },
  { label: "8 months", value: 8, rate: 100 },
  { label: "1 year", value: 12, rate: 120 },
]

function getCookie(name: string) {
  if (typeof document === "undefined") return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null
  return null
}

export default function TaskDetailPage() {
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const taskId = params?.id as string
  console.log(`Task id to retrieve ${taskId}`)
  const [task, setTask] = useState<any>(null)
  const [activity, setActivity] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showReward, setShowReward] = useState(false)
  const [rewardAmount, setRewardAmount] = useState(0)
  const [balance, setBalance] = useState<number | null>(null)

  const token = getCookie("access_token")

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [taskRes, activityRes, balanceRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/surveys/${taskId}/`, {
            credentials: "include",
            headers: { "Authorization": `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/?task=${taskId}`, {
            credentials: "include",
            headers: { "Authorization": `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user-balance/`, {
            credentials: "include",
            headers: { "Authorization": `Bearer ${token}` },
          })
        ])
        if (!taskRes.ok) throw new Error("Failed to fetch task details.")
        const taskData = await taskRes.json()
        setTask(taskData)
        if (activityRes.ok) {
          const activityData = await activityRes.json()
          setActivity(activityData.length > 0 ? activityData[0] : null)
          console.log("Activity data from backend")
          console.log(activityData[0])
        } else {
          setActivity(null)
        }
        if (balanceRes.ok) {
          const balanceData = await balanceRes.json()
          setBalance(balanceData.balance ? Number(balanceData.balance) : null)
        }
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    if (taskId && token) fetchData()
  }, [taskId, token])

  const handleTaskComplete = async (result: { taskId: string; amount?: number; period?: number; reward?: number }) => {
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/complete-task/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          task_id: result.taskId,
          amount: result.amount,
          period: result.period,
          reward: result.reward,
        }),
        credentials: "include",
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.action === "fund_wallet") {
          toast({
            title: "Insufficient Balance",
            description: `You need ₦${data.required} but have ₦${data.available}. Please fund your wallet first.`,
            variant: "destructive",
            action: {
              label: "Fund Wallet",
              onClick: () => router.push("/wallet"),
            },
          })
        } else if (data.error === "Task already completed") {
          toast({ title: "Task already completed", description: "You cannot perform this task again." })
        } else {
          toast({ title: "Error", description: data.error || "Failed to complete task.", variant: "destructive" })
        }
        setLoading(false)
        return
      }
      setRewardAmount(result.reward || 0)
      setShowReward(true)
      setTimeout(() => setShowReward(false), 3000)
      // Refetch activity and balance to update UI
      const [activityRes, balanceRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/?task=${result.taskId}`, {
          credentials: "include",
          headers: { "Authorization": `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user-balance/`, {
          credentials: "include",
          headers: { "Authorization": `Bearer ${token}` },
        })
      ])
      if (activityRes.ok) {
        const activityData = await activityRes.json()
        setActivity(activityData.length > 0 ? activityData[0] : null)
      }
      if (balanceRes.ok) {
        const balanceData = await balanceRes.json()
        setBalance(balanceData.balance ? Number(balanceData.balance) : null)
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const getTaskPeriods = (type: string) => {
    if (["lock", "invest", "deposit"].includes(type)) return PERIOD_OPTIONS
    return undefined
  }
  const getMinMax = (type: string) => {
    if (["lock", "invest", "deposit"].includes(type)) return { minAmount: 1000, maxAmount: 1000000 }
    return {}
  }
  const getIcon = (type: string) => {
    switch (type) {
      case "survey": return undefined
      case "video": return undefined
      case "link": return undefined
      case "deposit": return undefined
      case "lock": return undefined
      case "invest": return undefined
      default: return undefined
    }
  }

  // Simple growth summary for lock/invest/deposit
  const renderGrowthSummary = () => {
    if (!activity || !activity.completed_at || !activity.reward_earned) return null
    const startDate = new Date(activity.completed_at)
    const endDate = new Date(startDate)
    let periodMonths = activity.period || 1
    endDate.setMonth(startDate.getMonth() + periodMonths)
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Growth Summary</CardTitle>
          <CardDescription>See your locked/invested funds growth timeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>Amount Locked/Invested: <span className="font-bold">₦{activity.amount || "-"}</span></div>
            <div>Period: <span className="font-bold">{periodMonths} month(s)</span></div>
            <div>Start Date: <span className="font-bold">{startDate.toLocaleDateString()}</span></div>
            <div>End Date: <span className="font-bold">{endDate.toLocaleDateString()}</span></div>
            <div>Estimated Reward: <span className="font-bold text-green-600">₦{activity.reward_earned}</span></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return <div className="p-8 text-center">Loading task details...</div>
  }
  if (!task) {
    return <div className="p-8 text-center text-red-500">Task not found.</div>
  }

  // Pass dynamic props to TaskCard based on type
  let taskCardProps: any = {
    task: {
      id: String(task.id),
      title: task.title,
      type: task.type,
      icon: getIcon(task.type),
      reward: Number(task.reward_amount),
      deadline: task.deadline ? new Date(task.deadline).toLocaleString() : "No deadline",
      description: task.description,
      video_url: task.video_url,
      link_to_share: task.link_to_share,
      periods: getTaskPeriods(task.type),
      ...getMinMax(task.type),
    },
    token: token || "",
    completed: !!activity,
    onComplete: handleTaskComplete,
    showAction: true,
    balance: balance,
  }
  if (task.type === "deposit") {
    // Deposit: only show amount input, deposit instructions
    taskCardProps.depositMode = true
  }
  if (task.type === "link") {
    // Link: show link to share, input for where shared
    taskCardProps.linkMode = true
  }

  return (
    <div className="space-y-6">
      {showReward && <RewardNotification amount={rewardAmount} />}
      {balance !== null && (
        <Card className="bg-background/60 backdrop-blur-sm border border-border/50">
          <CardContent className="py-4 flex items-center justify-between">
            <span className="font-medium">Current Balance:</span>
            <span className="font-bold text-primary">₦{balance.toLocaleString()}</span>
          </CardContent>
        </Card>
      )}
      <Card className="bg-background/60 backdrop-blur-sm border border-border/50">
        <CardHeader>
          <CardTitle>{task.title}</CardTitle>
          <CardDescription>{task.description || "Task details"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">Type: <span className="font-bold">{task.type}</span></div>
          <div className="mb-4">Reward: <span className="font-bold">₦{task.reward_amount}</span></div>
          {task.deadline && <div className="mb-4">Deadline: <span className="font-bold">{new Date(task.deadline).toLocaleString()}</span></div>}
        </CardContent>
      </Card>
      {activity && (activity.completed === true || !!activity.completed_at) && !!activity.reward_earned ? (
   renderGrowthSummary()
) : (
  <TaskCard {...taskCardProps} />
)}
    </div>
  )
} 