# 🌐 Real-Time Collaboration Platform

A real-time web application where users can connect, communicate, and collaborate through chat and a shared code editor using Socket.IO.

---

## 🚀 Live Demo
(https://storied-mermaid-0b8a07.netlify.app/)

---

## 📌 Features

### 🔐 Private Room
- Create or join a private room using Room ID
- Host control system (only one user can edit at a time)
- Control can be transferred to other participants
- Real-time code editor collaboration
- Live chat for discussion

---

### 🌍 Public Room (Proximity-Based)
- Users can join based on nearby radius (<100m)
- Real-time group chat with nearby users
- Discover and connect with people around you
- Option to start a private session for focused collaboration

---

### ⚡ Real-Time Capabilities
- Instant messaging using Socket.IO
- Live code synchronization
- User presence detection

---

## 🧠 Tech Stack

### Frontend
- React.js
- Socket.IO Client
- CSS / Tailwind 

### Backend
- Node.js
- Express.js
- Socket.IO

---

## ⚙️ How It Works

1. User selects:
   - Public Room
   - Private Room

2. Private Room:
   - Host creates room ID
   - Others join using the same ID
   - Host controls code editor

3. Public Room:
   - Location access is taken
   - Nearby users are connected
   - Chat and interaction enabled

---

