"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { runHealthcareSwarm } from "@/lib/swarms-swarm-api"
import { agents } from "@/data/agents"
import { Loader2 } from "lucide-react"

export function HealthAnalysisSwarm() {
  const [query, setQuery] = useState("")
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || loading) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Select a subset of agents for the swarm (e.g., 3 relevant specialists)
      const selectedAgents = [
        agents.find((a) => a.id === "cardio-specialist"),
        agents.find((a) => a.id === "nutrition-specialist"),
        agents.find((a) => a.id === "mental-specialist"),
      ].filter(Boolean)

      const response = await runHealthcareSwarm(selectedAgents, query)

      // Format and display the result
      if (response && response.processedOutput) {
        setResult(response.processedOutput)
      } else if (response && response.outputs && Array.isArray(response.outputs) && response.outputs.length > 0) {
        // Get the last output from the array, which should contain the actual response
        const lastOutput = response.outputs[response.outputs.length - 1]
        setResult(lastOutput?.content || "No content found in response")
      } else {
        setResult("Received response but no output data was found.")
      }
    } catch (err) {
      console.error("Error running health analysis swarm:", err)
      setError(err instanceof Error ? `Error: ${err.message}` : "Failed to get analysis. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-black border-mcs-gray">
      <CardHeader>
        <CardTitle className="text-xl">Health Analysis Swarm</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Describe your health concern or ask a complex health question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={4}
            className="resize-none bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
          />
          <Button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-mcs-blue hover:bg-mcs-blue-light text-white w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Run Health Analysis"
            )}
          </Button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-md text-red-400">{error}</div>
        )}

        {result && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Analysis Results:</h3>
            <div className="p-4 bg-mcs-gray/30 rounded-md overflow-auto max-h-96">
              <div className="text-sm whitespace-pre-wrap">{result}</div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-mcs-gray-light">
        This analysis uses multiple healthcare specialists working together to provide comprehensive insights.
      </CardFooter>
    </Card>
  )
}
