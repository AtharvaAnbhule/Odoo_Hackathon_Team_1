# AI-Powered Rental Application

An AI-driven rental platform with an integrated voice assistant, built for the **Odoo Hackathon 2025**. This app enables customers to browse, compare, and rent products seamlessly — featuring an AI assistant that can listen, speak, and respond to queries in real time.

---

## 🚀 Features

### Frontend (Next.js + Tailwind CSS + Cohere AI)
- Modern, responsive UI with Tailwind CSS and shadcn/ui components
- **AI Voice Assistant**  
  - Speech-to-Text (via Web Speech API) for hands-free search  
  - Text-to-Speech for AI-driven responses  
  - Context-aware AI suggestions and prompts
- Product browsing & search with filters and categories
- Price Comparison AI — compares rental prices vs. market rates
- Dark Mode / Light Mode toggle
- Smart quick suggestions (delivery info, rental rates, availability)

### Backend (Node.js + Express + Odoo Integration)
- Product Management API — fetches live product listings from Odoo
- Order Management API — create, update, and track rental orders
- User Authentication — JWT-based login/signup for customers and admins
- AI Price Recommendation Endpoint — compares user price input against online data
- Speech-Driven Commands API — enables AI assistant to trigger backend actions (e.g., place orders, fetch products)

---

## 🛠️ Tech Stack

| Layer    | Technologies                              |
| -------- | --------------------------------------- |
| Frontend | Next.js (React), Tailwind CSS, shadcn/ui, Cohere AI API, Web Speech API (STT & TTS) |
| Backend  | Node.js, Express, PostgreSQL/MySQL, Odoo API Integration, JWT Authentication  |

---

## 📂 Project Structure


 rental-app/
├── frontend/ # Next.js AI-powered UI
│ ├── components/ # React components
│ ├── pages/ # Page routes
│ ├── styles/ # Tailwind & global styles
│ └── utils/ # Helper functions & API clients
├── backend/ # Node.js + Express backend
│ ├── routes/ # API endpoints
│ ├── controllers/ # Business logic
│ ├── models/ # Database models
│ └── config/ # Config files (DB, API keys, etc.)
└── README.md # Project documentation 





---

## ⚡ Getting Started

### Clone the repo
```bash
git clone https://github.com/AtharvaAnbhule/Odoo_Hackathon_Team_1.git
cd rental-app

Setup Backend
bash
Copy
Edit
cd backend
npm install
cp .env.example .env   # Add your database and API keys here
npm run dev
Setup Frontend
bash
Copy
Edit
cd ../frontend
npm install
cp .env.example .env   # Add your Cohere API key here
npm run dev
Access the App
Frontend: http://localhost:3000

Backend API: http://localhost:5000

🤖 AI Assistant Example Commands
You can ask the assistant via voice or text:

“Show me all available cameras for rent”

“What’s the cheapest drill machine?”

“Book a projector for tomorrow”

“Compare this price with the market”

🎯 MVP Scope for Hackathon
Core rental flow: Browse → Select → Rent → Payment simulation

AI assistant: Voice & text chat providing product information

Odoo backend sync: Real-time fetching of product data

AI price comparison: Insights on price worthiness for rental items
