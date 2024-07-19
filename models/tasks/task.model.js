import mongoose from "mongoose";
import Collections from "../../database/collection.js";
import TaskSchema from "./task.schema.js";

const TaskModel = mongoose.model(Collections.TASKS, TaskSchema);

export default TaskModel;
