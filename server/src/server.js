import "./config/env.js";

import http from "http";

import app from "./app.js";
import connectDB from "./config/db.js";
import { initSocket } from "./socket.js";

const PORT = process.env.PORT || 5000;

// Socket.IO needs the raw http server, so Express is wrapped rather than
// calling app.listen() directly.
const server = http.createServer(app);

initSocket(server);

// Without this, a busy port throws an unhandled 'error' event and buries the
// cause under a net.js stack trace. Nearly always a previous run that never
// exited, so say that outright.
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `\nPort ${PORT} is already in use — an earlier server is still running.\n` +
        `  Windows:  netstat -ano | findstr :${PORT}   then  taskkill /PID <pid> /F\n` +
        `  macOS/Linux:  lsof -ti:${PORT} | xargs kill\n` +
        `Or set a different PORT in .env\n`
    );
    process.exit(1);
  }

  throw err;
});

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
