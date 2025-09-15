import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./route/userRoutes.js";
import messageRouter from "./route/messageRoutes.js";
import { Server } from "socket.io";

//Create Express server and HTTP server

const app = express();
const server = http.createServer(app); //usiing this bcoz socket.io support this

//Initialize socket.io server
export const io = new Server(server, {
  cors: { origin: "*" },
});

//Store online users
export const userSocketMap = {}; //{userId:socketid}

//Socket.io connection handler
io.on("connection", (socket) => {
  const userid = socket.handshake.query.userId;
  console.log("user connected", userid);

  if (userid) userSocketMap[userid] = socket.id;

  //Emit online users to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User disconected", userid);
    delete userSocketMap[userid];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

//Middleware setup
app.use(express.json({ limit: "4mb" }));
app.use(cors());

//Creating a testing server

//Routes Setup
app.use("/api/status", (req, res) => {
  res.send("Server is live");
});
app.use("/api/auth", userRouter); // User info router
app.use("/api/messages", messageRouter);

//Connect to mongodb
await connectDB();

if (process.env.NODE_ENV != "production") {
  const PORT = process.env.PORT || 5000;

  server.listen(PORT, () => {
    console.log("Server is running on port 5000");
  });
}

//Export server for Versel
export default server;
