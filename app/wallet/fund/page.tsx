"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const TRON_USDT_ADDRESS = process.env.NEXT_PUBLIC_TRON_USDT_ADDRESS || ""
const COINGECKO_API_URL =
  process.env.NEXT_PUBLIC_COINGECKO_API_URL ||
  "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=ngn"
const TRON_USDT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TRON_USDT_CONTRACT_ADDRESS || ""

let usdtRateCache = {
  rate: null as number | null,
  timestamp: 0,
  expiresIn: 5 * 60 * 1000,
}

export default function FundWalletPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [nairaAmount, setNairaAmount] = useState("")
  const [usdtRate, setUsdtRate] = useState<number | null>(null)
  const [usdtEquivalent, setUsdtEquivalent] = useState("")
  const [txHash, setTxHash] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [tronWebAvailable, setTronWebAvailable] = useState(false)
  const [inAppTxStatus, setInAppTxStatus] = useState<string | null>(null)

  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Triggered by Connect button
  const connectTronWallet = async () => {
    try {
      if (typeof window === "undefined" || !(window as any).tronLink) {
        toast({
          title: "TronLink not found",
          description: "Please install TronLink extension",
          variant: "destructive",
        });
        return;
      }

      await (window as any).tronLink.request({
        method: "tron_requestAccounts",
      });

      const tronWeb = (window as any).tronWeb;
      const address = tronWeb.defaultAddress.base58;

      setWalletConnected(true);
      setWalletAddress(address);

      toast({
        title: "Wallet Connected",
        description: `Connected as ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } catch (err) {
      toast({
        title: "Connection Failed",
        description: "User denied wallet access or no wallet available",
        variant: "destructive",
      });
    }
  };


  // Fetch USDT/NGN rate
  const fetchUsdtRate = async () => {
    const now = Date.now()
    if (
      usdtRateCache.rate &&
      now - usdtRateCache.timestamp < usdtRateCache.expiresIn
    ) {
      setUsdtRate(usdtRateCache.rate)
      return usdtRateCache.rate
    }
    try {
      const res = await fetch(COINGECKO_API_URL)
      if (!res.ok) throw new Error("Failed to fetch USDT rate")
      const data = await res.json()
      const rate = data.tether.ngn
      usdtRateCache = { rate, timestamp: now, expiresIn: 5 * 60 * 1000 }
      setUsdtRate(rate)
      return rate
    } catch {
      const fallbackRate = 1550
      setUsdtRate(fallbackRate)
      return fallbackRate
    }
  }

  useEffect(() => { fetchUsdtRate() }, [])

  useEffect(() => {
    if (!nairaAmount) {
      setUsdtEquivalent("")
      return
    }
    const calculate = async () => {
      const rate = await fetchUsdtRate()
      if (rate) {
        setUsdtEquivalent((parseFloat(nairaAmount) / rate).toFixed(2))
      }
    }
    calculate()
  }, [nairaAmount])

  // Detect TronLink
  // useEffect(() => {
  //   if (
  //     typeof window !== "undefined" &&
  //     (window as any).tronWeb &&
  //     (window as any).tronWeb.ready
  //   ) {
  //     setTronWebAvailable(true)
  //   } else {
  //     setTronWebAvailable(false)
  //   }
  // }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied", description: "Address copied to clipboard" })
  }

  // In-app Payment (TronLink popup)
  const handleInAppPayment = async () => {
    setInAppTxStatus(null)
    if (!tronWebAvailable) {
      toast({
        title: "TronLink not found",
        description: "Please install TronLink browser extension.",
        variant: "destructive",
      })
      return
    }
    if (!usdtEquivalent || !nairaAmount) {
      toast({
        title: "Amount Required",
        description: "Enter the Naira amount first.",
        variant: "destructive",
      })
      return
    }

    try {
      const tronWeb = (window as any).tronWeb
      const USDT_CONTRACT = "TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj"
      const contract = await tronWeb.contract().at(USDT_CONTRACT)
      const amountInSun = tronWeb.toBigNumber(parseFloat(usdtEquivalent) * 1e6)

      setInAppTxStatus("pending")
      const tx = await contract.transfer(TRON_USDT_ADDRESS, amountInSun).send()
      setTxHash(tx)
      setInAppTxStatus("success")
      toast({
        title: "Payment Sent",
        description: "Transaction submitted. Paste the hash in the Confirm tab.",
      })
    } catch (err: any) {
      setInAppTxStatus("error")
      toast({
        title: "Transaction Failed",
        description: err?.message || "Unable to send payment.",
        variant: "destructive",
      })
    }
  }

  // Submit txHash to backend
  const handleFundWallet = async () => {
    if (!txHash || !nairaAmount) return
    setIsLoading(true)

    const getCookie = (name: string) => {
      if (typeof document === "undefined") return null
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(";").shift() || null
      return null
    }

    const token = getCookie("access_token")
    if (!token) return router.push("/login")

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/verify-deposit/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tx_hash: txHash,
          naira_amount: nairaAmount,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({
          title: "Verification failed",
          description: data.error || "Could not verify deposit.",
          variant: "destructive",
        })
        return
      }
      toast({
        title: "Wallet Funded",
        description: `₦${Number(nairaAmount).toLocaleString()} added successfully.`,
      })
      setTxHash("")
      setNairaAmount("")
      setUsdtEquivalent("")
      router.push("/wallet")
    } catch {
      toast({
        title: "Error",
        description: "Could not connect to backend.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-2">Fund Your Wallet</h1>

      <Tabs defaultValue="fund" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="fund">Deposit</TabsTrigger>
          <TabsTrigger value="confirm">Confirm</TabsTrigger>
        </TabsList>

        <TabsContent value="fund">
          <div className="space-y-6">
            <div>
              <Label htmlFor="naira-amount">Amount in Naira (₦)</Label>
              <Input
                id="naira-amount"
                type="number"
                value={nairaAmount}
                onChange={(e) => setNairaAmount(e.target.value)}
                placeholder="5000"
              />
            </div>

            {usdtRate && usdtEquivalent && (
              <div className="text-sm">
                <p>USDT/NGN: <strong>₦{usdtRate}</strong></p>
                <p>You will send: <strong>{usdtEquivalent} USDT</strong></p>
              </div>
            )}

            <div>
              <Label htmlFor="deposit-address">Deposit Address (TRC20)</Label>
              <div className="flex">
                <Input value={TRON_USDT_ADDRESS} readOnly className="rounded-r-none" />
                <Button
                  onClick={() => copyToClipboard(TRON_USDT_ADDRESS)}
                  className="rounded-l-none"
                  variant="outline"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Send <strong>{usdtEquivalent || "USDT"}</strong> to the address above. Then paste the transaction hash in the Confirm tab.
              </p>
            </div>

            {tronWebAvailable ? (
              <Button
                className="w-full"
                disabled={!usdtEquivalent || !nairaAmount || inAppTxStatus === "pending"}
                onClick={handleInAppPayment}
              >
                {inAppTxStatus === "pending"
                  ? "Processing In-App Payment..."
                  : "Pay with Tron Wallet (In-App)"}
              </Button>
            ) : (
              <div className="text-xs text-muted-foreground text-center">
                TronLink not detected. You can also pay externally and confirm manually.
              </div>
            )}

{!walletConnected ? (
        <Button className="w-full" onClick={connectTronWallet}>
          Connect Tron Wallet
        </Button>
      ) : (
        <Button
          className="w-full"
          onClick={handleInAppPayment}
          disabled={!usdtEquivalent || !nairaAmount || inAppTxStatus === "pending"}
        >
          {inAppTxStatus === "pending"
            ? "Processing In-App Payment..."
            : "Pay with Tron Wallet (In-App)"}
        </Button>
      )}

            <Button
              className="w-full"
              variant="secondary"
              onClick={() =>
                toast({
                  title: "External Payment",
                  description: "Use your Tron wallet app to transfer and confirm manually below.",
                })
              }
            >
              Use External Wallet
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="confirm">
          <div className="space-y-4">
            <Label htmlFor="tx-hash">Transaction Hash</Label>
            <Input
              id="tx-hash"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="Enter tx hash here..."
            />
            <Button
              className="w-full"
              onClick={handleFundWallet}
              disabled={isLoading || !txHash || !nairaAmount}
            >
              {isLoading ? "Verifying..." : "Submit for Verification"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <Button
        variant="outline"
        className="mt-8"
        onClick={() => router.push("/wallet")}
      >
        Back to Wallet
      </Button>
    </div>
  )
}
