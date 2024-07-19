import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    taskName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "departments",
      required: true,
    },
    status: {
      type: String,
      enum: ["TO DO", "WORK IN PROGRESS", "UNDER REVIEW", "COMPLETED"],
      default: "Pending",
    },
    priority: {
      type: String,
      enum: ["Important", "Urgent", "Critical", "Neither"],
      default: "Medium",
    },
    dueDate: {
      type: Date,
      required: true,
    },
  },
  {
    // getTimestampsConfig()
    timestamps: true,
  }
);

export default TaskSchema;
