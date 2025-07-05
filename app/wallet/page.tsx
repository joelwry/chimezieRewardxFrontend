"use client"

import { useState, useEffect } from "react"
import { ArrowDown, ArrowUp, Clock, Coins, Copy, DollarSign, Download, Plus, Wallet, Gift } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { differenceInDays } from "date-fns"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const TRON_USDT_ADDRESS = process.env.NEXT_PUBLIC_TRON_USDT_ADDRESS || "";
const COINGECKO_API_URL = process.env.NEXT_PUBLIC_COINGECKO_API_URL || "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=ngn";

// Cache for USDT rate
let usdtRateCache = {
  rate: null as number | null,
  timestamp: 0,
  expiresIn: 5 * 60 * 1000, // 5 minutes in milliseconds
};

export default function WalletPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [balance, setBalance] = useState(0)
  const [payments, setPayments] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState("")
  const [amount, setAmount] = useState("")
  const [showInvestmentDialog, setShowInvestmentDialog] = useState(false)
  const [selectedInvestment, setSelectedInvestment] = useState<string | null>(null)
  const [investmentAmount, setInvestmentAmount] = useState("")
  const [nairaAmount, setNairaAmount] = useState("")
  const [usdtRate, setUsdtRate] = useState<number | null>(null)
  const [usdtEquivalent, setUsdtEquivalent] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [reward, setReward] = useState(0)
  const [isTransferring, setIsTransferring] = useState(false)
  const [showTransferConfirm, setShowTransferConfirm] = useState(false)
  const [growthPlans, setGrowthPlans] = useState<any[]>([])
  const [activeGrowths, setActiveGrowths] = useState<any[]>([])
  const [claimedGrowths, setClaimedGrowths] = useState<any[]>([])
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null)
  const [growthAmount, setGrowthAmount] = useState("")
  const [isInvesting, setIsInvesting] = useState(false)
  const [isClaiming, setIsClaiming] = useState<string | null>(null)
  const [growthTab, setGrowthTab] = useState<'active'|'claimed'>('active')
  const [showClaimConfirm, setShowClaimConfirm] = useState(false)
  const [growthToClaim, setGrowthToClaim] = useState<any | null>(null)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [bankName, setBankName] = useState("")
  const [accountName, setAccountName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  // Fetch USDT/NGN rate with caching
  const fetchUsdtRate = async () => {
    const now = Date.now();
    
    // Check if cache is still valid
    if (usdtRateCache.rate && (now - usdtRateCache.timestamp) < usdtRateCache.expiresIn) {
      setUsdtRate(usdtRateCache.rate);
      return usdtRateCache.rate;
    }

    try {
      const res = await fetch(COINGECKO_API_URL);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      const rate = data.tether.ngn;
      
      // Update cache
      usdtRateCache = {
        rate,
        timestamp: now,
        expiresIn: 5 * 60 * 1000, // 5 minutes
      };
      
      setUsdtRate(rate);
      return rate;
    } catch (error) {
      console.error("Failed to fetch USDT rate:", error);
      // Use cached rate if available, otherwise use a fallback
      if (usdtRateCache.rate) {
        setUsdtRate(usdtRateCache.rate);
        return usdtRateCache.rate;
      }
      // Fallback rate (you can update this as needed)
      const fallbackRate = 1550.21;
      setUsdtRate(fallbackRate);
      return fallbackRate;
    }
  };

  // Calculate USDT equivalent when naira amount changes
  useEffect(() => {
    if (!nairaAmount) {
      setUsdtEquivalent("");
      return;
    }

    const calculateUsdtEquivalent = async () => {
      const rate = await fetchUsdtRate();
      if (rate) {
        const usdt = (parseFloat(nairaAmount) / rate).toFixed(2);
        setUsdtEquivalent(usdt);
      }
    };

    calculateUsdtEquivalent();
  }, [nairaAmount]);

  // Fetch wallet data on component mount
  useEffect(() => {
    async function fetchWalletData() {
      setIsLoading(true)
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
        // Fetch user balance using dedicated endpoint
        const balanceRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user-balance/`, {
          credentials: "include",
          headers: { "Authorization": `Bearer ${token}` },
        })
        if (balanceRes.status === 401) { router.push("/login"); return }
        if (!balanceRes.ok) throw new Error("Failed to fetch user balance")
        const balanceData = await balanceRes.json()
        setBalance(Number(balanceData.balance))

        // Fetch payments
        const paymentsRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/`, {
          credentials: "include",
          headers: { "Authorization": `Bearer ${token}` },
        })
        if (paymentsRes.status === 401) { router.push("/login"); return }
        if (!paymentsRes.ok) throw new Error("Failed to fetch payments")
        const paymentsData = await paymentsRes.json()
        setPayments(Array.isArray(paymentsData) ? paymentsData : [])

        // Fetch transactions
        const txRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/transactions/`, {
          credentials: "include",
          headers: { "Authorization": `Bearer ${token}` },
        })
        if (txRes.status === 401) { router.push("/login"); return }
        if (!txRes.ok) throw new Error("Failed to fetch transactions")
        const txData = await txRes.json()
        setTransactions(Array.isArray(txData) ? txData : [])

        // Fetch claimable reward
        const rewardRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/rewards/`, {
          credentials: "include",
          headers: { "Authorization": `Bearer ${token}` },
        })
        if (rewardRes.status === 401) { router.push("/login"); return }
        if (rewardRes.ok) {
          const rewardData = await rewardRes.json()
          if (Array.isArray(rewardData) && rewardData.length > 0) setReward(Number(rewardData[0].total_reward))
        }
      } catch (err: any) {
        setError(err.message || "An error occurred while loading wallet data.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchWalletData()
  }, [router])

  // Find latest confirmed deposit
  const latestDeposit = Array.isArray(payments)
    ? payments.filter((p: any) => p.status === "confirmed").sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    : undefined
  const depositAmount = latestDeposit ? Number(latestDeposit.amount) : 0
  const depositDate = latestDeposit ? new Date(latestDeposit.created_at) : new Date()
  const today = new Date()
  const daysSinceDeposit = differenceInDays(today, depositDate)
  const growthRate = 0.01 // 1% per day
  const grownBalance = depositAmount * Math.pow(1 + growthRate, daysSinceDeposit)

  // Dynamic summary cards
  const earned = Array.isArray(transactions)
    ? transactions.filter((t: any) => t.type === "earning").reduce((sum, t) => sum + Number(t.amount), 0)
    : 0;
  const deposited = Array.isArray(payments)
    ? payments.filter((p: any) => p.status === "confirmed").reduce((sum, p) => sum + Number(p.amount), 0)
    : 0;
  const invested = 0;

  const handleFundWallet = async () => {
    if (!txHash || !nairaAmount) return

    setIsLoading(true)
    
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/verify-deposit/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          tx_hash: txHash,
          naira_amount: nairaAmount,
        }),
      })

      if (res.status === 401) {
        router.push("/login")
        return
      }

      const data = await res.json()

      if (!res.ok) {
        toast({
          title: "Verification failed",
          description: data.error || "Failed to verify deposit",
          variant: "destructive",
        })
        return
      }

      // Update local balance
      setBalance(data.new_balance)
      
      // Clear form
      setTxHash("")
      setNairaAmount("")
      setUsdtEquivalent("")
      setIsDialogOpen(false)

      toast({
        title: "Wallet funded successfully",
        description: `₦${Number(nairaAmount).toLocaleString()} has been added to your wallet.`,
      })

      // Refresh wallet data
      window.location.reload()

    } catch (err) {
      toast({
        title: "Network error",
        description: "Could not connect to server.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch daily growth plans
  useEffect(() => {
    async function fetchGrowthPlans() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/daily-growth-rates/`, { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          setGrowthPlans(data)
        }
      } catch {}
    }
    fetchGrowthPlans()
  }, [])

  // Fetch daily growths
  const fetchGrowths = async () => {
    try {
      const getCookie = (name: string) => {
        if (typeof document === "undefined") return null
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop()?.split(";").shift() || null
        return null
      }
      const token = getCookie("access_token")
      if (!token) return
      const activeRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/daily-growths/?status=active`, {
        credentials: "include",
        headers: { "Authorization": `Bearer ${token}` },
      })
      if (activeRes.ok) setActiveGrowths(await activeRes.json())
      const claimedRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/daily-growths/?status=claimed`, {
        credentials: "include",
        headers: { "Authorization": `Bearer ${token}` },
      })
      if (claimedRes.ok) setClaimedGrowths(await claimedRes.json())
    } catch {}
  }
  useEffect(() => { fetchGrowths() }, [])

  // --- Invest in Daily Growth ---
  const handleInvestGrowth = async () => {
    if (!selectedPlan || !growthAmount) return
    setIsInvesting(true)
    const getCookie = (name: string) => {
      if (typeof document === "undefined") return null
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(";").shift() || null
      return null
    }
    const token = getCookie("access_token")
    if (!token) { router.push("/login"); return }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/daily-growths/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ plan_id: selectedPlan.id, amount: growthAmount, rate: selectedPlan.rate})
      })
      const data = await res.json()
      
      if (!res.ok) {
        console.log(data)
        let errorMsg = "Could not invest.";
        if (data.detail) errorMsg = data.detail;
        else if (typeof data === "object") errorMsg = String(Object.values(data)[0]);
        toast({ title: "Investment failed", description: errorMsg, variant: "destructive" });
        setIsInvesting(false);
        return;
      }

      setShowInvestmentDialog(false)
      setSelectedPlan(null)
      setGrowthAmount("")
      toast({ title: "Investment successful", description: `You've invested ₦${Number(growthAmount).toLocaleString()} in the ${selectedPlan.name} plan.` })
      fetchGrowths()
      setBalance((prev) => prev - Number(growthAmount))
    } catch {
      toast({ title: "Network error", description: "Could not connect to server.", variant: "destructive" })
    } finally {
      setIsInvesting(false)
    }
  }

  // --- Claim Daily Growth ---
  const handleClaimGrowth = async (growth: any) => {
    // Check if 1 month has passed since investment
    const investmentDate = new Date(growth.activated_date)
    const currentDate = new Date()
    const daysSinceInvestment = Math.floor((currentDate.getTime() - investmentDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSinceInvestment < 30) {
      toast({ 
        title: "Cannot claim yet", 
        description: `You can only claim after 30 days from investment. You have ${30 - daysSinceInvestment} days remaining.`, 
        variant: "destructive" 
      })
      return
    }
    
    // Show confirmation modal
    setGrowthToClaim(growth)
    setShowClaimConfirm(true)
  }

  const confirmClaimGrowth = async () => {
    if (!growthToClaim) return
    
    setIsClaiming(growthToClaim.id)
    const getCookie = (name: string) => {
      if (typeof document === "undefined") return null
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(";").shift() || null
      return null
    }
    const token = getCookie("access_token")
    if (!token) { router.push("/login"); return }
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/daily-growths/${growthToClaim.id}/claim/`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        credentials: "include",
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: "Claim failed", description: data.detail || "Could not claim growth.", variant: "destructive" })
        setIsClaiming(null)
        return
      }
      toast({ title: "Growth claimed!", description: `₦${data.amount.toLocaleString()} has been added to your wallet.` })
      setBalance(data.new_balance)
      fetchGrowths()
      setShowClaimConfirm(false)
      setGrowthToClaim(null)
    } catch {
      toast({ title: "Network error", description: "Could not connect to server.", variant: "destructive" })
    } finally {
      setIsClaiming(null)
    }
  }

  // --- Withdraw Funds ---
  const handleWithdraw = async () => {
    if (!withdrawAmount || !bankName || !accountName || !accountNumber) {
      toast({ title: "Missing information", description: "Please fill in all fields.", variant: "destructive" })
      return
    }

    const amount = Number(withdrawAmount)
    if (amount <= 0) {
      toast({ title: "Invalid amount", description: "Amount must be greater than 0.", variant: "destructive" })
      return
    }

    if (amount > balance) {
      toast({ title: "Insufficient balance", description: "Amount exceeds your wallet balance.", variant: "destructive" })
      return
    }

    setIsWithdrawing(true)
    const getCookie = (name: string) => {
      if (typeof document === "undefined") return null
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(";").shift() || null
      return null
    }
    const token = getCookie("access_token")
    if (!token) { router.push("/login"); return }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/withdrawals/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          amount: amount,
          bank_name: bankName,
          account_name: accountName,
          account_number: accountNumber
        })
      })
      const data = await res.json()
      console.log('Withdrawal response:', data)
      
      if (!res.ok) {
        console.log('Withdrawal failed:', data)
        toast({ title: "Withdrawal failed", description: data.detail || "Could not process withdrawal.", variant: "destructive" })
        setIsWithdrawing(false)
        return
      }

      console.log('Withdrawal successful, new balance:', data.new_balance)
      toast({ title: "Withdrawal submitted!", description: "Your withdrawal request has been submitted and is being processed." })
      setBalance(data.new_balance || (balance - amount))
      setShowWithdrawModal(false)
      setWithdrawAmount("")
      setBankName("")
      setAccountName("")
      setAccountNumber("")
    } catch {
      toast({ title: "Network error", description: "Could not connect to server.", variant: "destructive" })
    } finally {
      setIsWithdrawing(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Address copied to clipboard",
    })
  }

  const handleTransferReward = async () => {
    if (reward <= 0) return
    setIsTransferring(true)
    setShowTransferConfirm(false)
    
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/transfer-rewards/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include",
      })
      
      if (res.status === 401) {
        router.push("/login")
        return
      }
      
      const data = await res.json()
      if (!res.ok) {
        toast({ 
          title: "Transfer failed", 
          description: data.error || "Could not transfer reward.", 
          variant: "destructive" 
        })
        setIsTransferring(false)
        return
      }
      
      setReward(0)
      setBalance(data.new_balance)
      toast({ 
        title: "Reward transferred!", 
        description: `₦${data.amount.toLocaleString()} has been added to your wallet.` 
      })
    } catch (err) {
      toast({ 
        title: "Network error", 
        description: "Could not connect to server.", 
        variant: "destructive" 
      })
    } finally {
      setIsTransferring(false)
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center">Loading wallet...</div>
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground">Manage your funds and transactions</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => router.push('/wallet/fund')}>
            <Plus className="w-4 h-4 mr-2" /> Fund Wallet
          </Button>

          <Dialog open={showInvestmentDialog} onOpenChange={setShowInvestmentDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <DollarSign className="w-4 h-4 mr-2" /> Invest
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Investment Options</DialogTitle>
                <DialogDescription>Choose a daily growth plan to grow your funds</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-4">
                  {growthPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedPlan && selectedPlan.id === plan.id ? "border-primary bg-primary/10" : ""}`}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{plan.name} Plan</h3>
                        <Badge variant="outline">{plan.rate}% / day</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Min: ₦{Number(plan.min_amount).toLocaleString()} - Max: ₦{Number(plan.max_amount).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                {selectedPlan && (
                  <div className="space-y-2">
                    <Label htmlFor="growth-amount">Investment Amount (₦)</Label>
                    <Input
                      id="growth-amount"
                      type="number"
                      placeholder={`Enter amount (₦${Number(selectedPlan.min_amount).toLocaleString()} - ₦${Number(selectedPlan.max_amount).toLocaleString()})`}
                      value={growthAmount}
                      onChange={e => setGrowthAmount(e.target.value)}
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setShowInvestmentDialog(false); setSelectedPlan(null); setGrowthAmount(""); }}>
                  Cancel
                </Button>
                <Button onClick={handleInvestGrowth} disabled={isInvesting || !selectedPlan || !growthAmount}>
                  {isInvesting ? "Processing..." : "Invest"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-4 bg-background/60 backdrop-blur-sm border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Earned</div>
              <div className="text-2xl font-bold">₦{earned.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">From instant tasks rewards</div>
            </div>
            <ArrowUp className="w-6 h-6 text-green-500" />
          </div>
        </Card>
        <Card className="p-4 bg-background/60 backdrop-blur-sm border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Deposited</div>
              <div className="text-2xl font-bold">₦{deposited.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">From wallet funding</div>
            </div>
            <ArrowDown className="w-6 h-6 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4 bg-background/60 backdrop-blur-sm border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Invested</div>
              <div className="text-2xl font-bold">₦{invested.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">In investment plans</div>
            </div>
            <Clock className="w-6 h-6 text-yellow-500" />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 bg-background/60 backdrop-blur-sm border border-border/50">
          <CardHeader>
            <CardTitle>Balance Overview</CardTitle>
            <CardDescription>Your current balance and stats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center p-6 space-y-2 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl">
              <Coins className="w-12 h-12 text-primary" />
              <div className="text-4xl font-bold">₦{(balance || 0).toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Balance</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/60 backdrop-blur-sm border border-border/50">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your wallet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" variant="outline" onClick={() => setShowWithdrawModal(true)}>
              <DollarSign className="w-4 h-4 mr-2" /> Withdraw Funds
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => setShowInvestmentDialog(true)}>
              <Clock className="w-4 h-4 mr-2" /> Invest Funds
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-background/60 backdrop-blur-sm border border-border/50">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent wallet activity</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4 flex flex-wrap">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
              <TabsTrigger value="deposits">Deposits</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="m-0">
              <div className="rounded-lg border overflow-auto">
                <div className="flex items-center p-4 border-b">
                  <div className="w-12 font-medium">Type</div>
                  <div className="flex-1 font-medium">Description</div>
                  <div className="w-24 text-right font-medium">Amount</div>
                  <div className="w-32 text-right font-medium hidden sm:block">Date</div>
                </div>
                <div className="divide-y">
                  {transactions.slice(0, 5).map((tx: any) => (
                    <div key={tx.id} className="flex items-center p-4">
                    <div className="w-12">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10">
                        <ArrowUp className="w-4 h-4 text-green-500" />
                      </div>
                    </div>
                    <div className="flex-1">
                        <div className="font-medium">{tx.type}</div>
                        <div className="text-sm text-muted-foreground">{tx.reference}</div>
                        <div className="text-xs text-muted-foreground sm:hidden">{new Date(tx.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="w-24 text-right font-medium text-green-500">+₦{Number(tx.amount).toLocaleString()}</div>
                      <div className="w-32 text-right text-sm text-muted-foreground hidden sm:block">{new Date(tx.created_at).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="earnings" className="m-0">
              <div className="rounded-lg border overflow-auto">
                <div className="flex items-center p-4 border-b">
                  <div className="w-12 font-medium">Type</div>
                  <div className="flex-1 font-medium">Description</div>
                  <div className="w-24 text-right font-medium">Amount</div>
                  <div className="w-32 text-right font-medium hidden sm:block">Date</div>
                </div>
                <div className="divide-y">
                  {transactions.filter((t: any) => t.type === "earning").slice(0, 5).map((tx: any) => (
                    <div key={tx.id} className="flex items-center p-4">
                    <div className="w-12">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10">
                        <ArrowUp className="w-4 h-4 text-green-500" />
                      </div>
                    </div>
                    <div className="flex-1">
                        <div className="font-medium">{tx.type}</div>
                        <div className="text-sm text-muted-foreground">{tx.reference}</div>
                        <div className="text-xs text-muted-foreground sm:hidden">{new Date(tx.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="w-24 text-right font-medium text-green-500">+₦{Number(tx.amount).toLocaleString()}</div>
                      <div className="w-32 text-right text-sm text-muted-foreground hidden sm:block">{new Date(tx.created_at).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="deposits" className="m-0">
              <div className="rounded-lg border overflow-auto">
                <div className="flex items-center p-4 border-b">
                  <div className="w-12 font-medium">Type</div>
                  <div className="flex-1 font-medium">Description</div>
                  <div className="w-24 text-right font-medium">Amount</div>
                  <div className="w-32 text-right font-medium hidden sm:block">Date</div>
                </div>
                <div className="divide-y">
                  {transactions.filter((t: any) => t.type === "funding").slice(0, 5).map((tx: any) => (
                    <div key={tx.id} className="flex items-center p-4">
                    <div className="w-12">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10">
                        <ArrowDown className="w-4 h-4 text-blue-500" />
                      </div>
                    </div>
                    <div className="flex-1">
                        <div className="font-medium">{tx.type}</div>
                        <div className="text-sm text-muted-foreground">{tx.reference}</div>
                        <div className="text-xs text-muted-foreground sm:hidden">{new Date(tx.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="w-24 text-right font-medium text-blue-500">+₦{Number(tx.amount).toLocaleString()}</div>
                      <div className="w-32 text-right text-sm text-muted-foreground hidden sm:block">{new Date(tx.created_at).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="withdrawals" className="m-0">
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Wallet className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No withdrawals yet</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  You haven't made any withdrawals from your wallet.
                </p>
                <Button onClick={() => setShowWithdrawModal(true)}>Withdraw Funds</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => router.push('/transactions')}>View Full Transaction History</Button>
        </CardFooter>
      </Card>

      {/* Daily Growth Card (Backend-driven) */}
      <Card className="bg-background/60 backdrop-blur-sm border border-border/50">
        <CardHeader>
          <CardTitle>Daily Growth</CardTitle>
          <CardDescription>Invest and grow your funds daily. Claim anytime.</CardDescription>
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant={growthTab === 'active' ? 'default' : 'outline'} onClick={() => setGrowthTab('active')}>Active</Button>
            <Button size="sm" variant={growthTab === 'claimed' ? 'default' : 'outline'} onClick={() => setGrowthTab('claimed')}>Claimed</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {(growthTab === 'active' ? activeGrowths : claimedGrowths).length === 0 && (
            <div className="text-center text-muted-foreground py-8">No {growthTab === 'active' ? 'active' : 'claimed'} daily growths yet.</div>
          )}
          {(growthTab === 'active' ? activeGrowths : claimedGrowths).map((growth: any) => {
            const days = Math.max(0, Math.floor((new Date(growth.claimed_date || new Date()).getTime() - new Date(growth.activated_date).getTime()) / (1000 * 60 * 60 * 24)))
            return (
              <div key={growth.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b py-4 last:border-b-0">
                <div>
                  <div className="text-sm text-muted-foreground">Plan</div>
                  <div className="font-bold">{growth.plan?.name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Amount</div>
                  <div className="font-bold">₦{Number(growth.amount).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Rate</div>
                  <div className="font-bold">{growth.rate}% / day</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Days</div>
                  <div className="font-bold">{days}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Grown Balance</div>
                  <div className="font-bold text-green-600">₦{Number(growth.grown_amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                </div>
                {growthTab === 'active' && (
                  <Button size="sm" onClick={() => handleClaimGrowth(growth)} disabled={isClaiming === growth.id}>
                    {isClaiming === growth.id ? 'Claiming...' : 'Claim'}
                  </Button>
                )}
                {growthTab === 'claimed' && (
                  <div className="text-xs text-muted-foreground">Claimed on {growth.claimed_date ? new Date(growth.claimed_date).toLocaleDateString() : ''}</div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Claimable Reward Card */}
      <Card className="p-4 bg-background/60 backdrop-blur-sm border border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Claimable Reward</div>
            <div className="text-2xl font-bold text-green-600 flex items-center gap-2"><Gift className="w-6 h-6" />₦{reward.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total reward earned from tasks</div>
          </div>
          <AlertDialog open={showTransferConfirm} onOpenChange={setShowTransferConfirm}>
            <AlertDialogTrigger asChild>
              <Button 
                onClick={() => setShowTransferConfirm(true)} 
                disabled={reward <= 0 || isTransferring} 
                variant="default"
              >
                {isTransferring ? "Transferring..." : "Transfer to Wallet"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Reward Transfer</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to transfer ₦{reward.toLocaleString()} from your claimable rewards to your main wallet balance? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleTransferReward}>
                  Transfer Reward
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Card>

      {/* Claim Confirmation Modal */}
      <AlertDialog open={showClaimConfirm} onOpenChange={setShowClaimConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Growth Claim</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to claim ₦{growthToClaim ? Number(growthToClaim.grown_amount).toLocaleString(undefined, { maximumFractionDigits: 2 }) : 0} from your daily growth investment? This will add the amount to your wallet balance and mark the investment as claimed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setShowClaimConfirm(false); setGrowthToClaim(null); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClaimGrowth}>
              Claim Growth
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Withdrawal Modal */}
      <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>Enter your bank details and the amount you want to withdraw. Your withdrawal will be processed manually by our admin team.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="withdraw-amount">Amount (₦)</Label>
              <Input
                id="withdraw-amount"
                type="number"
                placeholder="Enter amount to withdraw"
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
                max={balance}
              />
              <p className="text-xs text-muted-foreground">Available balance: ₦{(balance || 0).toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-name">Bank Name</Label>
              <Input
                id="bank-name"
                placeholder="e.g., First Bank, GT Bank"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-name">Account Name</Label>
              <Input
                id="account-name"
                placeholder="Account holder name"
                value={accountName}
                onChange={e => setAccountName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-number">Account Number</Label>
              <Input
                id="account-number"
                placeholder="10-digit account number"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                maxLength={10}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { 
              setShowWithdrawModal(false); 
              setWithdrawAmount(""); 
              setBankName(""); 
              setAccountName(""); 
              setAccountNumber(""); 
            }}>
              Cancel
            </Button>
            <Button onClick={handleWithdraw} disabled={isWithdrawing || !withdrawAmount || !bankName || !accountName || !accountNumber}>
              {isWithdrawing ? "Processing..." : "Submit Withdrawal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
