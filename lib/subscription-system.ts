export interface SubscriptionTier {
  id: "free" | "premium" | "family"
  name: string
  price: {
    monthly: number
    annual: number
  }
  features: string[]
  limits: {
    conversations: number
    specialists: number
    features: string[]
  }
}

export const subscriptionTiers: SubscriptionTier[] = [
  {
    id: "free",
    name: "Free",
    price: {
      monthly: 0,
      annual: 0,
    },
    features: ["15 conversations per month", "Basic health tracking", "Notes and reminders", "Basic AI assistant"],
    limits: {
      conversations: 15,
      specialists: 1,
      features: ["basic-chat", "notes", "reminders"],
    },
  },
  {
    id: "premium",
    name: "Premium",
    price: {
      monthly: 7.99,
      annual: 79.99,
    },
    features: [
      "Unlimited conversations",
      "All AI specialists",
      "Advanced health analytics",
      "Priority support",
      "Voice input",
      "Goal tracking",
      "Custom reminders",
    ],
    limits: {
      conversations: -1, // unlimited
      specialists: -1, // unlimited
      features: ["all"],
    },
  },
  {
    id: "family",
    name: "Family",
    price: {
      monthly: 12.99,
      annual: 129.99,
    },
    features: [
      "Up to 6 family members",
      "All Premium features",
      "Family health dashboard",
      "Shared health goals",
      "Priority family support",
      "Family analytics",
    ],
    limits: {
      conversations: -1, // unlimited
      specialists: -1, // unlimited
      features: ["all", "family"],
    },
  },
]

export interface UserSubscription {
  tier: "free" | "premium" | "family"
  isActive: boolean
  conversationsUsed: number
  conversationsLimit: number
  renewalDate?: Date
  billingCycle?: "monthly" | "annual"
  familyMembers?: number
}

export function getUserSubscription(): UserSubscription {
  try {
    const saved = localStorage.getItem("mcs-subscription")
    if (saved) {
      const parsed = JSON.parse(saved)
      // Convert date strings back to Date objects
      if (parsed.renewalDate) {
        parsed.renewalDate = new Date(parsed.renewalDate)
      }
      return parsed
    }
  } catch (error) {
    console.error("Error loading subscription:", error)
  }

  // Default free subscription
  return {
    tier: "free",
    isActive: true,
    conversationsUsed: 0,
    conversationsLimit: 15,
  }
}

export function updateUserSubscription(subscription: UserSubscription): void {
  try {
    localStorage.setItem("mcs-subscription", JSON.stringify(subscription))
    // Dispatch event for other components to listen
    window.dispatchEvent(new CustomEvent("subscriptionUpdated", { detail: subscription }))
  } catch (error) {
    console.error("Error saving subscription:", error)
  }
}

export function incrementConversationUsage(): void {
  const subscription = getUserSubscription()
  if (subscription.conversationsLimit > 0 && subscription.conversationsUsed < subscription.conversationsLimit) {
    subscription.conversationsUsed += 1
    updateUserSubscription(subscription)
  }
}

export function canStartConversation(): boolean {
  const subscription = getUserSubscription()
  return subscription.conversationsLimit === -1 || subscription.conversationsUsed < subscription.conversationsLimit
}

export function getUsagePercentage(): number {
  const subscription = getUserSubscription()
  if (subscription.conversationsLimit === -1) return 0 // unlimited
  return (subscription.conversationsUsed / subscription.conversationsLimit) * 100
}

export function getRemainingConversations(): number {
  const subscription = getUserSubscription()
  if (subscription.conversationsLimit === -1) return -1 // unlimited
  return Math.max(0, subscription.conversationsLimit - subscription.conversationsUsed)
}
