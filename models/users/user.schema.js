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
    roles: [{ type: String }],
  },
  getTimestampsConfig()
);

export default UserSchema;
