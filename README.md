# Video Platform Backend API

A robust, full-featured backend API for a video hosting platform (similar to YouTube). Built with **Node.js, Express.js, and MongoDB**, this project provides comprehensive and highly scalable endpoints for managing users, videos, comments, likes, subscriptions, and customized playlists.

## 🚀 Features

### 👤 User Management & Authentication
- Secure user registration and login using `bcrypt` for password hashing.
- Highly secure JWT-based authentication system featuring both **Access and Refresh Tokens**.
- User session configuration and secure logout function.
- Update profile details and manage assets like avatars and cover images asynchronously via **Cloudinary**.
- Get customized channel layouts using custom handles (usernames).

### 📹 Video Management
- Secure file-handling endpoints for uploading, updating, and deleting videos using **Multer**.
- View count tracking and public/private publishing controls.
- Advanced querying, searching algorithms, and pagination support utilizing `mongoose-aggregate-paginate-v2`.

### 💬 Engagement & Interactivity
- **Likes**: Engage with content by liking or unliking videos, comments, and community posts.
- **Comments**: Full CRUD functionality on comments directly mapped under videos.
- **Subscriptions**: Subscribe/Unsubscribe functionality to creator channels.
- Aggregate complex data to fetch subscriber counts, user subscription lists, and watch history organically.

### 📚 Playlists
- Create, manage, and organize dynamic video playlists.
- Easily add or remove individual videos from custom playlists configurations.

### 📊 Channel Dashboard
- Fetch detailed channel-specific analytics.
- Retrieve total subscriber counts, global video counts, total profile likes, and overall traffic/views seamlessly via **MongoDB Aggregation Pipelines**.

## 🛠️ Technology Stack
- **Runtime Environment:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB & Mongoose ORM
- **Authentication:** JSON Web Tokens (JWT) & bcrypt
- **File Handling & Cloud Storage:** Multer & Cloudinary
- **Environment Configuration:** dotenv

## 📂 Project Structure

```text
src/
├── controllers/    # Contains all core business logic and route behaviors
├── db/             # Database connection setups and configuration
├── middlewares/    # Custom middlewares (e.g., authentication checks, Multer configuration)
├── models/         # Complex Mongoose schema definitions (User, Video, Like, etc.)
├── routes/         # Express API route mapping and aggregation
├── utils/          # Standard utility classes (ApiError, ApiResponse, asyncHandler)
└── index.js        # Main entry point and server startup script
```

## ⚙️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) installed globally on your machine.
- A running [MongoDB](https://www.mongodb.com/) cluster or local connection URI.
- [Cloudinary](https://cloudinary.com/) API credentials (Cloud Name, API Key, API Secret).

### Installation

1. **Navigate to the PracticeCode directory:**
```bash
cd PracticeCode
```

2. **Install all required dependencies:**
```bash
npm install
```

3. **Environment Setup:**
Create a `.env` file in the root directory (alongside `package.json`) following the provided configuration requirements:
```env
PORT=8000
MONGODB_URI=<your_mongodb_connection_string>
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=<your_secure_access_token>
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=<your_secure_refresh_token>
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
```

4. **Run the Development Server:**
```bash
npm run dev
```

The server will kickstart gracefully with `nodemon`, enabling live reloads upon future file saves, and parsing operations with modern ES6 module imports.
