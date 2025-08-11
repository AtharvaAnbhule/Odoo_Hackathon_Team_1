import { generateText } from "ai"
import { cohere } from "@ai-sdk/cohere"

export async function POST(request: Request) {
    try {
        const { message, context, history } = await request.json()

        if (!message || typeof message !== "string") {
            return Response.json({ error: "Message is required and must be a string" }, { status: 400 })
        }


        const conversationHistory =
            history
                ?.slice(-6)
                ?.map((msg: any) => `${msg.type.toUpperCase()}: ${msg.content}`)
                .join("\n") || ""

        const { text, usage } = await generateText({
            model: cohere("command-r-plus"),
            prompt: `You are an advanced AI rental assistant with a warm, professional personality. You specialize in equipment rentals in India.

PERSONALITY TRAITS:
- Friendly, helpful, and conversational
- Proactive in offering suggestions
- Detail-oriented but concise
- Empathetic and understanding
- Professional yet approachable

CAPABILITIES:
- Equipment availability and pricing (use ₹ for Indian Rupees)
- Booking procedures and policies
- Equipment recommendations based on needs
- Technical specifications and usage tips
- Delivery and pickup arrangements
- Damage policies and insurance
- Rental duration calculations
- Alternative suggestions

CONVERSATION CONTEXT: ${context || "New conversation"}

RECENT CONVERSATION:
${conversationHistory}

RESPONSE GUIDELINES:
- Keep responses conversational and natural
- Provide specific, actionable information
- Use emojis sparingly but effectively
- Ask follow-up questions when appropriate
- Offer alternatives and suggestions
- Be empathetic to customer needs
- Maintain context from previous messages

CURRENT EQUIPMENT INVENTORY:
- DSLR Cameras: ₹1,500-2,500/day (Canon, Nikon available)
- Video Cameras: ₹2,000-3,500/day (4K recording capability)
- Projectors: ₹1,200-2,000/day (HD and 4K options)
- Laptops: ₹800-1,500/day (Gaming and business models)
- Audio Systems: ₹600-1,200/day (Wireless and wired options)
- Lighting Equipment: ₹400-800/day (LED panels and softboxes)
- Tripods & Accessories: ₹200-500/day

Customer message: ${message}

Provide a helpful, conversational response:`,
            maxOutputTokens: 250,
        })


        const suggestions = []
        const lowerText = text.toLowerCase()

        if (lowerText.includes("available") || lowerText.includes("camera")) {
            suggestions.push("Show me pricing", "Book this item", "Check alternatives")
        } else if (lowerText.includes("price") || lowerText.includes("₹")) {
            suggestions.push("Calculate total cost", "Book now", "Compare options")
        } else if (lowerText.includes("book") || lowerText.includes("reserve")) {
            suggestions.push("Confirm booking", "Add more items", "Check policies")
        } else if (lowerText.includes("policy") || lowerText.includes("return")) {
            suggestions.push("Damage policy", "Cancellation terms", "Insurance options")
        } else {
            suggestions.push("Show equipment", "Get pricing", "Book rental", "Ask question")
        }


        const newContext = `Customer inquired about: ${message}. AI provided information about rental services. Context: equipment rental assistance.`


        const confidence = text.length > 50 && text.includes("₹") ? 0.95 : 0.85

        return Response.json({
            response: text,
            suggestions: suggestions.slice(0, 3),
            context: newContext,
            confidence,
            tokens: usage?.totalTokens || 0,
        })
    } catch (error) {
        console.error("Error in chatbot API:", error)
        return Response.json(
            {
                error: "Failed to generate AI response",
                response:
                    "I apologize, but I'm experiencing some technical difficulties right now. Please try again in a moment, or feel free to contact our support team for immediate assistance.",
                suggestions: ["Try again", "Contact support", "Check connection"],
                confidence: 0.5,
            },
            { status: 500 },
        )
    }
}
