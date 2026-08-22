// Socket.IO layer for live chat. Each authenticated connection joins a room
// named after the user's id, so pushing to one person is just a room emit —
// no socket-id bookkeeping to keep in sync.
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  // The token travels in the handshake rather than a header, because the
  // browser can't set headers on a WebSocket upgrade.
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) return next(new Error("No token provided"));

    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(socket.user.id);
  });

  return io;
};

export const emitToUser = (userId, event, payload) => {
  // Chat still works over plain REST if sockets never came up, so a missing
  // io is a no-op rather than a crash.
  io?.to(userId).emit(event, payload);
};
