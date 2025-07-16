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
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  socket.on("join", (roomId) => {
    socket.join(roomId);
    const clients = io.sockets.adapter.rooms.get(roomId);
    if (clients && clients.size > 1) {
      socket.to(roomId).emit("ready");
    }

    socket.on("offer", (offer, room) => {
      socket.to(room).emit("offer", offer);
    });

    socket.on("answer", (answer, room) => {
      socket.to(room).emit("answer", answer);
    });

    socket.on("ice-candidate", (candidate, room) => {
      socket.to(room).emit("ice-candidate", candidate);
    });

    socket.on("disconnect", () => {
      socket.broadcast.emit("user-disconnected");
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
