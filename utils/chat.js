// const io = require("socket.io")(3000);
// io.on("connection", (socket) => {
//   console.log(`Client connected: ${socket.id}`);
//   // Sự kiện khi người dùng tham gia vào một phòng chat
//   socket.on("join-room", ({ roomId, userId }) => {
//     socket.join(roomId);
//     socket.roomId = roomId; // Gán roomId vào đối tượng socket để truy cập sau này
//     console.log(`${userId} joined room ${roomId}`);
//     io.in(roomId).emit("user-joined", { userId }); // Thông báo cho các user khác trong phòng rằng có user mới tham gia
//   });
//   // Sự kiện gửi tin nhắn trong phòng chat
//   socket.on("send-message", ({ message, userId }) => {
//     const roomId = socket.roomId;
//     io.in(roomId).emit("receive-message", { message, userId });
//     console.log(`Message from ${userId} in room ${roomId}: ${message}`);
//   });
//   // Sự kiện khi người dùng rời phòng hoặc ngắt kết nối
//   socket.on("leave-room", ({ roomId, userId }) => {
//     socket.leave(roomId);
//     console.log(`${userId} left room ${roomId}`);
//     io.in(roomId).emit("user-left", { userId }); // Thông báo cho các user khác trong phòng rằng user đã rời đi
//   });
//   // Khi socket ngắt kết nối
//   socket.on("disconnect", () => {
//     console.log(`Client disconnected: ${socket.id}`);
//     const roomId = socket.roomId;
//     if (roomId) {
//       io.in(roomId).emit("user-disconnected", { socketId: socket.id });
//     }
//   });
// });
