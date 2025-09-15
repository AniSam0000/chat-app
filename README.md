💬 Chat-app - Real-Time MERN Chat Application
Chat-app is a full-stack, real-time messaging application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO. It provides a seamless and interactive chatting experience with features like user authentication, real-time messaging, online user status, and image sharing.

## Key Features
User Authentication: Secure user registration and login system using JWT (JSON Web Tokens).

Real-Time Messaging: Instant message delivery and updates powered by Socket.IO.

"WhatsApp-Like" Sidebar: The conversation list automatically reorders to show the most recent chat at the top.

Online User Status: See which users are currently online.

Seen/Unread Status: Messages are marked as seen when a user opens the conversation. Unread message counts are displayed in the sidebar.

Image Sharing: Users can send and receive images, which are hosted using the Cloudinary service.

Message Deletion: Users can delete their own messages via a custom right-click context menu.

Responsive Design: A clean and modern UI that works on various screen sizes.

## Tech Stack
Backend
Node.js: JavaScript runtime environment.

Express: Web framework for Node.js.

MongoDB: NoSQL database for storing user and message data.

Mongoose: Object Data Modeling (ODM) library for MongoDB.

Socket.IO: Library for real-time, bidirectional event-based communication.

JWT: For secure user authentication.

Cloudinary: For cloud-based image storage and management.

Frontend
React: JavaScript library for building user interfaces.

Socket.IO Client: To connect to the real-time server.

Axios: For making HTTP requests to the backend API.

React Hot Toast: For user-friendly notifications.

Context API: For global state management (authentication, chat state).
