import { Router } from "express";
import {
  createTask,
  createTaskGroup,
  fetchAllTasks,
  personalTasks,
  updatePersonalTasks,
  updateStatusTasks,
} from "../controllers/task.controller.js";
import { multerUpload } from "../config/cloudinaryConfig.js";
import { uploadMultipleTaskFiles } from "../controllers/upload.controller.js";

const taskRouter = Router();

taskRouter.post(
  "/upload/MultiTaskFile/:projectId",
  multerUpload.array("multiTaskFile", 10),
  uploadMultipleTaskFiles
);

taskRouter.get("/:departmentId/:projectId", fetchAllTasks);
taskRouter.post("/taskGroups/:projectId", createTaskGroup);
taskRouter.post("/:departmentId/:projectId", createTask);
taskRouter.get("/personalTask", personalTasks);
taskRouter.put("/:taskId", updatePersonalTasks);
taskRouter.put("/status/:taskId", updateStatusTasks);

export default taskRouter;
