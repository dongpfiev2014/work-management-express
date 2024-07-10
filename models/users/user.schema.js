import mongoose from "mongoose";

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
  {
    // getTimestampsConfig()
    timestamps: true,
  }
);

export default UserSchema;
