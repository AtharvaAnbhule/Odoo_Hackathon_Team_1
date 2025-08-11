"use client"

declare global {
  interface Window {
    Razorpay: any
  }
}

export interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: any) => void
  prefill: {
    name: string
    email: string
    contact: string
  }
  theme: {
    color: string
  }
  modal: {
    ondismiss: () => void
  }
}

export const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export const createRazorpayOrder = async (amount: number, currency = "INR") => {
  try {
    // In a real app, this would call your backend API
    const response = await fetch("/api/payment/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to create order")
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating Razorpay order:", error)
    // For demo purposes, return a mock order
    return {
      id: `order_${Date.now()}`,
      amount: amount * 100,
      currency,
    }
  }
}

export const initiateRazorpayPayment = async (options: Partial<RazorpayOptions>) => {
  const isLoaded = await loadRazorpay()

  if (!isLoaded) {
    throw new Error("Razorpay SDK failed to load")
  }

  const defaultOptions: RazorpayOptions = {
    key: "rzp_test_kl4PyxIdzr1SK3", // Demo key
    amount: 0,
    currency: "INR",
    name: "RentalPro",
    description: "Rental Payment",
    order_id: "",
    handler: () => { },
    prefill: {
      name: "",
      email: "",
      contact: "",
    },
    theme: {
      color: "#3B82F6",
    },
    modal: {
      ondismiss: () => {
        console.log("Payment modal dismissed")
      },
    },
  }

  const razorpayOptions = { ...defaultOptions, ...options }
  const razorpay = new window.Razorpay(razorpayOptions)
  razorpay.open()
}
