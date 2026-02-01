# 🔌 ReBookz Backend API

This is the **Server-Side API** powering the ReBookz ecosystem (Mobile App & Admin Panel).
It handles all data storage, authentication, and business logic.

---

## 🧠 Core Features

*   **RESTful API**: Standardized endpoints for Resources (Books, Users, Categories).
*   **Authentication**: JWT-based auth + OTP (One-Time Password) logic.
*   **Image Handling**: Uploads and serves book images.
*   **Database**: Connects to MongoDB for scalable data storage.
*   **Security**: Password hashing (bcrypt) and protected routes.

---

## 🛠️ Tech Stack

*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (Mongoose)
*   **Language**: TypeScript

---

## 🏁 How to Run Locally

### Prerequisites
*   Node.js installed.
*   MongoDB Connection String (URI).

### Steps

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    *   Ensure you have a `.env` file in the root directory (Gitignored for security).
    *   It should contain:
        ```env
        PORT=5001
        MONGO_URI=your_mongodb_connection_string
        JWT_SECRET=your_secret_key
        ```

3.  **Start the Server**:
    ```bash
    npm run dev
    ```
    *(Runs with Nodemon for auto-restart on changes)*

---

## 📡 API Endpoints Overview

*   `POST /api/users/login` - User Login
*   `POST /api/users/send-otp` - Send Phone OTP
*   `GET /api/books` - Get all books (with filters)
*   `GET /api/categories` - Get category tree
*   `POST /api/upload` - Upload images

---

**Deployment Tip**: When deploying to services like Render/Railway, ensure you add the Environment Variables in their dashboard settings.
