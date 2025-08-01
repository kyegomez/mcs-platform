"use client"

import { useWallet } from '@solana/wallet-adapter-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { WalletConnect } from '@/components/wallet-connect'
import { SubscriptionPayment } from '@/components/subscription-payment'
import { WalletTest } from '@/components/wallet-test'
import { Wallet, User, Shield, Crown, Users, Calendar } from 'lucide-react'
import { getUserSubscription, type UserSubscription } from '@/lib/subscription-system'
import { useState, useEffect } from 'react'

export default function AccountPage() {
  const { publicKey, connected } = useWallet()
  const [subscription, setSubscription] = useState<UserSubscription>({
    tier: "free",
    isActive: true,
    conversationsUsed: 0,
    conversationsLimit: 15,
  })

  useEffect(() => {
    const loadSubscription = () => {
      try {
        const loadedSubscription = getUserSubscription()
        setSubscription(loadedSubscription)
      } catch (error) {
        console.error("Error loading subscription:", error)
      }
    }

    loadSubscription()
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center pt-8 pb-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
          Account Settings
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Manage your wallet connection and subscription
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Wallet Connection */}
        <Card className="border-0 bg-gradient-to-br from-white/5 via-white/3 to-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Wallet Connection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {connected ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium text-green-400">Connected</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your Phantom wallet is connected and ready for payments.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm font-medium text-yellow-400">Not Connected</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Connect your Phantom wallet to access premium features and make payments.
                </p>
                <WalletConnect />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Subscription */}
        <Card className="border-0 bg-gradient-to-br from-white/5 via-white/3 to-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {subscription.tier === "premium" ? (
                <Crown className="w-5 h-5 text-yellow-500" />
              ) : subscription.tier === "family" ? (
                <Users className="w-5 h-5 text-purple-500" />
              ) : (
                <Shield className="w-5 h-5 text-blue-500" />
              )}
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground capitalize">{subscription.tier} Plan</h3>
                <p className="text-sm text-muted-foreground">
                  {subscription.conversationsLimit === -1 ? "Unlimited conversations" : `${subscription.conversationsLimit} conversations`}
                </p>
              </div>
              <Badge variant={subscription.isActive ? "default" : "secondary"}>
                {subscription.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            {subscription.renewalDate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  Renews {new Date(subscription.renewalDate).toLocaleDateString()}
                  {subscription.billingCycle && ` (${subscription.billingCycle})`}
                </span>
              </div>
            )}

            {subscription.tier === "free" && (
              <div className="pt-2">
                <Button asChild className="w-full">
                  <a href="/pricing">Upgrade Plan</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Wallet Test (Temporary for debugging) */}
      <WalletTest />

      {/* Subscription Management */}
      {connected && (
        <Card className="border-0 bg-gradient-to-br from-white/5 via-white/3 to-white/5">
          <CardHeader>
            <CardTitle>Subscription Management</CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionPayment />
          </CardContent>
        </Card>
      )}

      {/* Account Information */}
      <Card className="border-0 bg-gradient-to-br from-white/5 via-white/3 to-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Account Type</label>
              <p className="text-foreground">Web3 Wallet</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Connection Status</label>
              <p className="text-foreground">{connected ? "Connected" : "Not Connected"}</p>
            </div>
            {connected && (
              <>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Wallet Address</label>
                  <p className="text-foreground font-mono text-sm">
                    {publicKey?.toString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Network</label>
                  <p className="text-foreground">Solana Devnet</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
