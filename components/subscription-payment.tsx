"use client"

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Crown, Users, Check, ArrowRight, Calendar, MessageSquare, Shield, Star, Wallet, Loader2 } from 'lucide-react'
import { SolanaPaymentService, PaymentDetails } from '@/lib/solana-payment'
import { getUserSubscription, updateUserSubscription, type UserSubscription } from '@/lib/subscription-system'
import { clusterApiUrl } from '@solana/web3.js'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { Connection, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'

export function SubscriptionPayment() {
  const walletContext = useWallet()
  const { publicKey, connected } = walletContext
  const [subscription, setSubscription] = useState<UserSubscription>({
    tier: "free",
    isActive: true,
    conversationsUsed: 0,
    conversationsLimit: 15,
  })
  const [isAnnual, setIsAnnual] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [solPrice, setSolPrice] = useState<number>(0)

  const network = WalletAdapterNetwork.Devnet
  const endpoint = clusterApiUrl(network)
  const paymentService = new SolanaPaymentService(endpoint)
  const connection = new Connection(endpoint, 'confirmed')

  // Test transaction function
  const createTestTransaction = async () => {
    try {
      console.log("Creating test transaction...")
      
      if (!publicKey || !walletContext.signTransaction) {
        return { success: false, error: 'Wallet not ready' }
      }

      // Create a simple transaction that sends 0.001 SOL to the same address (test transaction)
      const transaction = new Transaction()
      const testAmount = 0.001 * LAMPORTS_PER_SOL // 0.001 SOL
      
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey, // Send to self for testing
          lamports: testAmount,
        })
      )

      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      console.log("Signing test transaction...")
      const signedTransaction = await walletContext.signTransaction(transaction)
      console.log("Test transaction signed successfully!")

      return { success: true }
    } catch (error) {
      console.error("Test transaction failed:", error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  useEffect(() => {
    loadSubscriptionData()
    loadSolPrice()
  }, [])

  useEffect(() => {
    if (connected) {
      loadPaymentDetails()
    }
  }, [connected, isAnnual])

  const loadSubscriptionData = () => {
    try {
      const loadedSubscription = getUserSubscription()
      setSubscription(loadedSubscription)
    } catch (error) {
      console.error("Error loading subscription data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSolPrice = async () => {
    try {
      const price = await paymentService.getCurrentSolPrice()
      setSolPrice(price)
    } catch (error) {
      console.error("Error loading SOL price:", error)
    }
  }

  const loadPaymentDetails = async () => {
    if (!connected) return

    try {
      const details = await paymentService.getPaymentDetails('premium', isAnnual ? 'annual' : 'monthly')
      setPaymentDetails(details)
    } catch (error) {
      console.error("Error loading payment details:", error)
    }
  }

  const handleUpgrade = async (tier: "premium" | "family") => {
    if (!connected || !publicKey) {
      alert("Please connect your Phantom wallet first")
      return
    }

    console.log("=== Payment Debug Info ===")
    console.log("Connected:", connected)
    console.log("Public Key:", publicKey?.toString())
    console.log("Has signTransaction:", !!walletContext.signTransaction)
    console.log("Wallet Name:", walletContext.wallet?.adapter.name)
    console.log("Wallet Ready:", walletContext.wallet?.adapter.ready)
    console.log("==========================")
    
    if (!walletContext.signTransaction) {
      alert("Wallet is not ready. Please try reconnecting your Phantom wallet.")
      return
    }

    setIsProcessing(true)

    try {
      console.log("Starting payment process...")
      console.log("Wallet public key:", publicKey.toString())
      console.log("Subscription tier:", tier)
      console.log("Billing cycle:", isAnnual ? 'annual' : 'monthly')

      // Create a simple test transaction first
      const testResult = await createTestTransaction()
      if (!testResult.success) {
        alert(`Test transaction failed: ${testResult.error}`)
        return
      }

      const result = await paymentService.createSubscriptionPayment(
        { 
          publicKey, 
          signTransaction: walletContext.signTransaction 
        },
        tier,
        isAnnual ? 'annual' : 'monthly'
      )

      if (result.success && result.signature) {
        // Verify the payment through our API
        const verificationResponse = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            signature: result.signature,
            subscriptionTier: tier,
            billingCycle: isAnnual ? 'annual' : 'monthly',
          }),
        })

        const verificationResult = await verificationResponse.json()

        if (verificationResult.success) {
          // Update subscription
          const newSubscription: UserSubscription = {
            tier,
            isActive: true,
            conversationsUsed: subscription.conversationsUsed,
            conversationsLimit: tier === "premium" ? 999 : 999,
            renewalDate: new Date(Date.now() + (isAnnual ? 365 : 30) * 24 * 60 * 60 * 1000),
            billingCycle: isAnnual ? "annual" : "monthly",
          }

          setSubscription(newSubscription)
          updateUserSubscription(newSubscription)
          
          alert(`Payment successful! Your ${tier} subscription is now active.`)
        } else {
          alert(`Payment verification failed: ${verificationResult.error}`)
        }
      } else {
        alert(`Payment failed: ${result.error}`)
      }
    } catch (error) {
      console.error("Error processing payment:", error)
      alert("Payment failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const getUsagePercentage = () => {
    if (subscription.conversationsLimit <= 0) return 0
    return (subscription.conversationsUsed / subscription.conversationsLimit) * 100
  }

  const getUsageColor = () => {
    const percentage = getUsagePercentage()
    if (percentage >= 90) return "bg-red-500"
    if (percentage >= 70) return "bg-yellow-500"
    return "bg-mcs-blue"
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-light text-foreground mb-2">Your Subscription</h2>
          <p className="text-muted-foreground font-light">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-light text-foreground mb-2">Your Subscription</h2>
        <p className="text-muted-foreground font-light">
          {subscription.tier === "free" ? "Upgrade to unlock premium features" : "Manage your subscription"}
        </p>
      </div>

      {/* Current Subscription Status */}
      <Card className="border-0 bg-gradient-to-br from-white/5 via-white/3 to-white/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {subscription.tier === "premium" ? (
                <Crown className="w-6 h-6 text-yellow-500" />
              ) : subscription.tier === "family" ? (
                <Users className="w-6 h-6 text-purple-500" />
              ) : (
                <Shield className="w-6 h-6 text-mcs-blue" />
              )}
              <div>
                <h3 className="font-semibold text-foreground capitalize">{subscription.tier} Plan</h3>
                <p className="text-sm text-muted-foreground">
                  {subscription.conversationsLimit === -1 ? "Unlimited" : `${subscription.conversationsLimit} conversations`}
                </p>
              </div>
            </div>
            <Badge variant={subscription.isActive ? "default" : "secondary"}>
              {subscription.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          {subscription.tier === "free" && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Usage</span>
                <span className="text-foreground">
                  {subscription.conversationsUsed} / {subscription.conversationsLimit}
                </span>
              </div>
              <Progress value={getUsagePercentage()} className="h-2" />
            </div>
          )}

          {subscription.renewalDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                Renews {new Date(subscription.renewalDate).toLocaleDateString()}
                {subscription.billingCycle && ` (${subscription.billingCycle})`}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wallet Connection Status */}
      {!connected && (
        <Card className="border-0 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5">
          <CardContent className="p-6 text-center">
            <Wallet className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-2">Connect Your Wallet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your Phantom wallet to upgrade your subscription
            </p>
            <div className="flex justify-center">
              <Wallet className="w-4 h-4 mr-2" />
              <span className="text-sm">Phantom wallet required</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Options */}
      {connected && subscription.tier === "free" && (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              variant={!isAnnual ? "default" : "outline"}
              onClick={() => setIsAnnual(false)}
              className="px-6"
            >
              Monthly
            </Button>
            <Button
              variant={isAnnual ? "default" : "outline"}
              onClick={() => setIsAnnual(true)}
              className="px-6"
            >
              Annual
              <Badge variant="secondary" className="ml-2 text-xs">
                Save 17%
              </Badge>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Premium Plan */}
            <Card className="border-0 bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-blue-700/10 hover:from-blue-500/20 hover:via-blue-600/15 hover:to-blue-700/20 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <Crown className="w-6 h-6 text-yellow-500" />
                  <CardTitle className="text-lg">Premium</CardTitle>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">
                    ${isAnnual ? "79.99" : "7.99"}
                  </span>
                  <span className="text-muted-foreground">
                    /{isAnnual ? "year" : "month"}
                  </span>
                </div>
                {paymentDetails && (
                  <div className="text-sm text-muted-foreground">
                    ≈ {paymentDetails.solAmount.toFixed(4)} SOL
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    Unlimited conversations
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    All AI specialists
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    Advanced health analytics
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    Priority support
                  </li>
                </ul>
                <Button
                  onClick={() => handleUpgrade("premium")}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Upgrade to Premium
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Family Plan */}
            <Card className="border-0 bg-gradient-to-br from-purple-500/10 via-purple-600/5 to-purple-700/10 hover:from-purple-500/20 hover:via-purple-600/15 hover:to-purple-700/20 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-purple-500" />
                  <CardTitle className="text-lg">Family</CardTitle>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">
                    ${isAnnual ? "129.99" : "12.99"}
                  </span>
                  <span className="text-muted-foreground">
                    /{isAnnual ? "year" : "month"}
                  </span>
                </div>
                {paymentDetails && (
                  <div className="text-sm text-muted-foreground">
                    ≈ {(paymentDetails.amount * 1.625 / solPrice).toFixed(4)} SOL
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    Up to 6 family members
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    All Premium features
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    Family health dashboard
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    Shared health goals
                  </li>
                </ul>
                <Button
                  onClick={() => handleUpgrade("family")}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Upgrade to Family
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Current SOL Price and Wallet Info */}
      {connected && (
        <div className="text-center space-y-2">
          <div className="text-sm text-muted-foreground">
            Current SOL Price: ${solPrice.toFixed(2)} USD
          </div>
          <div className="text-xs text-muted-foreground">
            Payments will be sent to: 7MaX4muAn8ZQREJxnupm8sgokwFHujgrGfH9Qn81BuEV
          </div>
          <Button 
            onClick={createTestTransaction} 
            variant="outline" 
            size="sm"
            className="mt-2"
          >
            Test Wallet Connection
          </Button>
        </div>
      )}
    </div>
  )
} 