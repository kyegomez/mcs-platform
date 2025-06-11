"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Check, Sparkles, Users, Heart, Shield, Zap, Crown, Star } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)

  const plans = [
    {
      name: "Free",
      description: "Get started with essential health tracking",
      price: { monthly: 0, annual: 0 },
      badge: null,
      icon: Heart,
      iconColor: "text-gray-400",
      cardStyle: "border-0 bg-white/5 hover:bg-white/8",
      buttonStyle: "border-white/20 text-white hover:bg-white/10",
      buttonText: "Get Started Free",
      popular: false,
      features: [
        { text: "Chat with AI Health Assistant", included: true, limited: "15 conversations/month" },
        { text: "Personal Health Notes", included: true },
        { text: "Basic Health Tracking", included: true },
        { text: "Daily Health Tips", included: true },
        { text: "Community Support", included: true },
        { text: "All AI Specialists", included: false },
        { text: "Unlimited Conversations", included: false },
        { text: "Voice Input & Commands", included: false },
        { text: "Goal Tracking & Alerts", included: false },
        { text: "Health Analytics", included: false },
        { text: "Priority Support", included: false },
        { text: "Family Dashboard", included: false },
      ],
    },
    {
      name: "Premium",
      description: "Your complete personal health team",
      price: { monthly: 7.99, annual: 79.99 },
      badge: "Most Popular",
      icon: Sparkles,
      iconColor: "text-mcs-blue",
      cardStyle:
        "border-2 border-mcs-blue bg-gradient-to-br from-mcs-blue/10 to-mcs-blue/5 hover:from-mcs-blue/15 hover:to-mcs-blue/10",
      buttonStyle: "bg-mcs-blue text-white hover:bg-mcs-blue/90",
      buttonText: "Start Free Trial",
      popular: true,
      features: [
        { text: "Everything in Free", included: true, highlight: true },
        { text: "Unlimited AI Conversations", included: true },
        { text: "All Medical Specialists", included: true },
        { text: "Voice Input & Commands", included: true },
        { text: "Smart Goal Tracking", included: true },
        { text: "Personalized Alerts", included: true },
        { text: "Health Analytics Dashboard", included: true },
        { text: "Faster Response Times", included: true },
        { text: "Priority Support", included: true },
        { text: "Advanced Health Insights", included: true },
        { text: "Export Health Data", included: true },
        { text: "Family Dashboard", included: false },
      ],
    },
    {
      name: "Family",
      description: "Complete health coverage for your family",
      price: { monthly: 12.99, annual: 129.99 },
      badge: "Best Value",
      icon: Users,
      iconColor: "text-purple-400",
      cardStyle:
        "border-0 bg-gradient-to-br from-purple-500/10 to-purple-500/5 hover:from-purple-500/15 hover:to-purple-500/10",
      buttonStyle:
        "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700",
      buttonText: "Start Family Plan",
      popular: false,
      features: [
        { text: "Everything in Premium", included: true, highlight: true },
        { text: "Up to 6 Family Members", included: true },
        { text: "Individual Profiles", included: true },
        { text: "Family Health Dashboard", included: true },
        { text: "Shared Goal Tracking", included: true },
        { text: "Family Health Reports", included: true },
        { text: "Emergency Contact System", included: true },
        { text: "Parental Controls", included: true },
        { text: "Family Health Calendar", included: true },
        { text: "Bulk Health Export", included: true },
        { text: "Family Admin Portal", included: true },
        { text: "Dedicated Family Support", included: true },
      ],
    },
  ]

  const getPrice = (plan: (typeof plans)[0]) => {
    if (plan.price.monthly === 0) return "Free"
    const price = isAnnual ? plan.price.annual : plan.price.monthly
    const period = isAnnual ? "/year" : "/month"
    return `$${price}${period}`
  }

  const getSavings = (plan: (typeof plans)[0]) => {
    if (plan.price.monthly === 0) return null
    const monthlyTotal = plan.price.monthly * 12
    const annualPrice = plan.price.annual
    const savings = monthlyTotal - annualPrice
    const percentage = Math.round((savings / monthlyTotal) * 100)
    return { amount: savings, percentage }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-light text-white mb-6">
            Choose Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-mcs-blue to-purple-400">
              Health Plan
            </span>
          </h1>
          <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto mb-8">
            Start free, upgrade when you're ready. Cancel anytime.
          </p>

          {/* Annual/Monthly Toggle */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className={`text-sm font-medium ${!isAnnual ? "text-white" : "text-gray-400"}`}>Monthly</span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} className="data-[state=checked]:bg-mcs-blue" />
            <span className={`text-sm font-medium ${isAnnual ? "text-white" : "text-gray-400"}`}>Annual</span>
            {isAnnual && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Save up to 20%</Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => {
            const IconComponent = plan.icon
            const savings = getSavings(plan)

            return (
              <Card
                key={plan.name}
                className={`${plan.cardStyle} transition-all duration-300 transform hover:scale-105 relative overflow-hidden`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-mcs-blue to-purple-500 p-3 text-center">
                    <p className="text-white text-sm font-medium flex items-center justify-center gap-1">
                      <Star className="h-4 w-4" />
                      {plan.badge}
                    </p>
                  </div>
                )}

                <CardContent className={`p-8 ${plan.popular ? "pt-20" : ""}`}>
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div
                      className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${
                        plan.name === "Free"
                          ? "from-gray-500/20 to-gray-600/20"
                          : plan.name === "Premium"
                            ? "from-mcs-blue/20 to-mcs-blue/30"
                            : "from-purple-500/20 to-purple-600/20"
                      } flex items-center justify-center`}
                    >
                      <IconComponent className={`h-8 w-8 ${plan.iconColor}`} />
                    </div>

                    <h3 className="text-2xl font-semibold text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-400 font-light mb-4">{plan.description}</p>

                    {/* Price */}
                    <div className="mb-2">
                      <span className="text-4xl font-light text-white">{getPrice(plan)}</span>
                      {plan.price.monthly > 0 && (
                        <span className="text-gray-400 text-sm ml-1">{isAnnual ? "/year" : "/month"}</span>
                      )}
                    </div>

                    {/* Savings Badge */}
                    {isAnnual && savings && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs mb-4">
                        Save ${savings.amount}/year ({savings.percentage}% off)
                      </Badge>
                    )}

                    {/* Family Plan Value */}
                    {plan.name === "Family" && (
                      <p className="text-xs text-gray-400 mb-4">
                        Just ${(isAnnual ? plan.price.annual / 12 : plan.price.monthly) / 6}/month per person
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button
                    className={`w-full ${plan.buttonStyle} font-medium py-3 text-base transition-all duration-200 mb-8`}
                    size="lg"
                  >
                    {plan.buttonText}
                  </Button>

                  {/* Features List */}
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                        ) : (
                          <div className="h-5 w-5 mt-0.5 flex-shrink-0 rounded-full border border-gray-600" />
                        )}
                        <div className="flex-1">
                          <span
                            className={`text-sm ${
                              feature.included
                                ? feature.highlight
                                  ? "text-white font-medium"
                                  : "text-gray-300"
                                : "text-gray-500"
                            }`}
                          >
                            {feature.text}
                          </span>
                          {feature.limited && <div className="text-xs text-gray-400 mt-1">{feature.limited}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Trust Indicators */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-8 mb-8 flex-wrap">
            <div className="flex items-center gap-2 text-gray-400">
              <Shield className="h-5 w-5" />
              <span className="text-sm">HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Zap className="h-5 w-5" />
              <span className="text-sm">Instant Access</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Crown className="h-5 w-5" />
              <span className="text-sm">Cancel Anytime</span>
            </div>
          </div>

          <p className="text-gray-500 text-sm max-w-2xl mx-auto">
            All plans include bank-level security, 24/7 availability, and seamless sync across all your devices. Your
            health data stays private and secure, always.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-light text-white text-center mb-12">Frequently Asked Questions</h2>

          <div className="space-y-6">
            {[
              {
                question: "Can I cancel my subscription anytime?",
                answer:
                  "Yes, you can cancel your subscription at any time. Your premium features will remain active until the end of your current billing period.",
              },
              {
                question: "Is my health data secure?",
                answer:
                  "Absolutely. We use bank-level encryption and are HIPAA compliant. Your health data is stored securely and never shared with third parties.",
              },
              {
                question: "Can I upgrade or downgrade my plan?",
                answer:
                  "Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades take effect at the end of your current billing cycle.",
              },
              {
                question: "How does the family plan work?",
                answer:
                  "The family plan allows up to 6 family members to have their own individual profiles and full access to all premium features, managed under one subscription.",
              },
              {
                question: "Is there a free trial?",
                answer:
                  "Yes! Premium and Family plans come with a 7-day free trial. No credit card required to start, and you can cancel anytime during the trial.",
              },
            ].map((faq, index) => (
              <Card key={index} className="border-0 bg-white/5">
                <CardContent className="p-6">
                  <h3 className="text-white font-medium mb-2">{faq.question}</h3>
                  <p className="text-gray-400 font-light">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-light text-white mb-4">Ready to Transform Your Health?</h2>
          <p className="text-gray-400 font-light mb-8 max-w-xl mx-auto">
            Join thousands of users who are already taking control of their health with AI-powered insights and
            personalized guidance.
          </p>
          <Link href="/chat">
            <Button size="lg" className="bg-mcs-blue text-white hover:bg-mcs-blue/90 px-8 py-3 text-lg font-medium">
              Start Your Health Journey
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
