# 📘 Real-Time Chat System (Operator ↔ Client) — Full Project Specification

## 1. 🧠 Overview

This project is a **real-time chat system** integrated with an existing **CRM platform** and multiple **e-commerce websites**.

The system enables:

- Clients (website visitors) to initiate chats
- Operators to respond in real-time
- Super Admin to monitor, manage, and intervene

---

## 2. 🏗️ Tech Stack

### Backend

- Node.js (NestJS recommended for structure)
- WebSocket (Socket.IO or WS)
- REST API (for non-realtime operations)
- Redis (for presence & pub/sub)
- MySQL

### Frontend

- Next.js (Operator Dashboard + Admin Panel)
- TailwindCSS (UI)
- Socket.IO Client

---

## 3. 👥 Roles & Permissions

### 3.1 Super Admin

- Full system access
- Create/manage operators
- Monitor all chat rooms
- Join any chat room
- View statistics and logs
- See operator status (online/offline in real-time)

---

### 3.2 Operator

- Login via email/password
- Set status (online/offline)
- Receive incoming chat requests
- Join/leave chat rooms
- Send/receive messages
- View chat history

---

### 3.3 Client (Website Visitor)

- No authentication required
- Automatically assigned a session
- Can:
  - Open chat
  - Send messages
  - Receive responses

---

## 4. 💬 Core Features

---

### 4.1 Chat Initialization

**Flow:**

1. Client opens chat widget on e-commerce site
2. System:
   - Creates a unique `room_id`
   - Assigns temporary `client_id`

3. Room status: `waiting`

---

### 4.2 Operator Assignment

**Modes (configurable):**

- Auto-assignment (round-robin / least busy)
- Manual pickup (operator selects room)

---

### 4.3 Real-Time Messaging

- WebSocket-based communication
- Events:
  - `message:send`
  - `message:receive`
  - `user:typing`
  - `user:joined`
  - `user:left`

---

### 4.4 Room Lifecycle

| State   | Description                         |
| ------- | ----------------------------------- |
| waiting | Client opened chat, no operator yet |
| active  | Operator joined                     |
| closed  | All participants left               |

**Auto-close logic:**

- If all users leave → room closes after timeout (e.g. 2 min)

---

### 4.5 Presence System (Real-Time)

Tracked via Redis:

- Operator:
  - online
  - offline
  - busy

- Super Admin Dashboard:
  - See all operator statuses live

---

### 4.6 Chat History

Stored in DB:

- Messages
- Participants
- Timestamps

Used for:

- Analytics
- Re-opening chats
- CRM integration

---

### 4.7 CRM Integration

Each chat session:

- Linked to CRM user (if identified)
- Stores:
  - client metadata
  - order/session info
  - previous chats

---

## 5. 🧱 System Architecture

```
Client Widget (E-commerce Site)
        ↓
WebSocket Gateway (Node.js)
        ↓
Chat Service Layer
        ↓
Database (PostgreSQL)
        ↓
Redis (Presence + Queue)
        ↓
Operator Dashboard (Next.js)
        ↓
Admin Panel (Next.js)
```

---

## 6. 📡 WebSocket Events Design

### Client → Server

```json
{
  "event": "message:send",
  "data": {
    "room_id": "123",
    "message": "Hello"
  }
}
```

### Server → Operator

```json
{
  "event": "room:new",
  "data": {
    "room_id": "123"
  }
}
```

### Presence

```json
{
  "event": "operator:status",
  "data": {
    "operator_id": 1,
    "status": "online"
  }
}
```

---

## 7. 🗄️ Database Design

### Users Table

```
id
email
password
role (admin/operator)
status
created_at
```

---

### Rooms Table

```
id
client_id
status (waiting/active/closed)
created_at
closed_at
```

---

### Messages Table

```
id
room_id
sender_type (client/operator/admin)
sender_id
message
created_at
```

---

### Operator Sessions

```
id
operator_id
status
last_seen
```

---

## 8. 🔐 Authentication

- Operators/Admin:
  - JWT-based authentication
  - Login via email/password

- Clients:
  - Anonymous session (UUID)
  - Stored in cookies

---

## 9. 📊 Admin Features

- Live dashboard:
  - Active chats
  - Waiting chats
  - Online operators

- Ability to:
  - Join any room
  - Reassign operators
  - Close rooms manually

- Analytics:
  - Chats per day
  - Avg response time
  - Operator performance

---

## 10. ⚙️ Scaling Strategy

### Horizontal Scaling

- Multiple Node.js instances
- Use Redis Pub/Sub for syncing sockets

### Load Balancer

- Sticky sessions OR shared Redis adapter

---

## 11. 🧪 Edge Cases

- Operator disconnects mid-chat
  → Reassign or mark room waiting

- Client refreshes page
  → Reconnect to same room via session

- No operators online
  → Show “leave message” mode

- Multiple operators join
  → Allowed (for supervision)

---

## 12. 🧩 Future Enhancements

- File/image sending
- Chatbot AI integration
- Multi-language support
- Voice messages
- SLA timers
- Notifications (Telegram / Email)

---

## 13. 🚀 Development Phases

### Phase 1 (MVP)

- Chat rooms
- Messaging
- Operator dashboard
- Basic admin panel

### Phase 2

- CRM integration
- Analytics
- Presence system

### Phase 3

- Scaling
- Advanced features

---

## 14. 🎯 Summary

This system acts as a **centralized communication layer** between:

- Multiple e-commerce platforms
- Operators
- CRM system

It ensures:

- Real-time interaction
- Full visibility
- Scalable architecture
