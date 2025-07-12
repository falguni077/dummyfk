# ReWear - Community Clothing Exchange

A web-based platform that enables users to exchange unused clothing through direct swaps or a point-based redemption system. Promoting sustainable fashion and reducing textile waste.

## Features

- **User Authentication**: Email/password signup and login
- **Landing Page**: Platform introduction with featured items carousel
- **User Dashboard**: Profile details, points balance, and swap management
- **Item Detail Page**: Image gallery, descriptions, and swap/redeem options
- **Add New Item**: Upload images and item details
- **Admin Panel**: Moderate and approve/reject item listings

## Quick Start

1. **Install Dependencies**:
   ```bash
   npm run install-all
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Access the Application**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## Project Structure

```
rewear-clothing-exchange/
├── client/          # React frontend
├── server/          # Node.js/Express backend
├── package.json     # Root package.json
└── README.md        # This file
```

## Tech Stack

- **Frontend**: React, Tailwind CSS, React Router
- **Backend**: Node.js, Express, MongoDB
- **Authentication**: JWT tokens
- **File Upload**: Multer
- **Database**: MongoDB (with Mongoose ODM)

## Development Timeline

This project is designed to be completed within 8 hours for the Odoo hackathon. 