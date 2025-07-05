"use client"

import { useState } from "react"
import type { LucideIcon } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import React from "react"
import formattedCurrency from "@/lib/currency_parser"

interface TaskProps {
  task: {
    id: string
    title: string
    type: string
    reward: number
    timeEstimate?: string
    icon?: LucideIcon
    deadline?: string
    description?: string
    video_url?: string
    link_to_share?: string
    minAmount?: number
    maxAmount?: number
    periods?: { label: string; value: number; rate: number }[]
  }
  onComplete?: (result: { taskId: string; amount?: number; period?: number; reward?: number; linkShared?: string }) => void
  token?: string
  completed?: boolean
  showAction?: boolean
  balance?: number | null
  depositMode?: boolean
  linkMode?: boolean
  disabled?: boolean
}

export function TaskCard({ task, onComplete, token, completed, showAction = false, balance, depositMode = false, linkMode = false, disabled = false }: TaskProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [amount, setAmount] = useState("")
  const [period, setPeriod] = useState<number | null>(null)
  const [calculatedReward, setCalculatedReward] = useState<number | null>(null)
  const [amountError, setAmountError] = useState<string | null>(null)
  const [linkShared, setLinkShared] = useState("")

  const handleRewardCalc = (amt: string, per: number | null) => {
    if (!amt || !per || !task.periods) return setCalculatedReward(null)
    const periodObj = task.periods.find(p => p.value === per)
    if (!periodObj) return setCalculatedReward(null)
    const principal = parseFloat(amt)
    if (isNaN(principal)) return setCalculatedReward(null)
    const reward = principal * (periodObj.rate / 100) * (periodObj.value / 12)
    setCalculatedReward(Number(reward.toFixed(2)))
  }

  React.useEffect(() => {
    handleRewardCalc(amount, period)
    if (showAction && ["lock", "invest", "deposit"].includes(task.type)) {
      if (amount && balance !== undefined && balance !== null && parseFloat(amount) > balance) {
        setAmountError("Insufficient balance for this amount.")
      } else {
        setAmountError(null)
      }
    }
  }, [amount, period, balance])

  const handleComplete = async () => {
    if (amountError) return
    if (linkMode && !linkShared) {
      toast({ title: "Missing info", description: "Please enter where you shared the link." })
      return
    }
    setIsLoading(true)
    try {
      if (["lock", "invest", "deposit"].includes(task.type)) {
        if (!amount || (depositMode ? false : !period)) {
          toast({ title: "Missing info", description: depositMode ? "Enter amount." : "Enter amount and select period." })
          setIsLoading(false)
          return
        }
        if (balance !== undefined && balance !== null && parseFloat(amount) > balance) {
          setAmountError("Insufficient balance for this amount.")
      setIsLoading(false)
          return
        }
      }
      if (onComplete) {
        onComplete({
          taskId: task.id,
          amount: amount ? Number(amount) : undefined,
          period: period || undefined,
          reward: calculatedReward || task.reward,
          linkShared: linkMode ? linkShared : undefined
        })
      }
      setIsDialogOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  const getTaskContent = () => {
    if (depositMode) {
      return (
        <div className="space-y-4">
          <p className="text-sm">Deposit funds to your wallet. Enter the amount you want to deposit:</p>
          <div className="space-y-1">
            <Label htmlFor="deposit-amount">Amount</Label>
            <Input
              id="deposit-amount"
              type="number"
              placeholder={task.minAmount ? `${task.minAmount}` : "100"}
              min={task.minAmount}
              max={task.maxAmount}
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
            {amountError && <div className="text-xs text-red-500 mt-1">{amountError}</div>}
          </div>
          <div className="p-3 bg-muted rounded-md text-sm">
            <p>
              You will receive an instant reward of <span className="font-bold">₦{task.reward}</span> after deposit.
            </p>
          </div>
        </div>
      )
    }
    if (linkMode) {
      return (
        <div className="space-y-4">
          <p className="text-sm">Share this link to earn your reward:</p>
          <div className="space-y-1">
            <Input value={task.link_to_share || ""} readOnly />
          </div>
          <div className="space-y-1">
            <Label htmlFor="link-shared">Where did you share the link?</Label>
            <Input
              id="link-shared"
              placeholder="e.g. WhatsApp, Twitter, Facebook..."
              value={linkShared}
              onChange={e => setLinkShared(e.target.value)}
            />
          </div>
          <div className="p-3 bg-muted rounded-md text-sm">
            <p>
              You will receive an instant reward of <span className="font-bold">₦{task.reward}</span> after confirmation.
            </p>
          </div>
        </div>
      )
    }
    switch (task.type) {
      case "survey":
        return (
          <div className="space-y-4">
            <p className="text-sm">Please answer the following questions:</p>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="q1">How satisfied are you with our platform?</Label>
                <Input id="q1" placeholder="Your answer" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="q2">What features would you like to see added?</Label>
                <Input id="q2" placeholder="Your answer" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="q3">How likely are you to recommend us?</Label>
                <Input id="q3" placeholder="Your answer" />
              </div>
            </div>
          </div>
        )
      case "video":
        return (
          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
              <span className="text-muted-foreground">Video player</span>
            </div>
            <p className="text-sm">Watch the video and answer the question below:</p>
            <div className="space-y-1">
              <Label htmlFor="video-question">What was the main topic of the video?</Label>
              <Input id="video-question" placeholder="Your answer" />
            </div>
          </div>
        )
      case "link":
        return (
          <div className="space-y-4">
            <p className="text-sm">Visit our partner website and complete the following steps:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Click the link below to visit the website</li>
              <li>Create an account or sign in</li>
              <li>Complete the onboarding process</li>
              <li>Return here and submit the confirmation code</li>
            </ol>
            <Button variant="outline" className="w-full">
              Visit Partner Website
            </Button>
            <div className="space-y-1">
              <Label htmlFor="confirmation-code">Confirmation Code</Label>
              <Input id="confirmation-code" placeholder="Enter code" />
            </div>
          </div>
        )
      case "lock":
      case "invest":
      case "deposit":
        return (
          <div className="space-y-4">
            {showAction && balance !== undefined && balance !== null && (
              <div className="mb-2 text-sm text-muted-foreground">
                Your Balance: <span className="font-bold text-primary">₦{balance.toLocaleString()}</span>
              </div>
            )}
            <p className="text-sm">Lock or invest funds for a period to earn rewards:</p>
            <div className="space-y-1">
              <Label htmlFor="lock-amount">Amount</Label>
              <Input
                id="lock-amount"
                type="number"
                placeholder={task.minAmount ? `${task.minAmount}` : "100"}
                min={task.minAmount}
                max={task.maxAmount}
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
              {amountError && <div className="text-xs text-red-500 mt-1">{amountError}</div>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="lock-period">Lock/Invest Period</Label>
              <select
                id="lock-period"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={period || ""}
                onChange={e => setPeriod(Number(e.target.value))}
              >
                <option value="">Select period</option>
                {task.periods?.map(p => (
                  <option key={p.value} value={p.value}>{p.label} ({p.rate}% APY)</option>
                ))}
              </select>
            </div>
            <div className="p-3 bg-muted rounded-md text-sm">
              <p>
                Estimated reward: <span className="font-bold">₦{calculatedReward !== null ? calculatedReward : task.reward}</span>
              </p>
            </div>
          </div>
        )
      default:
        return <p>Complete this task to earn rewards</p>
    }
  }

  return (
    <>
      <Card className={`overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 bg-background/60 backdrop-blur-sm border border-border/50 ${completed ? 'opacity-60 pointer-events-none' : ''}`}>
        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between">
            <Badge variant="outline" className="mb-2">
              {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
            </Badge>
            {task.icon && task.timeEstimate && (
            <Badge variant="secondary" className="gap-1">
              <task.icon className="h-3 w-3" />
              {task.timeEstimate}
            </Badge>
            )}
          </div>
          <CardTitle className="text-base line-clamp-2">{task.title}</CardTitle>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1">
              {task.description.length > 80 ? `${task.description.slice(0, 80)}...` : task.description}
            </p>
          )}
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-primary">
              <span className="font-bold">₦{task.reward}</span>
            </div>
            {task.deadline && <div className="text-muted-foreground text-xs">Expires: {task.deadline}</div>}
          </div>
        </CardContent>
        {showAction && (
        <CardFooter className="p-4 pt-0">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button className="w-full" variant="default" disabled={completed || disabled}>
                  {completed || disabled ? 'Completed' : 'Start Task'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{task.title}</DialogTitle>
                <DialogDescription>Complete this task to earn ₦{task.reward}</DialogDescription>
              </DialogHeader>
                {disabled ? (
                  <div className="text-center text-red-500 font-medium py-6">You have already performed this task.</div>
                ) : (
                  getTaskContent()
                )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                  <Button onClick={handleComplete} disabled={isLoading || completed || !!amountError || disabled}>
                  {isLoading ? "Submitting..." : "Submit & Complete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
        )}
      </Card>
    </>
  )
}
