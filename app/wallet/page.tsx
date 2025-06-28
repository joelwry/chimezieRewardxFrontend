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
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { differenceInDays } from "date-fns"
import { useRouter } from "next/navigation"

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
        // Fetch user info for balance
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/`, {
          credentials: "include",
          headers: { "Authorization": `Bearer ${token}` },
        })
        if (userRes.status === 401) { router.push("/login"); return }
        if (!userRes.ok) throw new Error("Failed to fetch user info")
        const userData = await userRes.json()
        if (Array.isArray(userData) && userData.length > 0) setBalance(Number(userData[0].balance))

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

  const handleInvestment = () => {
    if (!selectedInvestment || !investmentAmount) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      const amountNum = Number(investmentAmount)
      setBalance((prev) => prev - amountNum)
      setShowInvestmentDialog(false)
      setSelectedInvestment(null)
      setInvestmentAmount("")

      toast({
        title: "Investment successful",
        description: `You've invested ₦${amountNum.toLocaleString()} in the ${selectedInvestment} plan.`,
      })
    }, 2000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Address copied to clipboard",
    })
  }

  const investmentOptions = [
    { id: "basic", name: "Basic", minAmount: 5000, maxAmount: 20000, roi: "5% on top of ₦150,000" },
    { id: "standard", name: "Standard", minAmount: 50000, maxAmount: 200000, roi: "10% on top of ₦150,000" },
    { id: "premium", name: "Premium", minAmount: 200000, maxAmount: 500000, roi: "15% on top of ₦150,000" },
  ]

  const handleTransferReward = async () => {
    if (reward <= 0) return
    setIsTransferring(true)
    // Get token from cookies
    const getCookie = (name: string) => {
      if (typeof document === "undefined") return null
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(";").shift() || null
      return null
    }
    const token = getCookie("access_token")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/rewards/transfer/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include",
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: "Transfer failed", description: data.error || "Could not transfer reward.", variant: "destructive" })
        setIsTransferring(false)
        return
      }
      setReward(0)
      setBalance(data.new_balance)
      toast({ title: "Reward transferred!", description: `₦${data.amount} has been added to your wallet.` })
    } catch (err) {
      toast({ title: "Network error", description: "Could not connect to server.", variant: "destructive" })
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Fund Wallet
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Fund Your Wallet</DialogTitle>
                <DialogDescription>Deposit USDT (TRC20) to fund your wallet. Enter the amount in Naira you want to deposit.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="naira-amount">Amount (₦)</Label>
                  <Input
                    id="naira-amount"
                    type="number"
                    placeholder="5000"
                    value={nairaAmount}
                    onChange={e => setNairaAmount(e.target.value)}
                  />
                </div>
                {usdtRate && nairaAmount && (
                  <div className="space-y-2">
                    <div className="text-sm">USDT/NGN Rate: <span className="font-bold">₦{usdtRate}</span></div>
                    <div className="text-sm">You will send: <span className="font-bold">{usdtEquivalent} USDT</span></div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="tron-address">Deposit Address (USDT - TRC20)</Label>
                  <div className="flex">
                    <Input
                      id="tron-address"
                      value={TRON_USDT_ADDRESS}
                      readOnly
                      className="rounded-r-none"
                    />
                    <Button
                      variant="outline"
                      className="rounded-l-none"
                      onClick={() => copyToClipboard(TRON_USDT_ADDRESS)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Send <span className="font-bold">{usdtEquivalent || "..."} USDT</span> to this address and enter the transaction hash below.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tx-hash">Transaction Hash</Label>
                  <Input id="tx-hash" placeholder="Paste transaction hash here..." value={txHash} onChange={e => setTxHash(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setTxHash(""); setNairaAmount(""); setUsdtEquivalent(""); setIsDialogOpen(false); }}>
                  Cancel
                </Button>
                <Button onClick={handleFundWallet} disabled={isLoading || !txHash || !nairaAmount || !usdtEquivalent}>
                  {isLoading ? "Processing..." : "Submit"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showInvestmentDialog} onOpenChange={setShowInvestmentDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <DollarSign className="w-4 h-4 mr-2" /> Invest
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Investment Options</DialogTitle>
                <DialogDescription>Choose an investment plan to grow your funds</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-4">
                  {investmentOptions.map((option) => (
                    <div
                      key={option.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedInvestment === option.id ? "border-primary bg-primary/10" : ""
                      }`}
                      onClick={() => setSelectedInvestment(option.id)}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{option.name} Plan</h3>
                        <Badge variant="outline">{option.roi}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Min: ₦{option.minAmount.toLocaleString()} - Max: ₦{option.maxAmount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {selectedInvestment && (
                  <div className="space-y-2">
                    <Label htmlFor="investment-amount">Investment Amount (₦)</Label>
                    <Input
                      id="investment-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowInvestmentDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInvestment} disabled={isLoading || !selectedInvestment || !investmentAmount}>
                  {isLoading ? "Processing..." : "Invest"}
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
              <div className="text-xs text-muted-foreground">From completed tasks</div>
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
              <div className="text-4xl font-bold">₦{balance.toLocaleString()}</div>
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
            <Button className="w-full justify-start" variant="outline">
              <DollarSign className="w-4 h-4 mr-2" /> Withdraw Funds
            </Button>
            <Button className="w-full justify-start" variant="outline">
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
                <Button>Withdraw Funds</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => router.push('/wallet/history')}>View Full Transaction History</Button>
        </CardFooter>
      </Card>

      {/* Daily Growth Card */}
      <Card className="bg-background/60 backdrop-blur-sm border border-border/50">
        <CardHeader>
          <CardTitle>Daily Growth</CardTitle>
          <CardDescription>Your deposit grows by 1% daily</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Deposit Amount</div>
              <div className="text-xl font-bold">₦{depositAmount.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Days Since Deposit</div>
              <div className="text-xl font-bold">{daysSinceDeposit} days</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Growth Rate</div>
              <div className="text-xl font-bold">1% / day</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Grown Balance</div>
              <div className="text-xl font-bold text-green-600">₦{grownBalance.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
            </div>
          </div>
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
          <Button onClick={handleTransferReward} disabled={reward <= 0 || isTransferring} variant="default">
            {isTransferring ? "Transferring..." : "Transfer to Wallet"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
