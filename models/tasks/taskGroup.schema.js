import mongoose from "mongoose";

const TaskGroupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
      required: true,
    },
    tasks: [],
  },
  {
    // getTimestampsConfig()
    timestamps: true,
  }
);

export default TaskGroupSchema;
