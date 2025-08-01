import { Loader2, Users } from "lucide-react"

export default function GroupChatLoading() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Users className="h-8 w-8 animate-pulse text-primary mr-2" />
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <p className="text-muted-foreground">Loading medical group consultation...</p>
      </div>
    </div>
  )
} 