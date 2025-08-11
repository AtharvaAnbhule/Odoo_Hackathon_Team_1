import { generateText } from "ai"
import { cohere } from "@ai-sdk/cohere"

export async function POST(request: Request) {
  try {
    const { message, context, equipment } = await request.json()

    if (!message || typeof message !== "string") {
      return Response.json({ error: "Message is required and must be a string" }, { status: 400 })
    }

    const equipmentList =
      equipment
        ?.map(
          (item: any) =>
            `${item.name}: ${item.price} (${item.available ? "Available" : "Booked"}) - ${item.description}`,
        )
        .join("\n") || ""

    const { text } = await generateText({
      model: cohere("command-r-plus"),
      prompt: `You are an advanced AI rental booking assistant for a premium equipment rental company in India. 

CONTEXT: ${context || "New conversation"}

AVAILABLE EQUIPMENT:
${equipmentList}

CAPABILITIES:
- Equipment availability and pricing (use ₹ for Indian Rupees)
- Booking procedures and policies
- Equipment recommendations based on needs
- Rental duration calculations
- Return policies and damage procedures
- Technical specifications and usage tips
- Delivery and pickup arrangements

PERSONALITY:
- Professional yet friendly and conversational
- Proactive in offering suggestions
- Detail-oriented but concise for voice responses
- Helpful with follow-up questions

RESPONSE FORMAT:
- Keep responses under 100 words for voice clarity
- Provide specific, actionable information
- Include relevant follow-up suggestions when appropriate
- Use natural, conversational language

Customer question: ${message}

Provide a helpful response with 2-3 relevant follow-up suggestions:`,
      maxOutputTokens: 200,
    })


    const suggestions = []
    if (text.toLowerCase().includes("available")) {
      suggestions.push("Book this equipment", "Check pricing details", "Ask about delivery")
    } else if (text.toLowerCase().includes("price") || text.toLowerCase().includes("₹")) {
      suggestions.push("Calculate total cost", "Check availability", "Compare alternatives")
    } else if (text.toLowerCase().includes("book")) {
      suggestions.push("Confirm booking", "Add more items", "Check policies")
    } else {
      suggestions.push("Show equipment list", "Check availability", "Get pricing info")
    }

    // Generate conversation summary for context
    const summary = `User asked about: ${message}. AI provided information about rental services.`

    return Response.json({
      response: text,
      suggestions: suggestions.slice(0, 3),
      summary,
    })
  } catch (error) {
    console.error("Error in assistant API:", error)
    return Response.json(
      {
        error: "Failed to generate AI response",
        response: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        suggestions: ["Try again", "Contact support", "Check connection"],
      },
      { status: 500 },
    )
  }
}
