"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const TRON_USDT_ADDRESS = process.env.NEXT_PUBLIC_TRON_USDT_ADDRESS || "";
const COINGECKO_API_URL = process.env.NEXT_PUBLIC_COINGECKO_API_URL || "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=ngn";
const TRON_NODE_URL = process.env.NEXT_PUBLIC_TRON_NODE_URL || "";

let usdtRateCache = {
  rate: null as number | null,
  timestamp: 0,
  expiresIn: 5 * 60 * 1000,
};

export default function FundWalletPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [nairaAmount, setNairaAmount] = useState("");
  const [usdtRate, setUsdtRate] = useState<number | null>(null);
  const [usdtEquivalent, setUsdtEquivalent] = useState("");
  const [txHash, setTxHash] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tronWebAvailable, setTronWebAvailable] = useState(false);
  const [inAppTxStatus, setInAppTxStatus] = useState<string | null>(null);

  // Fetch USDT/NGN rate with caching
  const fetchUsdtRate = async () => {
    const now = Date.now();
    if (usdtRateCache.rate && (now - usdtRateCache.timestamp) < usdtRateCache.expiresIn) {
      setUsdtRate(usdtRateCache.rate);
      return usdtRateCache.rate;
    }
    try {
      const res = await fetch(COINGECKO_API_URL);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const rate = data.tether.ngn;
      usdtRateCache = { rate, timestamp: now, expiresIn: 5 * 60 * 1000 };
      setUsdtRate(rate);
      return rate;
    } catch (error) {
      if (usdtRateCache.rate) {
        setUsdtRate(usdtRateCache.rate);
        return usdtRateCache.rate;
      }
      const fallbackRate = 1550.21;
      setUsdtRate(fallbackRate);
      return fallbackRate;
    }
  };

  useEffect(() => { fetchUsdtRate(); }, []);

  useEffect(() => {
    if (!nairaAmount) { setUsdtEquivalent(""); return; }
    const calculateUsdtEquivalent = async () => {
      const rate = await fetchUsdtRate();
      if (rate) {
        const usdt = (parseFloat(nairaAmount) / rate).toFixed(2);
        setUsdtEquivalent(usdt);
      }
    };
    calculateUsdtEquivalent();
  }, [nairaAmount]);

  // TronWeb detection
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).tronWeb && (window as any).tronWeb.ready) {
      setTronWebAvailable(true);
    } else {
      setTronWebAvailable(false);
    }
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard", description: "Address copied to clipboard" });
  };

  // In-app TronWeb payment
  const handleInAppPayment = async () => {
    setInAppTxStatus(null);
    if (!tronWebAvailable) {
      toast({ title: "Tron wallet not detected", description: "Please install TronLink or use a compatible browser.", variant: "destructive" });
      return;
    }
    if (!usdtEquivalent || !nairaAmount) {
      toast({ title: "Enter amount", description: "Please enter the amount in Naira first.", variant: "destructive" });
      return;
    }
    try {
      setInAppTxStatus("pending");
      const tronWeb = (window as any).tronWeb;
      // USDT contract address on Tron mainnet
      const USDT_CONTRACT = "TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj";
      const contract = await tronWeb.contract().at(USDT_CONTRACT);
      // USDT has 6 decimals
      const amountInSun = tronWeb.toBigNumber(parseFloat(usdtEquivalent) * 1e6);
      const tx = await contract.transfer(TRON_USDT_ADDRESS, amountInSun).send();
      setTxHash(tx);
      setInAppTxStatus("success");
      toast({ title: "Payment sent!", description: "Transaction submitted. Paste the hash in the Confirm tab to complete funding." });
    } catch (err: any) {
      setInAppTxStatus("error");
      toast({ title: "Payment failed", description: err?.message || "Could not send payment.", variant: "destructive" });
    }
  };

  // Confirm payment (submit tx hash)
  const handleFundWallet = async () => {
    if (!txHash || !nairaAmount) return;
    setIsLoading(true);
    const getCookie = (name: string) => {
      if (typeof document === "undefined") return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
      return null;
    };
    const token = getCookie("access_token");
    if (!token) { router.push("/login"); return; }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/verify-deposit/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ tx_hash: txHash, naira_amount: nairaAmount }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Verification failed", description: data.error || "Failed to verify deposit", variant: "destructive" });
        return;
      }
      toast({ title: "Wallet funded successfully", description: `₦${Number(nairaAmount).toLocaleString()} has been added to your wallet.` });
      setTxHash(""); setNairaAmount(""); setUsdtEquivalent("");
      router.push("/wallet");
    } catch (err) {
      toast({ title: "Network error", description: "Could not connect to server.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-2">Fund Your Wallet</h1>
      <Tabs defaultValue="fund" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="fund">Fund Wallet</TabsTrigger>
          <TabsTrigger value="confirm">Confirm Payment</TabsTrigger>
        </TabsList>
        <TabsContent value="fund">
          <div className="space-y-6">
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
                Send <span className="font-bold">{usdtEquivalent || "..."} USDT</span> to this address and enter the transaction hash in the Confirm tab below.
              </p>
            </div>
            {tronWebAvailable && (
              <Button className="w-full" onClick={handleInAppPayment} disabled={!usdtEquivalent || !nairaAmount || inAppTxStatus === "pending"}>
                {inAppTxStatus === "pending" ? "Processing..." : "Pay with Tron Wallet (in-app)"}
              </Button>
            )}
            {!tronWebAvailable && (
              <div className="text-xs text-muted-foreground">Tron wallet not detected. You can pay externally and confirm below.</div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="confirm">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="tx-hash">Transaction Hash</Label>
              <Input id="tx-hash" placeholder="Paste transaction hash here..." value={txHash} onChange={e => setTxHash(e.target.value)} />
            </div>
            <Button onClick={handleFundWallet} disabled={isLoading || !txHash || !nairaAmount} className="w-full">
              {isLoading ? "Processing..." : "Submit for Verification"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      <Button variant="outline" onClick={() => router.push('/wallet')} className="mt-8">Back to Wallet</Button>
    </div>
  );
} 