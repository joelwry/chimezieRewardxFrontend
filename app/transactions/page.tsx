"use client"

import { useState, useEffect } from "react"
import { ArrowUp, ArrowDown, Clock, Wallet, Coins, Gift, Lock, Unlock, TrendingUp, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

export default function TransactionsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("date")

  // Get token from cookies
  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null
    return null
  }

  useEffect(() => {
    async function fetchTransactions() {
      setIsLoading(true)
      setError(null)
      const token = getCookie("access_token")
      if (!token) {
        router.push("/login")
        return
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/transactions/`, {
          credentials: "include",
          headers: { "Authorization": `Bearer ${token}` },
        })
        if (res.status === 401) {
          router.push("/login")
          return
        }
        if (!res.ok) throw new Error("Failed to fetch transactions")
        const data = await res.json()
        setTransactions(Array.isArray(data) ? data : [])
      } catch (err: any) {
        setError(err.message || "An error occurred while loading transactions.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchTransactions()
  }, [router])

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "earning":
        return <ArrowUp className="w-4 h-4 text-green-500" />
      case "funding":
        return <ArrowDown className="w-4 h-4 text-blue-500" />
      case "withdrawal":
        return <ArrowDown className="w-4 h-4 text-red-500" />
      case "lock":
        return <Lock className="w-4 h-4 text-yellow-500" />
      case "unlock":
        return <Unlock className="w-4 h-4 text-green-500" />
      case "invest":
        return <TrendingUp className="w-4 h-4 text-purple-500" />
      case "return":
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case "reward_claim":
        return <Gift className="w-4 h-4 text-orange-500" />
      default:
        return <Wallet className="w-4 h-4 text-gray-500" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "earning":
      case "funding":
      case "unlock":
      case "return":
      case "reward_claim":
        return "text-green-500"
      case "withdrawal":
      case "lock":
        return "text-red-500"
      case "invest":
        return "text-purple-500"
      default:
        return "text-gray-500"
    }
  }

  const getTransactionBgColor = (type: string) => {
    switch (type) {
      case "earning":
        return "bg-green-500/10"
      case "funding":
        return "bg-blue-500/10"
      case "withdrawal":
        return "bg-red-500/10"
      case "lock":
        return "bg-yellow-500/10"
      case "unlock":
        return "bg-green-500/10"
      case "invest":
        return "bg-purple-500/10"
      case "return":
        return "bg-green-500/10"
      case "reward_claim":
        return "bg-orange-500/10"
      default:
        return "bg-gray-500/10"
    }
  }

  const formatAmount = (amount: number, type: string) => {
    const isPositive = ["earning", "funding", "unlock", "return", "reward_claim"].includes(type)
    return `${isPositive ? "+" : "-"}₦${Number(amount).toLocaleString()}`
  }

  const filteredTransactions = transactions
    .filter((tx) => {
      if (filter !== "all" && tx.type !== filter) return false
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          tx.type.toLowerCase().includes(searchLower) ||
          tx.reference.toLowerCase().includes(searchLower) ||
          tx.amount.toString().includes(searchLower)
        )
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      if (sortBy === "amount") {
        return Number(b.amount) - Number(a.amount)
      }
      if (sortBy === "type") {
        return a.type.localeCompare(b.type)
      }
      return 0
    })

  const exportTransactions = () => {
    const csvContent = [
      ["Date", "Type", "Amount", "Reference"],
      ...filteredTransactions.map((tx) => [
        new Date(tx.created_at).toLocaleDateString(),
        tx.type,
        tx.amount,
        tx.reference,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return <div className="p-8 text-center">Loading transactions...</div>
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
          <p className="text-muted-foreground">View and manage your transaction history</p>
        </div>
       
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Transactions</p>
                <p className="text-2xl font-bold">{transactions.length}</p>
              </div>
              <Wallet className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">
                  ₦{transactions
                    .filter((t) => ["earning", "funding", "unlock", "return", "reward_claim"].includes(t.type))
                    .reduce((sum, t) => sum + Number(t.amount), 0)
                    .toLocaleString()}
                </p>
              </div>
              <ArrowUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">This Month</p>
                <p className="text-2xl font-bold">
                  {transactions.filter((t) => {
                    const txDate = new Date(t.created_at)
                    const now = new Date()
                    return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter and search your transactions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="earning">Earnings</SelectItem>
                <SelectItem value="funding">Funding</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
                <SelectItem value="lock">Locks</SelectItem>
                <SelectItem value="unlock">Unlocks</SelectItem>
                <SelectItem value="invest">Investments</SelectItem>
                <SelectItem value="return">Returns</SelectItem>
                <SelectItem value="reward_claim">Reward Claims</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date (Newest)</SelectItem>
                <SelectItem value="amount">Amount (High to Low)</SelectItem>
                <SelectItem value="type">Type (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Wallet className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No transactions found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm || filter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "You haven't made any transactions yet."}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-auto">
              <div className="flex items-center p-4 border-b bg-muted/50">
                <div className="w-12 font-medium">Type</div>
                <div className="flex-1 font-medium">Description</div>
                <div className="w-24 text-right font-medium">Amount</div>
                <div className="w-32 text-right font-medium hidden sm:block">Date</div>
              </div>
              <div className="divide-y">
                {filteredTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center p-4 hover:bg-muted/30 transition-colors">
                    <div className="w-12">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getTransactionBgColor(tx.type)}`}>
                        {getTransactionIcon(tx.type)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{tx.type.replace("_", " ")}</span>
                        <Badge variant="secondary" className="text-xs">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{tx.reference}</div>
                      <div className="text-xs text-muted-foreground sm:hidden">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`w-24 text-right font-medium ${getTransactionColor(tx.type)}`}>
                      {formatAmount(tx.amount, tx.type)}
                    </div>
                    <div className="w-32 text-right text-sm text-muted-foreground hidden sm:block">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 