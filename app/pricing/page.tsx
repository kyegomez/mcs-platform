"use client"

import { SubscriptionPayment } from "@/components/subscription-payment"

export default function PricingPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center pt-8 pb-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Upgrade to unlock premium features and get unlimited access to our AI healthcare specialists
        </p>
      </div>

      {/* Subscription Payment Component */}
      <SubscriptionPayment />
    </div>
  )
}
