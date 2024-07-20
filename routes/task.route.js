import { Router } from "express";
import {
  createTask,
  createTaskGroup,
  getAllTasks,
} from "../controllers/task.controller.js";
import { multerUpload } from "../config/cloudinaryConfig.js";
import { uploadMultipleTaskFiles } from "../controllers/upload.controller.js";

const taskRouter = Router();

taskRouter.get("/:projectId", getAllTasks);
taskRouter.post("/taskGroups/:projectId", createTaskGroup);
taskRouter.post("/:projectId", createTask);
taskRouter.post(
  "/uploadMultiTaskFile/:projectId",
  multerUpload.array("multiTaskFile", 10),
  uploadMultipleTaskFiles
);

export default taskRouter;
