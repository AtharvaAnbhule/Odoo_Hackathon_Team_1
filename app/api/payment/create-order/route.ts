import { type NextRequest, NextResponse } from "next/server"

// In a real application, you would use the actual Razorpay SDK
// For demo purposes, we'll simulate the order creation

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = "INR" } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // In a real app, you would create an order using Razorpay SDK:
    // const razorpay = new Razorpay({
    //   key_id: process.env.RAZORPAY_KEY_ID,
    //   key_secret: process.env.RAZORPAY_KEY_SECRET,
    // })
    //
    // const order = await razorpay.orders.create({
    //   amount: amount,
    //   currency: currency,
    //   receipt: `receipt_${Date.now()}`,
    // })

    // For demo purposes, return a mock order
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
