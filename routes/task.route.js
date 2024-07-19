import { Router } from "express";
import { getAllTasks } from "../controllers/task.controller.js";

const taskRouter = Router();

taskRouter.post("/allTasks/:projectId", getAllTasks);

export default taskRouter;
