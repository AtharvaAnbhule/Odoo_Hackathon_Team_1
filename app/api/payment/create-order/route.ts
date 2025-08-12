import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = "INR" } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }


    const mockOrder = {
      id: `order_${Date.now()}`,
      entity: "order",
      amount: amount,
      amount_paid: 0,
      amount_due: amount,
      currency: currency,
      receipt: `receipt_${Date.now()}`,
      status: "created",
      created_at: Math.floor(Date.now() / 1000),
    }

    return NextResponse.json(mockOrder)
  } catch (error) {
    console.error("Error creating Razorpay order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
