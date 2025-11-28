import { NextRequest, NextResponse } from "next/server"

// Available medical specialists with their specialties and descriptions
const AVAILABLE_AGENTS = [
  {
    name: "dr-cardio-cardiovascular-health",
    specialty: "Cardiovascular Health",
    description: "Heart disease, hypertension, cholesterol, cardiac rehabilitation, chest pain, heart attacks, arrhythmias"
  },
  {
    name: "dr-mental-mental-health", 
    specialty: "Mental Health",
    description: "Anxiety, depression, stress management, trauma, mood disorders, psychological wellbeing, sleep disorders"
  },
  {
    name: "dr-derm-dermatology",
    specialty: "Dermatology", 
    description: "Skin conditions, rashes, acne, eczema, psoriasis, moles, skin cancer screening, wound care"
  },
  {
    name: "dr-endo-endocrinology",
    specialty: "Endocrinology",
    description: "Diabetes, thyroid disorders, hormonal imbalances, metabolism, weight management, insulin resistance"
  },
  {
    name: "dr-gastro-gastroenterology", 
    specialty: "Gastroenterology",
    description: "Digestive issues, stomach pain, nausea, diarrhea, constipation, IBS, acid reflux, liver problems"
  },
  {
    name: "dr-neuro-neurology",
    specialty: "Neurology",
    description: "Headaches, migraines, seizures, memory problems, dizziness, numbness, neurological symptoms"
  },
  {
    name: "dr-ortho-orthopedics",
    specialty: "Orthopedics", 
    description: "Joint pain, back pain, fractures, sports injuries, arthritis, bone health, muscle strains"
  },
  {
    name: "dr-pulmo-pulmonology",
    specialty: "Pulmonology",
    description: "Breathing problems, cough, asthma, COPD, lung infections, shortness of breath, chest congestion"
  },
  {
    name: "dr-geri-geriatrics",
    specialty: "Geriatrics",
    description: "Age-related health issues, medication management, cognitive decline, mobility problems, elderly care"
  },
  {
    name: "dr-pedia-pediatrics", 
    specialty: "Pediatrics",
    description: "Child health, infant care, developmental milestones, childhood illnesses, vaccinations, growth concerns"
  },
  {
    name: "dr-repro-reproductive-health",
    specialty: "Reproductive Health",
    description: "Pregnancy, fertility, menstrual issues, contraception, sexual health, reproductive concerns"
  },
  {
    name: "dr-emergency-emergency-medicine",
    specialty: "Emergency Medicine",
    description: "Urgent symptoms, severe pain, injuries, poisoning, allergic reactions, emergency situations"
  },
  {
    name: "dr-nutrition-nutritional-health",
    specialty: "Nutritional Health", 
    description: "Diet planning, nutritional deficiencies, weight management, eating disorders, food allergies"
  },
  {
    name: "dr-sports-sports-medicine",
    specialty: "Sports Medicine",
    description: "Athletic injuries, exercise physiology, performance optimization, recovery, sports-related health"
  },
  {
    name: "dr-allergy-allergy-immunology",
    specialty: "Allergy & Immunology", 
    description: "Allergic reactions, food allergies, environmental allergies, immune system disorders, asthma"
  },
  {
    name: "dr-behavioral-behavioral-health",
    specialty: "Behavioral Health",
    description: "Behavioral disorders, addiction, substance use, behavioral therapy, habit formation"
  },
  {
    name: "dr-hema-hematology",
    specialty: "Hematology",
    description: "Blood disorders, anemia, clotting issues, blood cancers, bleeding disorders"
  },
  {
    name: "dr-immuno-immunology",
    specialty: "Immunology",
    description: "Immune system disorders, autoimmune diseases, immunodeficiency, immune responses"
  },
  {
    name: "dr-infectious-infectious-disease",
    specialty: "Infectious Disease",
    description: "Infections, viral diseases, bacterial infections, parasitic diseases, antimicrobial therapy"
  },
  {
    name: "dr-onco-oncology",
    specialty: "Oncology",
    description: "Cancer diagnosis, cancer treatment, tumor management, chemotherapy, radiation therapy"
  },
  {
    name: "dr-ophthal-ophthalmology",
    specialty: "Ophthalmology",
    description: "Eye problems, vision issues, eye diseases, glaucoma, cataracts, retinal disorders"
  },
  {
    name: "dr-pain-pain-management",
    specialty: "Pain Management",
    description: "Chronic pain, pain relief, pain therapy, fibromyalgia, nerve pain, pain medications"
  },
  {
    name: "dr-physicaltherapy-physical-therapy",
    specialty: "Physical Therapy",
    description: "Rehabilitation, mobility issues, physical recovery, exercise therapy, injury recovery"
  },
  {
    name: "dr-rheum-rheumatology",
    specialty: "Rheumatology",
    description: "Arthritis, joint diseases, autoimmune conditions, lupus, rheumatoid arthritis"
  },
  {
    name: "dr-uro-urology",
    specialty: "Urology",
    description: "Urinary system, kidney problems, bladder issues, prostate health, urological disorders"
  }
]

