import { agents } from "@/data/agents"
import type { Agent } from "@/types/agent"

export function getAgent(agentId: string): Agent | undefined {
  return agents.find((agent) => agent.id === agentId)
}

export function getAllAgents(): Agent[] {
  return agents
}

export function getAgentsBySpecialty(specialty: string): Agent[] {
  return agents.filter((agent) => agent.specialty.toLowerCase().includes(specialty.toLowerCase()))
}

export function searchAgents(query: string): Agent[] {
  const searchTerm = query.toLowerCase()
  return agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchTerm) ||
      agent.specialty.toLowerCase().includes(searchTerm) ||
      agent.description.toLowerCase().includes(searchTerm),
  )
}
