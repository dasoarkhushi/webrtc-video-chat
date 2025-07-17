const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: "*" }));

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);

    const clients = io.sockets.adapter.rooms.get(roomId);
    const numClients = clients ? clients.size : 0;

    if (numClients === 2) {
      socket.to(roomId).emit("ready");
    }
  });

  socket.on("offer", (offer, room) => {
    console.log("Offer sent to room:", room);
    socket.to(room).emit("offer", offer);
  });

  socket.on("answer", (answer, room) => {
    console.log("Answer sent to room:", room);
    socket.to(room).emit("answer", answer);
  });

  socket.on("ice-candidate", (candidate, room) => {
    console.log("ICE Candidate sent to room:", room);
    socket.to(room).emit("ice-candidate", candidate);
  });

  socket.on("disconnecting", () => {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        socket.to(room).emit("user-disconnected", socket.id);
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
