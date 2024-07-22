import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tasks",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "profiles",
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  {
    // getTimestampsConfig()
    timestamps: true,
  }
);

export default CommentSchema;
