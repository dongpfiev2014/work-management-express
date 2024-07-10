import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true,
    },
    userRole: {
      type: String,
      ref: "users",
    },
    email: {
      required: true,
      type: String,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    bio: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    nationality: {
      type: String,
    },
    education: {
      type: String,
    },
  },
  {
    // getTimestampsConfig()
    timestamps: true,
  }
);

export default ProfileSchema;