export async function POST(request: NextRequest) {
  try {
    const { userMessage, conversationHistory } = await request.json()
    console.log("Orchestrator received:", { userMessage, conversationHistory: conversationHistory?.length })

    if (!userMessage) {
      return NextResponse.json({ error: "User message is required" }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY not configured")
      return NextResponse.json({ error: "Anthropic API key not configured" }, { status: 500 })
    }

    // Create the orchestrator prompt for structured output
    const orchestratorPrompt = `You are a medical orchestrator AI that selects the most appropriate medical specialist for a patient's query.

Available Specialists:
${AVAILABLE_AGENTS.map(agent => 
  `- ${agent.name}: ${agent.specialty} - ${agent.description}`
).join('\n')}

Patient's Message: "${userMessage}"

${conversationHistory && conversationHistory.length > 0 ? 
  `Previous Conversation Context:\n${conversationHistory.map((msg: any) => 
    `${msg.role}: ${msg.content}`
  ).slice(-6).join('\n')}\n` : ''}

Instructions:
1. Analyze the patient's symptoms, concerns, or questions
2. Consider the conversation context if provided
3. Select the SINGLE most appropriate specialist from the list above
4. Provide your reasoning for the selection
5. Rate your confidence in the selection (0.0 to 1.0)
6. If multiple specialists could be relevant, choose the PRIMARY one based on the main concern
7. If the query is very general or unclear, choose "dr-emergency-emergency-medicine" as a safe default

You must respond with a JSON object containing:
- selectedAgent: the exact agent name from the list
- reasoning: brief explanation of your selection
- confidence: numerical confidence score (0.0 to 1.0)`

    // Define the JSON schema for structured output
    const agentSelectionSchema = {
      type: "object",
      properties: {
        selectedAgent: {
          type: "string",
          enum: AVAILABLE_AGENTS.map(agent => agent.name),
          description: "The selected medical specialist agent name"
        },
        reasoning: {
          type: "string",
          description: "Brief explanation of why this specialist was selected"
        },
        confidence: {
          type: "number",
          description: "Confidence score between 0 and 1"
        }
      },
      required: ["selectedAgent", "reasoning", "confidence"],
      additionalProperties: false
    }

    // Call Anthropic API with structured outputs
    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "structured-outputs-2025-11-13"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 300,
        temperature: 0.1,
        messages: [
          {
            role: "user",
            content: orchestratorPrompt
          }
        ],
        output_format: {
          type: "json_schema",
          schema: agentSelectionSchema
        }
      })
    })

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text()
      console.error("Anthropic API error:", anthropicResponse.status, errorText)
      throw new Error(`Anthropic API error: ${anthropicResponse.status} - ${errorText}`)
    }

    const response = await anthropicResponse.json()
    console.log("Anthropic response:", JSON.stringify(response, null, 2))
    
    const responseText = response.content?.[0]?.text || '{}'
    console.log("Response text:", responseText)
    
    const structuredOutput = JSON.parse(responseText)
    console.log("Structured output:", structuredOutput)
    
    const selectedAgent = structuredOutput.selectedAgent || ''

    // Validate that the selected agent exists (should always be valid with structured output)
    const agentExists = AVAILABLE_AGENTS.find(agent => agent.name === selectedAgent)
    
    if (!agentExists) {
      console.error(`Orchestrator selected invalid agent: ${selectedAgent}`)
      // Fallback to emergency medicine if somehow invalid
      return NextResponse.json({ 
        selectedAgent: "dr-emergency-emergency-medicine",
        agentInfo: AVAILABLE_AGENTS.find(agent => agent.name === "dr-emergency-emergency-medicine"),
        reasoning: "Fallback selection due to invalid orchestrator response",
        confidence: 0.5
      })
    }

    return NextResponse.json({ 
      selectedAgent,
      agentInfo: agentExists,
      reasoning: structuredOutput.reasoning || `Selected ${agentExists.specialty} specialist`,
      confidence: structuredOutput.confidence || 0.8
    })

  } catch (error) {
    console.error("Error in orchestrator:", error)
      return NextResponse.json(
        { 
          error: "Failed to select appropriate specialist",
          selectedAgent: "dr-emergency-emergency-medicine",
          agentInfo: AVAILABLE_AGENTS.find(agent => agent.name === "dr-emergency-emergency-medicine"),
          reasoning: "Fallback selection due to orchestrator error",
          confidence: 0.3
        }, 
        { status: 500 }
      )
  }
}
