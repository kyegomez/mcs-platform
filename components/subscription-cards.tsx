"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Crown, Users, Check, ArrowRight, Calendar, MessageSquare, Shield, Star } from "lucide-react"
import Link from "next/link"

interface SubscriptionData {
  tier: "free" | "premium" | "family"
  isActive: boolean
  conversationsUsed: number
  conversationsLimit: number
  renewalDate?: Date
  billingCycle?: "monthly" | "annual"
}

export function SubscriptionCards() {
  const [subscription, setSubscription] = useState<SubscriptionData>({
    tier: "free",
    isActive: true,
    conversationsUsed: 8,
    conversationsLimit: 15,
  })

  const [isAnnual, setIsAnnual] = useState(false)

  useEffect(() => {
    // Load subscription data from localStorage
    const loadSubscriptionData = () => {
      try {
        const savedSubscription = localStorage.getItem("mcs-subscription")
        if (savedSubscription) {
          const parsedSubscription = JSON.parse(savedSubscription)
          setSubscription(parsedSubscription)
        }
      } catch (error) {
        console.error("Error loading subscription data:", error)
      }
    }

    loadSubscriptionData()
  }, [])

  const handleUpgrade = (tier: "premium" | "family") => {
    // In a real app, this would integrate with Stripe or payment processor
    console.log(`Upgrading to ${tier} plan`)

    // For demo purposes, simulate upgrade
    const newSubscription: SubscriptionData = {
      tier,
      isActive: true,
      conversationsUsed: subscription.conversationsUsed,
      conversationsLimit: tier === "premium" ? 999 : 999,
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      billingCycle: isAnnual ? "annual" : "monthly",
    }

    setSubscription(newSubscription)
    localStorage.setItem("mcs-subscription", JSON.stringify(newSubscription))
  }

  const getUsagePercentage = () => {
    return (subscription.conversationsUsed / subscription.conversationsLimit) * 100
  }

  const getUsageColor = () => {
    const percentage = getUsagePercentage()
    if (percentage >= 90) return "bg-red-500"
    if (percentage >= 70) return "bg-yellow-500"
    return "bg-mcs-blue"
  }

  const formatRenewalDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-light text-white mb-2">Your Subscription</h2>
        <p className="text-gray-400 font-light">Manage your plan and billing</p>
      </div>

      {/* Current Plan Status */}
      <Card className="border-0 bg-gradient-to-br from-mcs-blue/10 to-mcs-blue/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-mcs-blue/20 flex items-center justify-center">
                {subscription.tier === "free" && <MessageSquare className="w-6 h-6 text-mcs-blue" />}
                {subscription.tier === "premium" && <Crown className="w-6 h-6 text-mcs-blue" />}
                {subscription.tier === "family" && <Users className="w-6 h-6 text-mcs-blue" />}
              </div>
              <div>
                <h3 className="text-xl font-medium text-white capitalize">{subscription.tier} Plan</h3>
                <p className="text-gray-400 text-sm">
                  {subscription.tier === "free" && "Basic health assistance"}
                  {subscription.tier === "premium" && "Full access to all specialists"}
                  {subscription.tier === "family" && "Complete family health coverage"}
                </p>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
          </div>

          {subscription.tier === "free" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Conversations this month</span>
                <span className="text-white">
                  {subscription.conversationsUsed} / {subscription.conversationsLimit}
                </span>
              </div>
              <Progress value={getUsagePercentage()} className="h-2" />
              {getUsagePercentage() >= 80 && (
                <p className="text-yellow-400 text-sm">
                  You're running low on conversations. Consider upgrading for unlimited access.
                </p>
              )}
            </div>
          )}

          {subscription.renewalDate && (
            <div className="flex items-center gap-2 text-sm text-gray-400 mt-4">
              <Calendar className="w-4 h-4" />
              <span>
                Renews on {formatRenewalDate(subscription.renewalDate)}({subscription.billingCycle})
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Free Plan */}
        <Card
          className={`border-0 transition-all duration-200 ${
            subscription.tier === "free" ? "bg-mcs-blue/10 border border-mcs-blue/30" : "bg-white/5 hover:bg-white/10"
          }`}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white font-medium">Free</CardTitle>
              {subscription.tier === "free" && <Badge className="bg-mcs-blue text-white text-xs">Current</Badge>}
            </div>
            <div className="text-3xl font-light text-white">$0</div>
            <p className="text-gray-400 text-sm">Perfect for getting started</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">15 conversations/month</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Basic health tracking</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Notes and reminders</span>
              </div>
            </div>
            {subscription.tier !== "free" && (
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10" disabled>
                Downgrade to Free
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Premium Plan */}
        <Card
          className={`border-0 transition-all duration-200 relative ${
            subscription.tier === "premium"
              ? "bg-mcs-blue/10 border border-mcs-blue/30"
              : "bg-white/5 hover:bg-white/10"
          }`}
        >
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1">
              <Star className="w-3 h-3 mr-1" />
              Most Popular
            </Badge>
          </div>
          <CardHeader className="pb-4 pt-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white font-medium">Premium</CardTitle>
              {subscription.tier === "premium" && <Badge className="bg-mcs-blue text-white text-xs">Current</Badge>}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-light text-white">${isAnnual ? "79" : "7.99"}</span>
              <span className="text-gray-400 text-sm">/{isAnnual ? "year" : "month"}</span>
            </div>
            {isAnnual && <p className="text-green-400 text-sm">Save 17% annually</p>}
            <p className="text-gray-400 text-sm">Complete health assistance</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Unlimited conversations</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">All AI specialists</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Advanced health analytics</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Priority support</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Voice input</span>
              </div>
            </div>
            {subscription.tier === "premium" ? (
              <Button
                variant="outline"
                className="w-full border-mcs-blue/30 text-mcs-blue hover:bg-mcs-blue/10"
                disabled
              >
                <Crown className="w-4 h-4 mr-2" />
                Current Plan
              </Button>
            ) : (
              <Button
                onClick={() => handleUpgrade("premium")}
                className="w-full bg-mcs-blue hover:bg-mcs-blue/80 text-white"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Family Plan */}
        <Card
          className={`border-0 transition-all duration-200 ${
            subscription.tier === "family" ? "bg-mcs-blue/10 border border-mcs-blue/30" : "bg-white/5 hover:bg-white/10"
          }`}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white font-medium">Family</CardTitle>
              {subscription.tier === "family" && <Badge className="bg-mcs-blue text-white text-xs">Current</Badge>}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-light text-white">${isAnnual ? "129" : "12.99"}</span>
              <span className="text-gray-400 text-sm">/{isAnnual ? "year" : "month"}</span>
            </div>
            <p className="text-green-400 text-sm">Just ${isAnnual ? "$21.50" : "$2.16"}/person/month</p>
            <p className="text-gray-400 text-sm">Health coverage for everyone</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Up to 6 family members</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">All Premium features</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Family health dashboard</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Shared health goals</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Priority family support</span>
              </div>
            </div>
            {subscription.tier === "family" ? (
              <Button
                variant="outline"
                className="w-full border-mcs-blue/30 text-mcs-blue hover:bg-mcs-blue/10"
                disabled
              >
                <Users className="w-4 h-4 mr-2" />
                Current Plan
              </Button>
            ) : (
              <Button
                onClick={() => handleUpgrade("family")}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
              >
                <Users className="w-4 h-4 mr-2" />
                Upgrade to Family
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={`text-sm ${!isAnnual ? "text-white" : "text-gray-400"}`}>Monthly</span>
        <button
          onClick={() => setIsAnnual(!isAnnual)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isAnnual ? "bg-mcs-blue" : "bg-gray-600"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isAnnual ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className={`text-sm ${isAnnual ? "text-white" : "text-gray-400"}`}>Annual</span>
        {isAnnual && (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Save up to 20%</Badge>
        )}
      </div>

      {/* Additional Actions */}
      <div className="flex items-center justify-center gap-4">
        <Link href="/pricing">
          <Button variant="ghost" className="text-gray-400 hover:text-white">
            View Full Pricing Details
          </Button>
        </Link>
        {subscription.tier !== "free" && (
          <Button variant="ghost" className="text-gray-400 hover:text-white">
            <Shield className="w-4 h-4 mr-2" />
            Manage Billing
          </Button>
        )}
      </div>
    </div>
  )
}
