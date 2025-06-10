"use client"

import { useState } from "react"
import { agents } from "@/data/agents"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AgentIcon } from "@/components/agent-icon"
import { Search } from "lucide-react"
import Head from "next/head"

export default function ChatIndexPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.specialty.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <>
      <Head>
        <title>AI Medical Specialists | Chat with Healthcare Experts | MCS</title>
        <meta
          name="description"
          content="Connect with AI-powered medical specialists instantly. Get expert healthcare advice from cardiologists, dermatologists, psychiatrists, and more. Available 24/7."
        />
        <meta
          name="keywords"
          content="AI medical specialists, online doctor consultation, telemedicine, virtual healthcare, medical advice, AI doctor chat"
        />
        <link rel="canonical" href="https://mcs-health.vercel.app/chat" />
      </Head>

      <div className="max-w-4xl mx-auto space-y-6 px-4">
        {/* Simple Header */}
        <header className="text-center pt-8 pb-4">
          <h1 className="text-3xl font-light text-white mb-2">Choose a Specialist</h1>
          <p className="text-gray-400 font-light">Get expert medical advice instantly</p>
        </header>

        {/* Simple Search */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search specialists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 focus-visible:ring-mcs-blue focus-visible:border-mcs-blue/50 rounded-xl text-white placeholder:text-gray-400"
            aria-label="Search medical specialists"
          />
        </div>

        {/* Specialists Grid */}
        <section
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          aria-label="Medical Specialists Directory"
        >
          {filteredAgents.map((agent) => (
            <Link
              key={agent.id}
              href={`/chat/${agent.id}`}
              aria-label={`Consult with ${agent.name}, ${agent.specialty} specialist`}
            >
              <Card className="group cursor-pointer border-0 bg-white/5 hover:bg-white/10 transition-all duration-200 h-full">
                <CardContent className="p-6">
                  <article className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                      style={{
                        backgroundColor: agent.iconColor + "20",
                      }}
                    >
                      <AgentIcon iconName={agent.icon} iconColor={agent.iconColor} size="md" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-medium text-white group-hover:text-mcs-blue transition-colors mb-1">
                        {agent.name}
                      </h2>
                      <p className="text-sm text-gray-400 font-light mb-2">{agent.specialty}</p>
                      <p className="text-xs text-gray-500 font-light line-clamp-2">{agent.description}</p>
                    </div>
                  </article>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>

        {filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 font-light">No specialists found</p>
          </div>
        )}
      </div>
    </>
  )
}
