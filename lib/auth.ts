export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "customer" | "staff"
  profilePicture?: string
  phone?: string
  verified: boolean
  createdAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

// Dummy users for testing
export const DUMMY_USERS: User[] = [
  {
    id: "1",
    email: "admin@rental.com",
    name: "Admin User",
    role: "admin",
    verified: true,
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    email: "customer@rental.com",
    name: "John Customer",
    role: "customer",
    verified: true,
    createdAt: "2024-01-02",
  },
  {
    id: "3",
    email: "staff@rental.com",
    name: "Jane Staff",
    role: "staff",
    verified: true,
    createdAt: "2024-01-03",
  },
]

// Dummy password for all users: password123
export const DUMMY_PASSWORD = "password123"
