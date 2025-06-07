"use client"

import {
  Heart,
  Shield,
  Brain,
  Zap,
  Wind,
  Activity,
  Bone,
  Smile,
  ShieldCheck,
  Apple,
  Sparkles,
  Users,
  Baby,
  Dumbbell,
  Siren,
  Eye,
  Droplets,
  Droplet,
  Bug,
  Flower,
  Stethoscope,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AgentIconProps {
  iconName: string
  iconColor: string
  size?: "sm" | "md" | "lg"
  className?: string
}

// Map of icon names to Lucide React components
const iconMap = {
  Heart,
  Shield,
  Brain,
  Zap,
  Wind,
  Activity,
  Bone,
  Smile,
  ShieldCheck,
  Apple,
  Sparkles,
  Users,
  Baby,
  Dumbbell,
  Siren,
  Eye,
  Droplets,
  Droplet,
  Bug,
  Flower,
  Stethoscope, // Fallback icon
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
}

export function AgentIcon({ iconName, iconColor, size = "md", className }: AgentIconProps) {
  // Get the icon component, fallback to Stethoscope if not found
  const IconComponent = iconMap[iconName as keyof typeof iconMap] || Stethoscope

  return <IconComponent className={cn(sizeClasses[size], className)} style={{ color: iconColor }} />
}
