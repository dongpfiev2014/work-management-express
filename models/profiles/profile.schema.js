import mongoose from "mongoose";
import { getTimestampsConfig } from "../../utils/timestamps";

const ProfilesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
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
  getTimestampsConfig()
);

export default ProfilesSchema;
