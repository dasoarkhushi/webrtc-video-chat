# WebRTC Video Chat Application

This is a full-stack peer-to-peer video chat application built with React, Socket.io, and WebRTC. It allows two users to connect via a shared room ID and initiate a secure video and audio connection in real-time.

---

## Features

- Peer-to-peer video and audio communication
- Join by Room ID
- Toggle microphone and camera during call
- Notification when another user joins the room
- Responsive and clean UI
- Compatible across desktop and mobile browsers

---

## Technologies Used

**Frontend:**
- React
- Socket.io-client
- WebRTC APIs

**Backend:**
- Node.js
- Express
- Socket.io
- CORS

---

## Getting Started (Local Setup)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/webrtc-video-chat.git
cd webrtc-video-chat
```

### 2. Backend Setup

```bash
cd backend
npm install
node server.js
```

- Runs on `http://localhost:3000`

### 3. Frontend Setup

In a separate terminal:

```bash
cd frontend
npm install
npm start
```

- Opens at `http://localhost:3001`

### 4. Test

- Open on two devices (same Wi-Fi).
- Enter same Room ID to start the chat.

---

## Deployment

### Backend: Render.com

- Create new Web Service
- Set Root Directory to `backend`
- Start Command: `node server.js`
- Expose Port 3000

### Frontend: Vercel.com

- Import frontend from GitHub or upload manually
- Set Root Directory to `frontend`
- Change Socket URL in `src/App.js` to:
```js
const socket = io("https://your-backend.onrender.com");
```

---

## License

MIT License
