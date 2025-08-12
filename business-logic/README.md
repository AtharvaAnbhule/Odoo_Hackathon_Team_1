# Rental Management System - Backend API

A comprehensive Node.js backend API for a rental management system built with Express.js and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Complete CRUD operations for users with different roles
- **Product Management**: Inventory management with categories and availability tracking
- **Booking System**: Full booking lifecycle management
- **Notification System**: Real-time notifications for users
- **Security**: Rate limiting, CORS, input validation, and error handling

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Email**: Nodemailer
- **File Upload**: Multer

## Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd server
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment Setup**
   \`\`\`bash
   cp .env.example .env
   \`\`\`

   Update the `.env` file with your configuration:
   \`\`\`env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/rental-management
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   BCRYPT_ROUNDS=12
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   FRONTEND_URL=http://localhost:3000
   \`\`\`

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Seed the database**
   \`\`\`bash
   npm run seed
   \`\`\`

6. **Start the server**
   \`\`\`bash

   # Development

   npm run dev

   # Production

   npm start
   \`\`\`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password/:token` - Reset password
- `PUT /api/auth/update-password` - Update password
- `POST /api/auth/logout` - Logout user

### Users

- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user (Admin only)
- `GET /api/users/admin/stats` - Get user statistics (Admin only)

### Products

- `GET /api/products` - Get all products (with filtering & pagination)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)
- `PATCH /api/products/:id/stock` - Update product stock (Admin/Staff)
- `GET /api/products/:id/availability` - Check product availability
- `GET /api/products/admin/stats` - Get product statistics (Admin only)

### Bookings

- `GET /api/bookings` - Get bookings (filtered by user role)
- `GET /api/bookings/:id` - Get single booking
- `POST /api/bookings` - Create booking (Customer)
- `PUT /api/bookings/:id` - Update booking (Admin/Staff)
- `PATCH /api/bookings/:id/cancel` - Cancel booking
- `GET /api/bookings/admin/stats` - Get booking statistics (Admin only)

### Categories

- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (Admin only)
- `PUT /api/categories/:id` - Update category (Admin only)
- `DELETE /api/categories/:id` - Delete category (Admin only)
- `GET /api/categories/admin/tree` - Get category tree

### Notifications

- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification
- `POST /api/notifications` - Create notification (Admin only)

## Database Models

### User

- Authentication and profile information
- Role-based access (customer, staff, admin)
- Password hashing and reset functionality

### Product

- Complete product information with categories
- Stock management and availability tracking
- Pricing and rental terms

### Booking

- Full booking lifecycle management
- Payment tracking and status updates
- Customer and product relationships

### Category

- Hierarchical category structure
- Product organization and filtering

### Notification

- User notifications with read/unread status
- Type-based categorization

## Authentication & Authorization

The API uses JWT tokens for authentication. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

### User Roles

- **Customer**: Can view products, create bookings, manage own profile
- **Staff**: Customer permissions + manage pickups/returns, update bookings
- **Admin**: Full access to all resources and management features

## Error Handling

The API includes comprehensive error handling with appropriate HTTP status codes:

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Security Features

- **Rate Limiting**: Prevents abuse with configurable limits
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers for protection
- **Input Validation**: Comprehensive request validation
- **Password Hashing**: Secure password storage with bcrypt
- **JWT Security**: Secure token generation and validation

## Testing

Test accounts are created during seeding:

- **Admin**: admin@rental.com / password123
- **Staff**: staff@rental.com / password123
- **Customer**: customer@rental.com / password123

## Development

### Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed` - Seed database with test data
- `npm test` - Run tests (when implemented)

### Project Structure

\`\`\`
server/
├── models/ # Mongoose models
├── routes/ # Express routes
├── middleware/ # Custom middleware
├── utils/ # Helper functions
├── scripts/ # Database scripts
├── server.js # Main server file
└── package.json # Dependencies
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
\`\`\`

Now let me add the frontend API routes to connect with the backend:
