import express from "express";
import dotenv from "dotenv";
import connectDB from "./utils/connectDB.js";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import {
  verifyUserAuthentication,
  verifyUserAuthorization,
} from "./middlewares/auth.middleware.js";
import { getAdminPage } from "./controllers/user.controller.js";
// import multer from "multer";
// import bodyParser from "body-parser";
// import cors from "cors";
// import { v2 as cloudinary } from "cloudinary";

dotenv.config();

// cloudinary.config({
//   cloud_name: "dq4kbmkrf",
//   api_key: "268696593414899",
//   api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View Credentials' below to copy your API secret
// });

const app = express();
// app.use(cors());
app.use(express.json());
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// app.post("/api/v1/upload", upload.single("file"), (req, res) => {
//   const file = req.file;
//   console.log(file);
//   try {
//     if (!file) {
//       throw new Error("File not found");
//     }
//     const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString(
//       "base64"
//     )}`;
//     const fileName = file.originalname.split(".")[0];
//     console.log(dataUrl);
//     console.log(fileName);

//     cloudinary.uploader.upload(
//       dataUrl,
//       {
//         public_id: fileName,
//         resource_type: "auto",
//         folder: "images",
//       },
//       (err, result) => {
//         if (err) {
//           console.log(err);
//           throw new Error("Error uploading");
//         }
//         if (result) {
//           console.log(result);
//           res.status(200).send({
//             data: file,
//             message: "Uploaded successfully",
//             dataUrl: result.secure_url,
//           });
//         }
//       }
//     );
//   } catch (error) {
//     res.status(500).send({
//       data: null,
//       success: false,
//       message: error.message,
//     });
//   }
// });

app.use("/api/v1/auth", authRouter);

app.use(verifyUserAuthentication);
app.use("/api/v1/users", userRouter);
app.get("/api/v1/admin", verifyUserAuthorization, getAdminPage);

connectDB().then(() => {
  app
    .listen(process.env.SERVER_PORT, () => {
      console.log(
        `Server is running on ${process.env.SERVER_URL}:${process.env.SERVER_PORT}`
      );
    })
    .on("error", (err) => {
      console.error("Failed to start server:", err);
    });
});
