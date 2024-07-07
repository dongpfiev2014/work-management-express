import mongoose from "mongoose";
import { getTimestampsConfig } from "../../utils/timestamps.js";

const UserSchema = new mongoose.Schema(
  {
    email: {
      required: true,
      type: String,
      unique: true,
    },
    password: {
      required: true,
      type: String,
    },
    userRole: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  getTimestampsConfig()
);

export default UserSchema;
