export async function streamMedicalGroupChat(
  task: string, 
  history: Array<{ role: string; content: string }>, 
  selectedModel?: string,
  onAgentStart?: (agentName: string) => void,
  onAgentComplete?: (agentName: string, content: string) => void,
  onToken?: (agentName: string, token: string) => void
) {
  try {
    // History is already formatted correctly
    const historyFormatted = history.filter((msg) => msg.content.trim() !== "")

    const payload = {
      name: "Interactive Medical Consultation Swarm",
      description: "A collaborative medical consultation system where specialized agents work together to provide comprehensive patient care through interactive discussion.",
      swarm_type: "SequentialWorkflow",
      task: task,
      messages: historyFormatted,
      agents: [
        {
          agent_name: "Medical Diagnoser",
          description: "Specializes in comprehensive medical diagnosis and differential diagnosis",
          system_prompt: `You are a Medical Diagnoser with expertise in comprehensive medical diagnosis and differential diagnosis.
          
          You are part of a collaborative medical team that includes:
          - Medical Diagnoser (you): Analyze symptoms and create differential diagnoses
          - Medical Verifier: Will review and validate your diagnostic conclusions
          - Treatment Specialist: Will develop treatment plans based on verified diagnoses
          
          Your role is to:
          - Analyze patient symptoms, vital signs, and medical history
          - Generate comprehensive differential diagnoses
          - Consider both common and rare conditions
          - Evaluate the likelihood of each potential diagnosis
          - Identify red flags and urgent conditions
          - Consider the patient's risk factors and comorbidities
          
          IMPORTANT: Acknowledge that your analysis will be reviewed by the Medical Verifier and used by the Treatment Specialist. Provide clear, well-structured diagnostic reasoning that can be easily validated and built upon by your colleagues.
          
          Focus on evidence-based diagnostic reasoning and clinical decision-making.
          Provide clear rationale for your diagnostic considerations and prioritize diagnoses by probability and urgency.`,
          model_name: selectedModel || "gpt-4o",
          role: "worker",
          max_loops: 1,
          max_tokens: 8192,
          temperature: 0.3,
          auto_generate_prompt: false,
        },
        {
          agent_name: "Medical Verifier",
          description: "Validates and cross-checks diagnostic conclusions and treatment plans",
          system_prompt: `You are a Medical Verifier who validates and cross-checks diagnostic conclusions and treatment plans.
          
          You are part of a collaborative medical team that includes:
          - Medical Diagnoser: Has provided initial diagnostic analysis
          - Medical Verifier (you): Review and validate diagnostic conclusions
          - Treatment Specialist: Will develop treatment plans based on your verification
          
          Your role is to:
          - Review and validate the Medical Diagnoser's diagnostic reasoning
          - Cross-check differential diagnoses for completeness and accuracy
          - Verify that all relevant conditions have been considered
          - Ensure diagnostic conclusions are supported by evidence
          - Identify potential diagnostic errors or oversights
          - Validate the appropriateness of proposed treatments
          - Check for contraindications and safety concerns
          
          IMPORTANT: Acknowledge the Medical Diagnoser's work and provide feedback on their analysis. Your verification will directly inform the Treatment Specialist's recommendations. Work collaboratively to ensure the highest quality of care.
          
          Focus on quality assurance and patient safety.
          Provide constructive feedback and suggest additional considerations when needed.`,
          model_name: selectedModel || "gpt-4o",
          role: "worker",
          max_loops: 1,
          max_tokens: 8192,
          temperature: 0.3,
          auto_generate_prompt: false,
        },
        {
          agent_name: "Treatment Specialist",
          description: "Provides comprehensive treatment solutions and management plans",
          system_prompt: `You are a Treatment Specialist who provides comprehensive treatment solutions and management plans.
          
          You are part of a collaborative medical team that includes:
          - Medical Diagnoser: Has provided initial diagnostic analysis
          - Medical Verifier: Has validated and verified the diagnostic conclusions
          - Treatment Specialist (you): Develop treatment plans based on verified diagnoses
          
          Your role is to:
          - Review the Medical Diagnoser's analysis and Medical Verifier's validation
          - Develop evidence-based treatment plans based on the verified diagnoses
          - Recommend appropriate medications, dosages, and monitoring
          - Consider both pharmacological and non-pharmacological interventions
          - Address acute symptoms and long-term management
          - Provide lifestyle modification recommendations
          - Consider patient preferences, compliance, and accessibility
          - Develop follow-up and monitoring protocols
          - Coordinate multidisciplinary care when needed
          
          IMPORTANT: Acknowledge the work of both the Medical Diagnoser and Medical Verifier. Build upon their collaborative analysis to create comprehensive treatment plans. Your recommendations should reflect the validated diagnostic conclusions from your colleagues.
          
          Focus on practical, implementable treatment solutions that optimize patient outcomes.
          Ensure treatments are safe, effective, and tailored to the individual patient.`,
          model_name: selectedModel || "gpt-4o",
          role: "worker",
          max_loops: 1,
          max_tokens: 8192,
          temperature: 0.3,
          auto_generate_prompt: false,
        },
      ],
      max_loops: 1,
      rules: `Medical Consultation Rules:
      1. Always prioritize patient safety and evidence-based medicine
      2. Each specialist should contribute their unique expertise while collaborating with others
      3. Acknowledge and build upon the work of previous specialists in the workflow
      4. Consider the patient's complete medical history and current medications
      5. Provide clear, actionable recommendations that can be implemented
      6. Address both immediate concerns and long-term management
      7. Ensure all recommendations are practical and consider patient compliance
      8. Maintain professional medical communication throughout the discussion
      9. Consider cost-effectiveness and accessibility of recommended treatments
      10. Document key decision points and rationale for recommendations
      11. Ensure follow-up and monitoring plans are clearly defined
      12. Work as a cohesive team - each specialist should reference and acknowledge the contributions of their colleagues`,
    }

    const response = await fetch("/api/swarm/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(`API error: ${response.status} - ${errorData.error || "Unknown error"}`)
    }

    const data = await response.json()

    // Simulate streaming for each agent
    if (data && data.output && Array.isArray(data.output)) {
      const agentOutputs = data.output
      
      for (const output of agentOutputs) {
        const agentName = output.role
        const content = output.content
        
        // Notify that agent is starting
        if (onAgentStart) {
          onAgentStart(agentName)
        }
        
        // Simulate streaming by sending tokens
        if (onToken && content) {
          const words = content.split(' ')
          for (const word of words) {
            await new Promise(resolve => setTimeout(resolve, 50)) // 50ms delay between words
            onToken(agentName, word + ' ')
          }
        }
        
        // Notify that agent is complete
        if (onAgentComplete) {
          onAgentComplete(agentName, content)
        }
      }
    }

    return data
  } catch (error) {
    console.error("Error streaming medical groupchat:", error)
    throw error
  }
} 