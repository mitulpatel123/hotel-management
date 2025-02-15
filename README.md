# Hotel Management System

A centralized platform for managing hotel issues, complaints, reminders, and maintenance problems with real-time updates.

## Features

- Real-time Updates using WebSocket
- Property PIN Authentication
- Public Dashboard with Pass-ons, Complaints, and Reminders
- Maintenance Issue Tracking
- Admin Panel with User Management
- Action Logging System

## Prerequisites

1. Node.js (v14 or higher)
2. MongoDB (v4.4 or higher)
3. npm or yarn package manager

## Setup Instructions

### MongoDB Setup

1. Install MongoDB Community Edition from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   - Windows: MongoDB should run automatically as a service
   - Linux/Mac: Run `sudo service mongod start`
3. Verify MongoDB is running on port 27017

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/hotel-management
   JWT_SECRET=your_secure_jwt_secret_key
   PROPERTY_PIN=47123
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Usage

1. Access the application at `http://localhost:3000`
2. Enter the property PIN: `11111`
3. Login with your credentials or register a new account
4. For admin access, create an admin account through the MongoDB shell or ask an existing admin to create one

## Tech Stack

- Frontend:
  - React.js
  - Material UI
  - Socket.IO Client
- Backend:
  - Node.js
  - Express.js
  - Socket.IO
  - MongoDB with Mongoose
- Authentication:
  - JWT
  - Property PIN

## Real-time Features

- Instant updates for dashboard items
- Live maintenance issue tracking
- Real-time user management
- Immediate activity log updates
- Live statistics in admin panel
