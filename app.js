import express from "express";
import http from "http";
import dotenv from "dotenv";
import connectDB from "./utils/connectDB.js";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import {
  verifyUserAuthentication,
  verifyUserAuthorization,
} from "./middlewares/auth.middleware.js";
import { getAdminPage } from "./controllers/user.controller.js";
import cors from "cors";
import profileRouter from "./routes/profile.route.js";
import companyRouter from "./routes/company.route.js";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import requestRouter from "./routes/request.route.js";
import memberRouter from "./routes/member.route.js";
import departmentRouter from "./routes/department.route.js";
import projectRouter from "./routes/projects.route.js";
import taskRouter from "./routes/task.route.js";
import commentRouter from "./routes/comment.route.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: `${process.env.CLIENT_URL}:${process.env.CLIENT_PORT}`,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Authorization",
    ],
    credentials: true,
  },
});

app.use(express.json());
app.use(
  cors({
    origin: `${process.env.CLIENT_URL}:${process.env.CLIENT_PORT}`,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Authorization",
    ],
    credentials: true,
  })
);

app.use("/api/v1/auth", authRouter);

app.use(verifyUserAuthentication);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/company", companyRouter);
app.use("/api/v1/request", requestRouter);
app.use("/api/v1/members", memberRouter);
app.use("/api/v1/departments", departmentRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/comments", commentRouter);
app.get("/api/v1/admin", verifyUserAuthorization, getAdminPage);

const PORT = process.env.SERVER_PORT || 3000;
connectDB().then(() => {
  server
    .listen(PORT, () => {
      console.log(
        `Server is running on ${process.env.SERVER_URL}:${process.env.SERVER_PORT}`
      );
    })
    .on("error", (err) => {
      // console.error("Failed to start server:", err);
    });
});

// Socket.io events

// app.post("/api/v1/notifications/join-request", (req, res) => {
//   const { userId, organizationId, position, reason, role } = req.body;

//   const joinRequest = {
//     userId,
//     organizationId,
//     position,
//     reason,
//     role,
//     id: uuidv4(),
//   };

//   io.to("admins").emit("join-request", joinRequest);
//   res.status(200).send("Join request sent to admin");
// });

io.on("connection", (socket) => {
  // console.log(`Client connected: ${socket.id}`);

  socket.on("join-request", (data) => {
    const { userId, fullName, organizationId, position, reason, role, avatar } =
      data;
    const joinRequest = {
      userId,
      fullName,
      organizationId,
      position,
      reason,
      role,
      avatar,
      id: uuidv4(),
    };
    socket.organizationId = organizationId;
    io.to("admin-room").emit("join-request", joinRequest);
  });

  socket.on("join-admin", (data) => {
    const { userId } = data;
    socket.join("admin-room", { message: "Welcome bro" });
  });

  socket.on("approve-request", (data) => {
    // console.log("Request approved:", data);

    io.emit("request-approved", data);
  });

  socket.on("disconnect", () => {
    // console.log(`Clients disconnected: ${socket.id}`);
  });
});
