import { NextRequest, NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentName: string }> }
) {
  try {
    const { agentName } = await params
    
    if (!agentName) {
      return NextResponse.json({ error: "Agent name is required" }, { status: 400 })
    }

    // Construct the path to the prompt file
    const promptsDir = join(process.cwd(), "prompts")
    const promptFile = join(promptsDir, `${agentName}.md`)
    
    try {
      const content = readFileSync(promptFile, "utf-8")
      return new NextResponse(content, {
        headers: {
          "Content-Type": "text/plain",
        },
      })
    } catch (fileError) {
      console.error(`Prompt file not found: ${promptFile}`)
      return NextResponse.json(
        { error: `Prompt file not found for agent: ${agentName}` },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error("Error serving agent prompt:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
