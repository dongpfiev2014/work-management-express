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
    emailVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
    },
    companies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "companies",
      },
    ],
    companyName: {
      type: String,
    },
    jobTitle: {
      type: String,
    },
    dateOfBirth: {
      type: String,
    },
    address: {
      type: String,
    },
    telephoneNumber: {
      type: String,
    },
    gender: {
      type: String,
    },
    nationality: {
      type: String,
    },
    education: {
      type: String,
    },
    bio: {
      type: String,
    },
    role: [
      {
        type: String,
        enum: ["manager", "employee"],
      },
    ],
    position: [
      {
        type: String,
      },
    ],
  },
  {
    // getTimestampsConfig()
    timestamps: true,
  }
);

export default ProfileSchema;
