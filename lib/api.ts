const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"


const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken")
  }
  return null
}


const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken()

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Network error" }))
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}


export const authAPI = {
  register: (userData: {
    name: string
    email: string
    password: string
    role?: string
    phone?: string
    address?: string
  }) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  login: (credentials: { email: string; password: string }) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  getMe: () => apiRequest("/auth/me"),

  forgotPassword: (email: string) =>
    apiRequest("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    apiRequest(`/auth/reset-password/${token}`, {
      method: "PUT",
      body: JSON.stringify({ password }),
    }),

  updatePassword: (currentPassword: string, newPassword: string) =>
    apiRequest("/auth/update-password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  logout: () => apiRequest("/auth/logout", { method: "POST" }),
}


export const usersAPI = {
  getAll: (params?: {
    page?: number
    limit?: number
    role?: string
    verified?: boolean
    search?: string
  }) => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }
    return apiRequest(`/users?${queryParams.toString()}`)
  },

  getById: (id: string) => apiRequest(`/users/${id}`),

  update: (
    id: string,
    userData: {
      name?: string
      phone?: string
      address?: string
      dateOfBirth?: string
      emergencyContact?: string
      role?: string
      verified?: boolean
      isActive?: boolean
    },
  ) =>
    apiRequest(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    }),

  delete: (id: string) => apiRequest(`/users/${id}`, { method: "DELETE" }),

  getStats: () => apiRequest("/users/admin/stats"),
}


export const productsAPI = {
  getAll: (params?: {
    page?: number
    limit?: number
    category?: string
    isRentable?: boolean
    condition?: string
    minPrice?: number
    maxPrice?: number
    search?: string
    sortBy?: string
  }) => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }
    return apiRequest(`/products?${queryParams.toString()}`)
  },

  getById: (id: string) => apiRequest(`/products/${id}`),

  create: (productData: {
    name: string
    description: string
    category: string
    subcategory?: string
    basePrice: number
    unit: string
    stock: number
    totalStock: number
    amenities?: string[]
    specifications?: Record<string, string>
    notes?: string
    condition: string
    location?: string
    tags?: string[]
    isRentable?: boolean
  }) =>
    apiRequest("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    }),

  update: (id: string, productData: any) =>
    apiRequest(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    }),

  delete: (id: string) => apiRequest(`/products/${id}`, { method: "DELETE" }),

  updateStock: (id: string, quantity: number, operation: "add" | "subtract" | "set") =>
    apiRequest(`/products/${id}/stock`, {
      method: "PATCH",
      body: JSON.stringify({ quantity, operation }),
    }),

  checkAvailability: (
    id: string,
    params?: {
      quantity?: number
      startDate?: string
      endDate?: string
    },
  ) => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }
    return apiRequest(`/products/${id}/availability?${queryParams.toString()}`)
  },

  getStats: () => apiRequest("/products/admin/stats"),
}


export const bookingsAPI = {
  getAll: (params?: {
    page?: number
    limit?: number
    status?: string
    paymentStatus?: string
    startDate?: string
    endDate?: string
  }) => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }
    return apiRequest(`/bookings?${queryParams.toString()}`)
  },

  getById: (id: string) => apiRequest(`/bookings/${id}`),

  create: (bookingData: {
    product: string
    startDate: string
    endDate: string
    quantity: number
    notes?: string
    pickupLocation?: string
    returnLocation?: string
  }) =>
    apiRequest("/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    }),

  update: (
    id: string,
    bookingData: {
      status?: string
      paymentStatus?: string
      staffAssigned?: string
      notes?: string
      returnNotes?: string
    },
  ) =>
    apiRequest(`/bookings/${id}`, {
      method: "PUT",
      body: JSON.stringify(bookingData),
    }),

  cancel: (id: string, reason?: string) =>
    apiRequest(`/bookings/${id}/cancel`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),

  getStats: () => apiRequest("/bookings/admin/stats"),
}


export const categoriesAPI = {
  getAll: (params?: {
    page?: number
    limit?: number
    parentId?: string | null
  }) => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value === null ? "null" : value.toString())
        }
      })
    }
    return apiRequest(`/categories?${queryParams.toString()}`)
  },

  getById: (id: string) => apiRequest(`/categories/${id}`),

  create: (categoryData: {
    name: string
    description?: string
    image?: string
    parentId?: string
    sortOrder?: number
  }) =>
    apiRequest("/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    }),

  update: (id: string, categoryData: any) =>
    apiRequest(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    }),

  delete: (id: string) => apiRequest(`/categories/${id}`, { method: "DELETE" }),

  getTree: () => apiRequest("/categories/admin/tree"),
}


export const notificationsAPI = {
  getAll: (params?: {
    page?: number
    limit?: number
    isRead?: boolean
    type?: string
  }) => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }
    return apiRequest(`/notifications?${queryParams.toString()}`)
  },

  markAsRead: (id: string) => apiRequest(`/notifications/${id}/read`, { method: "PATCH" }),

  markAllAsRead: () => apiRequest("/notifications/read-all", { method: "PATCH" }),

  delete: (id: string) => apiRequest(`/notifications/${id}`, { method: "DELETE" }),

  create: (notificationData: {
    userId: string
    title: string
    message: string
    type?: string
    actionUrl?: string
    metadata?: any
  }) =>
    apiRequest("/notifications", {
      method: "POST",
      body: JSON.stringify(notificationData),
    }),
}


export const tokenManager = {
  setToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token)
    }
  },

  getToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken")
    }
    return null
  },

  removeToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken")
    }
  },

  isTokenExpired: (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      return payload.exp * 1000 < Date.now()
    } catch {
      return true
    }
  },
}


export const handleAPIError = (error: any) => {
  console.error("API Error:", error)

  if (error.message.includes("401")) {

    tokenManager.removeToken()
    window.location.href = "/auth/login"
    return "Session expired. Please login again."
  }

  if (error.message.includes("403")) {
    return "You do not have permission to perform this action."
  }

  if (error.message.includes("404")) {
    return "The requested resource was not found."
  }

  if (error.message.includes("500")) {
    return "Server error. Please try again later."
  }

  return error.message || "An unexpected error occurred."
}
