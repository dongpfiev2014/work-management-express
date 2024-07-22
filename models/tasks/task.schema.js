import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
      required: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "departments",
      required: true,
    },
    taskGroup: {
      type: String,
    },
    taskName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "profiles",
      required: true,
    },
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "profiles",
        required: true,
      },
    ],

    status: {
      type: String,
      enum: ["TO DO", "WORK IN PROGRESS", "UNDER REVIEW", "COMPLETED"],
      default: "TO DO",
    },
    priority: {
      type: String,
      enum: ["Important", "Urgent", "Critical", "Neither"],
      default: "Neither",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    attachments: [
      {
        type: String,
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "comments",
        required: true,
      },
    ],
  },
  {
    // getTimestampsConfig()
    timestamps: true,
  }
);

TaskSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "COMPLETED") {
    this.completed = true;
  } else this.completed = false;
  next();
});

// Middleware pre-update to handle the case when using findOneAndUpdate
TaskSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.status === "COMPLETED") {
    update.completed = true;
  } else update.completed = false;
  next();
});

export default TaskSchema;
