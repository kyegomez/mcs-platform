import { Loader2, Stethoscope, Brain, Pill, Users } from "lucide-react"

interface GroupChatLoadingProps {
  isVisible: boolean
}

const medicalAgents = [
  {
    name: "Medical Diagnoser",
    icon: <Stethoscope className="h-4 w-4" />,
    iconColor: "#3B82F6",
    description: "Analyzing symptoms and generating differential diagnoses...",
  },
  {
    name: "Medical Verifier",
    icon: <Brain className="h-4 w-4" />,
    iconColor: "#10B981",
    description: "Validating diagnostic conclusions and cross-checking...",
  },
  {
    name: "Treatment Specialist",
    icon: <Pill className="h-4 w-4" />,
    iconColor: "#F59E0B",
    description: "Developing comprehensive treatment plans...",
  },
]

export function GroupChatLoading({ isVisible }: GroupChatLoadingProps) {
  if (!isVisible) return null

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 mb-4 animate-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-primary/20 border-2 border-primary/30">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full status-online border-2 border-black"></div>
        </div>
        <div>
          <h3 className="font-medium text-foreground">Medical Team Working</h3>
          <p className="text-sm text-muted-foreground">Our specialists are collaborating on your case...</p>
        </div>
      </div>

      <div className="space-y-3">
        {medicalAgents.map((agent, index) => (
          <div
            key={agent.name}
            className="flex items-center gap-3 p-3 bg-background/30 rounded-lg animate-in slide-in-from-left-2 duration-500"
            style={{ animationDelay: `${index * 0.3}s` }}
          >
            <div className="flex-shrink-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center animate-pulse"
                style={{ 
                  backgroundColor: agent.iconColor + "20",
                  animationDelay: `${index * 0.2}s`
                }}
              >
                <div style={{ color: agent.iconColor }}>
                  {agent.icon}
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-foreground">{agent.name}</span>
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">{agent.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>This may take a moment as our specialists work together...</span>
        </div>
      </div>
    </div>
  )
} 