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

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
