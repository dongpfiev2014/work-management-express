import mongoose from "mongoose";
import Collections from "../../database/collection.js";
import TaskSchema from "./task.schema.js";
import TaskGroupSchema from "./taskGroup.schema.js";

const TaskModel = mongoose.model(Collections.TASKS, TaskSchema);
const TaskGroupModel = mongoose.model(Collections.TASKGROUPS, TaskGroupSchema);

export { TaskModel, TaskGroupModel };
