# ReWear - Community Clothing Exchange Platform

## 🎯 Project Overview

ReWear is a full-stack web application that enables users to exchange unused clothing through direct swaps or a point-based redemption system. The platform promotes sustainable fashion and reduces textile waste by encouraging users to reuse wearable garments instead of discarding them.

## ✨ Features Implemented

### 🔐 User Authentication
- Email/password registration and login
- JWT-based authentication
- Protected routes for authenticated users
- User profile management

### 🏠 Landing Page
- Modern, responsive design with hero section
- Platform introduction and value proposition
- Featured items carousel
- Call-to-action buttons: "Start Swapping", "Browse Items", "List an Item"
- Sustainability messaging

### 👤 User Dashboard
- Profile details and points balance display
- Uploaded items overview with status tracking
- Ongoing and completed swaps management
- Tabbed interface for different sections
- Quick actions for item management

### 🛍️ Item Management
- **Browse Items**: Search, filter, and pagination
- **Item Detail Page**: Image gallery, full descriptions, swap options
- **Add New Item**: Multi-image upload, comprehensive form fields
- Item status tracking (pending, approved, rejected, available, swapped)

### 🔄 Swap System
- **Direct Swaps**: Exchange items between users
- **Point-based Redemption**: Use points to acquire items
- Swap request management (send, accept, reject, cancel)
- Real-time status updates

### 👨‍💼 Admin Panel
- Item moderation (approve/reject pending items)
- Platform statistics and analytics
- User management capabilities
- Content oversight and removal

### 🎨 Modern UI/UX
- Responsive design for all devices
- Clean, intuitive interface
- Loading states and error handling
- Toast notifications for user feedback
- Image upload with preview

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing
- **express-validator** for input validation

### Frontend
- **React 18** with functional components and hooks
- **React Router** for navigation
- **Axios** for API communication
- **React Icons** for UI icons
- **React Hot Toast** for notifications
- Custom CSS with utility classes (Tailwind-like)

### Development Tools
- **Concurrently** for running multiple servers
- **Nodemon** for backend development
- **React Scripts** for frontend development

## 📁 Project Structure

```
rewear-clothing-exchange/
├── server/                 # Backend API
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Authentication middleware
│   ├── uploads/           # Image storage
│   └── index.js           # Server entry point
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── App.js         # Main app component
│   └── public/            # Static assets
├── package.json           # Root package.json
├── setup.js              # Automated setup script
├── start.bat             # Windows startup script
└── README.md             # Project documentation
```

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running on localhost:27017)
- npm or yarn package manager

### Installation Steps

1. **Clone and Setup**
   ```bash
   # Run the automated setup script
   node setup.js
   ```

2. **Manual Setup (if needed)**
   ```bash
   # Install dependencies
   npm run install-all
   
   # Create uploads directory
   mkdir server/uploads
   
   # Create .env file
   echo "PORT=5000
   MONGODB_URI=mongodb://localhost:27017/rewear
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development" > server/.env
   ```

3. **Start Development Servers**
   ```bash
   # Windows
   start.bat
   
   # Or manually
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📊 Database Models

### User Model
- Email, password, name
- Points balance (default: 100)
- Role (user/admin)
- Profile information (bio, location, avatar)

### Item Model
- Title, description, category, type, size, condition
- Images array, points value
- Owner reference, status tracking
- Additional details (brand, color, material, tags)

### Swap Model
- Requester and item references
- Swap type (direct/points)
- Status tracking (pending, accepted, rejected, completed)
- Messages and notes

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Items
- `GET /api/items` - Browse items with filters
- `GET /api/items/featured` - Get featured items
- `GET /api/items/:id` - Get single item
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `GET /api/items/user/me` - Get user's items

### Swaps
- `POST /api/swaps` - Create swap request
- `GET /api/swaps/my-requests` - Get user's swap requests
- `GET /api/swaps/my-items` - Get swaps for user's items
- `PUT /api/swaps/:id/accept` - Accept swap
- `PUT /api/swaps/:id/reject` - Reject swap
- `PUT /api/swaps/:id/cancel` - Cancel swap

### Admin
- `GET /api/admin/items/pending` - Get pending items
- `PUT /api/admin/items/:id/approve` - Approve item
- `PUT /api/admin/items/:id/reject` - Reject item
- `DELETE /api/admin/items/:id` - Delete item
- `GET /api/admin/stats` - Get platform statistics

## 🎯 Development Timeline (8 Hours)

### Hour 1-2: Project Setup & Backend Foundation
- ✅ Project structure creation
- ✅ Database models (User, Item, Swap)
- ✅ Basic Express server setup
- ✅ Authentication middleware

### Hour 3-4: Backend API Development
- ✅ Authentication routes
- ✅ Item management routes
- ✅ Swap system routes
- ✅ Admin routes
- ✅ File upload functionality

### Hour 5-6: Frontend Foundation
- ✅ React app setup
- ✅ Authentication context
- ✅ Routing and navigation
- ✅ Landing page
- ✅ Login/Register pages

### Hour 7-8: Core Features & Polish
- ✅ Dashboard implementation
- ✅ Item browsing and details
- ✅ Add item functionality
- ✅ Swap request system
- ✅ Admin panel
- ✅ UI/UX improvements

## 🎨 Design Features

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimizations
- Flexible grid layouts

### User Experience
- Intuitive navigation
- Clear call-to-action buttons
- Loading states and feedback
- Error handling and validation

### Visual Design
- Clean, modern interface
- Consistent color scheme (green/blue theme)
- Professional typography
- Icon integration

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- File upload restrictions
- Protected routes and middleware

## 📈 Scalability Considerations

- Modular code structure
- Environment configuration
- Database indexing
- Image optimization
- API rate limiting ready

## 🚀 Deployment Ready

The application is structured for easy deployment:
- Environment variables configuration
- Static file serving
- Database connection flexibility
- Build scripts included

## 🎉 Success Metrics

This project successfully implements all required features:
- ✅ User authentication system
- ✅ Landing page with featured items
- ✅ User dashboard with profile management
- ✅ Item detail pages with swap options
- ✅ Add new item functionality
- ✅ Admin panel for moderation
- ✅ Modern, responsive UI
- ✅ Complete swap system (direct + points)

The platform is ready for users to start exchanging clothing sustainably! 