import { agents } from "@/data/agents"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export default function ChatIndexPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Chat with Specialists</h1>
        <p className="text-mcs-gray-light">Select a healthcare specialist to start a conversation.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Link key={agent.id} href={`/chat/${agent.id}`}>
            <Card className="h-full overflow-hidden transition-all duration-200 hover:border-mcs-blue hover:shadow-[0_0_15px_rgba(0,112,243,0.15)] bg-black border-mcs-gray">
              <CardHeader className="pb-2 flex flex-row items-center gap-4">
                <div className="relative h-12 w-12 rounded-full overflow-hidden">
                  <Image src={agent.avatar || "/placeholder.svg"} alt={agent.name} fill className="object-cover" />
                </div>
                <div>
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                  <p className="text-sm text-mcs-blue">{agent.specialty}</p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-mcs-gray-light">{agent.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
