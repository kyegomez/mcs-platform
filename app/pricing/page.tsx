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
      iconColor: "text-gray-500",
      cardStyle: "border border-gray-200 bg-white hover:bg-gray-50 shadow-sm hover:shadow-md",
      buttonStyle: "border border-gray-300 text-gray-700 hover:bg-gray-100",
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
      iconColor: "text-blue-600",
      cardStyle: "border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 shadow-lg hover:shadow-xl",
      buttonStyle: "bg-blue-600 text-white hover:bg-blue-700",
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
      iconColor: "text-purple-600",
      cardStyle: "border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 hover:from-purple-100 hover:to-purple-200/50 shadow-sm hover:shadow-md",
      buttonStyle: "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800",
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-gray-900 mb-6">
            Choose Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Health Plan
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 font-light max-w-2xl mx-auto mb-8">
            Start free, upgrade when you're ready. Cancel anytime.
          </p>

          {/* Annual/Monthly Toggle */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className={`text-sm font-medium ${!isAnnual ? "text-gray-900" : "text-gray-500"}`}>Monthly</span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} className="data-[state=checked]:bg-blue-600" />
            <span className={`text-sm font-medium ${isAnnual ? "text-gray-900" : "text-gray-500"}`}>Annual</span>
            {isAnnual && (
              <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Save up to 20%</Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
          {plans.map((plan) => {
            const IconComponent = plan.icon
            const savings = getSavings(plan)

            return (
              <Card
                key={plan.name}
                className={`${plan.cardStyle} transition-all duration-300 transform hover:scale-105 relative overflow-hidden`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 p-3 text-center">
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
                          ? "from-gray-200 to-gray-300"
                          : plan.name === "Premium"
                            ? "from-blue-100 to-blue-200"
                            : "from-purple-100 to-purple-200"
                      } flex items-center justify-center`}
                    >
                      <IconComponent className={`h-8 w-8 ${plan.iconColor}`} />
                    </div>

                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 font-light mb-4">{plan.description}</p>

                    {/* Price */}
                    <div className="mb-2">
                      <span className="text-3xl sm:text-4xl font-light text-gray-900">{getPrice(plan)}</span>
                      {plan.price.monthly > 0 && (
                        <span className="text-gray-500 text-sm ml-1">{isAnnual ? "/year" : "/month"}</span>
                      )}
                    </div>

                    {/* Savings Badge */}
                    {isAnnual && savings && (
                      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs mb-4">
                        Save ${savings.amount}/year ({savings.percentage}% off)
                      </Badge>
                    )}

                    {/* Family Plan Value */}
                    {plan.name === "Family" && (
                      <p className="text-xs text-gray-500 mb-4">
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
                          <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <div className="h-5 w-5 mt-0.5 flex-shrink-0 rounded-full border border-gray-400" />
                        )}
                        <div className="flex-1">
                          <span
                            className={`text-sm ${
                              feature.included
                                ? feature.highlight
                                  ? "text-gray-900 font-medium"
                                  : "text-gray-700"
                                : "text-gray-400"
                            }`}
                          >
                            {feature.text}
                          </span>
                          {feature.limited && <div className="text-xs text-gray-500 mt-1">{feature.limited}</div>}
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
          <div className="flex items-center justify-center gap-4 sm:gap-8 mb-8 flex-wrap">
            <div className="flex items-center gap-2 text-gray-600">
              <Shield className="h-5 w-5" />
              <span className="text-sm">HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Zap className="h-5 w-5" />
              <span className="text-sm">Instant Access</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
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
          <h2 className="text-2xl sm:text-3xl font-light text-gray-900 text-center mb-12">Frequently Asked Questions</h2>

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
              <Card key={index} className="border border-gray-200 bg-white shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-gray-900 font-medium mb-2">{faq.question}</h3>
                  <p className="text-gray-600 font-light">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-16">
          <h2 className="text-2xl sm:text-3xl font-light text-gray-900 mb-4">Ready to Transform Your Health?</h2>
          <p className="text-gray-600 font-light mb-8 max-w-xl mx-auto">
            Join thousands of users who are already taking control of their health with AI-powered insights and
            personalized guidance.
          </p>
          <Link href="/chat">
            <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700 px-6 sm:px-8 py-3 text-base sm:text-lg font-medium">
              Start Your Health Journey
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
